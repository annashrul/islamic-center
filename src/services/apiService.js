import {
    QURAN_API_BASE,
    QURAN_AUDIO_CDN,
    ALADHAN_API_BASE,
    MUSLIM_SALAT_API_BASE,
    DOA_API_URL,
    ASMAUL_HUSNA_API_URL,
    ASMAUL_HUSNA_AUDIO_API,
    ASMAUL_HUSNA_AUDIO_BASE,
    ISLAMIC_API_KEY,
    HADITH_CDN_BASE,
    KISAH_NABI_API_URL,
    GOLD_PRICE_API_URL,
} from '../constants/apiUrls';
import { Platform } from 'react-native';

const formatTwoDigits = (num) => String(num).padStart(2, '0');

const formatDatePathSegment = (date) => `${formatTwoDigits(date.getDate())}-${formatTwoDigits(date.getMonth() + 1)}-${date.getFullYear()}`;

const parsePrayerDateValue = (value) => {
    if (typeof value !== 'string') return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
};

const parseTwelveHourToTwentyFourHour = (value) => {
    if (!value || typeof value !== 'string') return null;
    const match = value.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
    if (!match) return null;
    const hourRaw = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3];
    if (Number.isNaN(hourRaw) || Number.isNaN(minute)) return null;
    let hour = hourRaw % 12;
    if (period === 'pm') hour += 12;
    return `${formatTwoDigits(hour)}:${formatTwoDigits(minute)}`;
};

const normalizeMuslimSalatTimings = (item) => {
    if (!item) return null;
    const fajr = parseTwelveHourToTwentyFourHour(item.fajr);
    const sunrise = parseTwelveHourToTwentyFourHour(item.shurooq);
    const dhuhr = parseTwelveHourToTwentyFourHour(item.dhuhr);
    const asr = parseTwelveHourToTwentyFourHour(item.asr);
    const maghrib = parseTwelveHourToTwentyFourHour(item.maghrib);
    const isha = parseTwelveHourToTwentyFourHour(item.isha);
    if (!fajr || !dhuhr || !asr || !maghrib || !isha) return null;
    return {
        Fajr: fajr,
        Sunrise: sunrise || '',
        Dhuhr: dhuhr,
        Asr: asr,
        Maghrib: maghrib,
        Isha: isha,
    };
};

const getPrayerLocationQuery = async (latitude, longitude) => {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10&accept-language=id`,
            { headers: { Accept: 'application/json', 'User-Agent': 'islamic-center-app/1.0' } }
        );
        const data = await res.json();
        const address = data?.address || {};
        const query = address.city || address.town || address.county || address.state || '';
        return query || `${latitude},${longitude}`;
    } catch (e) {
        return `${latitude},${longitude}`;
    }
};

const fetchPrayerTimesFromMuslimSalat = async (latitude, longitude, date = new Date()) => {
    const query = await getPrayerLocationQuery(latitude, longitude);
    const encodedQuery = encodeURIComponent(query);
    const datePath = formatDatePathSegment(date);
    const res = await fetch(`${MUSLIM_SALAT_API_BASE}/${encodedQuery}/${datePath}.json`);
    const data = await res.json();
    const item = Array.isArray(data?.items) ? data.items[0] : null;
    return normalizeMuslimSalatTimings(item);
};

export const fetchPrayerMonthSchedule = async (latitude, longitude, startDate = new Date(), days = 30) => {
    const safeDays = Math.max(1, days);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + safeDays - 1);
    const query = await getPrayerLocationQuery(latitude, longitude);
    const encodedQuery = encodeURIComponent(query);
    const monthRequests = [];
    const marker = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    while (marker <= endDate) {
        const requestDate = new Date(marker.getFullYear(), marker.getMonth(), 1);
        monthRequests.push(requestDate);
        marker.setMonth(marker.getMonth() + 1);
    }
    const results = await Promise.all(monthRequests.map(async (monthDate) => {
        try {
            const pathDate = formatDatePathSegment(monthDate);
            const res = await fetch(`${MUSLIM_SALAT_API_BASE}/${encodedQuery}/monthly/${pathDate}.json`);
            const data = await res.json();
            const items = Array.isArray(data?.items) ? data.items : [];
            return items.map((item) => {
                const parsedDate = parsePrayerDateValue(item.date_for);
                const timings = normalizeMuslimSalatTimings(item);
                if (!parsedDate || !timings) return null;
                return {
                    date: parsedDate,
                    timings,
                };
            }).filter(Boolean);
        } catch (e) {
            return [];
        }
    }));
    const merged = results.flat();
    const uniqueByDate = merged.reduce((acc, row) => {
        const key = row.date.toDateString();
        if (!acc[key]) acc[key] = row;
        return acc;
    }, {});
    return Object.values(uniqueByDate)
        .filter((row) => row.date >= startDate && row.date <= endDate)
        .sort((a, b) => a.date - b.date);
};

// CORS proxy for web platform


// ====== QURAN - SURAH ======
export const fetchSurahList = async () => {
    const res = await fetch(`${QURAN_API_BASE}/surah`);
    const data = await res.json();
    if (data.code === 200) return data.data;
    throw new Error('Failed to fetch surah list');
};

export const fetchSurahDetail = async (surahNumber) => {
    const [arabicRes, translationRes, audioRes, latinRes] = await Promise.all([
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}`),
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}/id.indonesian`),
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}/ar.alafasy`),
        fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.transliteration`),
    ]);
    const aD = await arabicRes.json();
    const tD = await translationRes.json();
    const auD = await audioRes.json();
    const ltD = await latinRes.json();

    if (aD.code === 200 && tD.code === 200) {
        return aD.data.ayahs.map((ayah, i) => ({
            ...ayah,
            translation: tD.data.ayahs[i]?.text || '',
            latin: ltD.code === 200 ? ltD.data.ayahs[i]?.text || '' : '',
            audio: auD.code === 200 ? auD.data.ayahs[i]?.audio : `${QURAN_AUDIO_CDN}/${ayah.number}.mp3`,
        }));
    }
    throw new Error('Failed to fetch surah detail');
};

// ====== QURAN - JUZ ======
export const fetchJuzDetail = async (juzNumber) => {
    const [arabicRes, translationRes, audioRes, latinRes] = await Promise.all([
        fetch(`${QURAN_API_BASE}/juz/${juzNumber}`),
        fetch(`${QURAN_API_BASE}/juz/${juzNumber}/id.indonesian`),
        fetch(`${QURAN_API_BASE}/juz/${juzNumber}/ar.alafasy`),
        fetch(`${QURAN_API_BASE}/juz/${juzNumber}/en.transliteration`),
    ]);
    const aD = await arabicRes.json();
    const tD = await translationRes.json();
    const auD = await audioRes.json();
    const ltD = await latinRes.json();

    if (aD.code === 200 && tD.code === 200) {
        return aD.data.ayahs.map((ayah, i) => ({
            ...ayah,
            translation: tD.data.ayahs[i]?.text || '',
            latin: ltD.code === 200 ? ltD.data.ayahs[i]?.text || '' : '',
            audio: auD.code === 200 ? auD.data.ayahs[i]?.audio : `${QURAN_AUDIO_CDN}/${ayah.number}.mp3`,
            surahName: ayah.surah.englishName,
            surahArabic: ayah.surah.name,
            surahNumber: ayah.surah.number,
        }));
    }
    throw new Error('Failed to fetch juz detail');
};

export const fetchJuzSurahs = async (juzNumber) => {
    const res = await fetch(`${QURAN_API_BASE}/juz/${juzNumber}`);
    const data = await res.json();
    if (data.code === 200) {
        const surahMap = {};
        data.data.ayahs.forEach((a) => {
            const sn = a.surah.number;
            if (!surahMap[sn]) {
                surahMap[sn] = {
                    number: sn, name: a.surah.englishName, arabic: a.surah.name,
                    meaning: a.surah.englishNameTranslation || '',
                    type: a.surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah',
                    startAyah: a.numberInSurah, endAyah: a.numberInSurah,
                    ayahCount: 0, verses: a.surah.numberOfAyahs || 0,
                };
            }
            surahMap[sn].endAyah = a.numberInSurah;
            surahMap[sn].ayahCount += 1;
        });
        return Object.values(surahMap);
    }
    throw new Error('Failed to fetch juz surahs');
};

// ====== QURAN - JUZ LIST ======

export const fetchJuzList = async () => {
    try {
        // Fetch first and last ayah of each juz in parallel (30 requests)
        const requests = Array.from({ length: 30 }, (_, i) =>
            fetch(`${QURAN_API_BASE}/juz/${i + 1}`).then(r => r.json()).catch(() => null)
        );
        const results = await Promise.all(requests);

        return results.map((data, i) => {
            const juzNum = i + 1;
            if (!data || data.code !== 200) {
                return { number: juzNum, name: `Juz ${juzNum}`, startSurah: '', endSurah: '', ayahCount: 0 };
            }
            const ayahs = data.data.ayahs;
            const first = ayahs[0];
            const last = ayahs[ayahs.length - 1];

            return {
                number: juzNum,
                name: first.surah.englishName,
                startSurah: first.surah.englishName,
                startAyah: `${first.surah.number}:${first.numberInSurah}`,
                endSurah: last.surah.englishName,
                endAyah: `${last.surah.number}:${last.numberInSurah}`,
                ayahCount: ayahs.length,
            };
        });
    } catch (e) {
        // Fallback: return basic list without API data
        return Array.from({ length: 30 }, (_, i) => ({
            number: i + 1, name: `Juz ${i + 1}`,
            startSurah: '', endSurah: '', ayahCount: 0,
        }));
    }
};

// ====== PRAYER TIMES ======
export const fetchPrayerTimes = async (latitude, longitude, date) => {
    const d = date || new Date();
    const dd = d.getDate();
    const mm = d.getMonth() + 1;
    const yyyy = d.getFullYear();

    let muslimSalatTimings = null;
    try {
        muslimSalatTimings = await fetchPrayerTimesFromMuslimSalat(latitude, longitude, d);
    } catch (e) { }

    const aladhanRes = await fetch(
        `${ALADHAN_API_BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${latitude}&longitude=${longitude}&method=20`
    );
    const aladhanData = await aladhanRes.json();
    if (aladhanData.code === 200) {
        const fallbackTimings = aladhanData.data.timings;
        const timings = muslimSalatTimings || fallbackTimings;
        return {
            timings,
            date: aladhanData.data.date,
            hijri: aladhanData.data.date?.hijri || null,
        };
    }
    throw new Error('Failed to fetch prayer times');
};

// ====== HIJRI DATE ======
export const fetchHijriDate = async (latitude = -6.2088, longitude = 106.8456) => {
    try {
        const prayerData = await fetchPrayerTimes(latitude, longitude);
        return prayerData.hijri || null;
    } catch (e) { return null; }
};

// ====== DOA ======
export const fetchDoaList = async () => {
    try {
        const res = await fetch(DOA_API_URL);
        const data = await res.json();
        return data;
    } catch (e) { return null; }
};

// ====== HADITH ======
export const fetchHadithBySections = async (book, sectionCount = 15, perSection = 2) => {
    try {
        const sections = Array.from({ length: sectionCount }, (_, i) => i + 1);
        const [indResults, araResults] = await Promise.all([
            Promise.all(sections.map(s =>
                fetch(`${HADITH_CDN_BASE}/ind-${book}/${s}.json`).then(r => r.ok ? r.json() : null).catch(() => null)
            )),
            Promise.all(sections.map(s =>
                fetch(`${HADITH_CDN_BASE}/ara-${book}/${s}.json`).then(r => r.ok ? r.json() : null).catch(() => null)
            )),
        ]);

        const allHadith = [];
        for (let i = 0; i < sections.length; i++) {
            const indData = indResults[i];
            const araData = araResults[i];
            if (!indData) continue;
            const sectionName = indData.metadata?.section?.[String(sections[i])] || `Bab ${sections[i]}`;
            const indHadiths = indData.hadiths || [];
            const araHadiths = araData?.hadiths || [];
            const limit = Math.min(perSection, indHadiths.length);
            for (let j = 0; j < limit; j++) {
                const h = indHadiths[j];
                const a = araHadiths[j];
                allHadith.push({
                    id: `${sections[i]}-${j}`,
                    number: h.hadithnumber || h.arabicnumber || allHadith.length + 1,
                    sectionName,
                    arabic: a?.text || '',
                    translation: h.text || '',
                });
            }
        }
        return allHadith;
    } catch (e) { return []; }
};

// ====== ASMAUL HUSNA ======
export const fetchAsmaulHusna = async () => {
    try {
        // Try IslamicAPI first (has audio)
        if (ISLAMIC_API_KEY) {
            const res = await fetch(`${ASMAUL_HUSNA_AUDIO_API}?language=id&api_key=${ISLAMIC_API_KEY}`);
            const json = await res.json();
            if (json.code === 200 && json.data?.names?.length > 0) {
                return json.data.names.map((item) => ({
                    no: item.number,
                    arabic: item.name || '',
                    latin: item.transliteration || '',
                    meaning: item.translation || '',
                    detail: item.meaning || '',
                    audio: item.audio ? `${ASMAUL_HUSNA_AUDIO_BASE}${item.audio}` : null,
                }));
            }
        }
        // Fallback
        const res = await fetch(ASMAUL_HUSNA_API_URL);
        const json = await res.json();
        const apiData = json.data || json;
        if (Array.isArray(apiData) && apiData.length > 0) {
            return apiData.map((item, idx) => ({
                no: item.urutan || idx + 1,
                arabic: item.arab || item.arabic || item.name || '',
                latin: item.latin || item.transliteration || '',
                meaning: item.arti || item.meaning || item.translation || '',
                audio: null,
            }));
        }
        return null;
    } catch (e) { return null; }
};

// ====== KISAH NABI (PROPHET STORIES) ======
export const fetchProphetStories = async () => {
    try {
        const res = await fetch(KISAH_NABI_API_URL);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return [];

        // Merge multi-part prophets
        const merged = [];
        const partMap = {};
        data.forEach((item) => {
            const baseName = (item.name || '').replace(/\s*\(?\s*Part\s*\d+\s*\)?\s*$/i, '').trim();
            if (partMap[baseName]) {
                partMap[baseName].description += '\n\n' + (item.description || '');
            } else {
                const entry = {
                    name: baseName,
                    birthYear: item.thn_kelahiran || '',
                    age: item.usia || '',
                    description: item.description || '',
                    location: item.tmp || '',
                };
                partMap[baseName] = entry;
                merged.push(entry);
            }
        });
        return merged.map((item, idx) => ({ ...item, no: idx + 1 }));
    } catch (e) { return []; }
};

// ====== GOLD PRICE (for Zakat) ======
export const fetchGoldPrice = async () => {
    try {
        const res = await fetch(GOLD_PRICE_API_URL, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        return data;
    } catch (e) { return { price_per_gram: 1_300_000 }; }
};

// ====== HIJRI CALENDAR ======
export const fetchHijriCalendar = async (year, month, latitude = -6.2088, longitude = 106.8456) => {
    try {
        const res = await fetch(
            `${ALADHAN_API_BASE}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=20`
        );
        const data = await res.json();
        if (data.code === 200) {
            return data.data.map((d) => ({
                gregorian: {
                    day: parseInt(d.date.gregorian.day),
                    month: parseInt(d.date.gregorian.month.number),
                    year: parseInt(d.date.gregorian.year),
                    weekday: d.date.gregorian.weekday.en,
                    date: d.date.gregorian.date,
                },
                hijri: {
                    day: parseInt(d.date.hijri.day),
                    month: parseInt(d.date.hijri.month.number),
                    monthEn: d.date.hijri.month.en,
                    monthAr: d.date.hijri.month.ar,
                    year: parseInt(d.date.hijri.year),
                    holidays: d.date.hijri.holidays || [],
                },
            }));
        }
        return [];
    } catch (e) { return []; }
};

// ====== QIBLA DIRECTION ======
export const fetchQiblaDirection = async (latitude, longitude) => {
    try {
        const res = await fetch(`${ALADHAN_API_BASE}/qibla/${latitude}/${longitude}`);
        const data = await res.json();
        if (data.code === 200) return data.data;
        return null;
    } catch (e) { return null; }
};
