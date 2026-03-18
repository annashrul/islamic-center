import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_READ_SURAH_KEY = '@islamic_center_last_read_surah';
const LAST_READ_JUZ_KEY = '@islamic_center_last_read_juz';

export const saveLastRead = async (data) => {
  try {
    const key = data.type === 'juz' ? LAST_READ_JUZ_KEY : LAST_READ_SURAH_KEY;
    await AsyncStorage.setItem(key, JSON.stringify({
      surahNumber: data.surahNumber,
      surahName: data.surahName,
      surahArabic: data.surahArabic || '',
      surahMeaning: data.surahMeaning || '',
      surahVerses: data.surahVerses || 0,
      surahType: data.surahType || '',
      ayahNumber: data.ayahNumber,
      ayahNumberInSurah: data.ayahNumberInSurah || null,
      type: data.type || 'surah',
      juzNumber: data.juzNumber || null,
      juzName: data.juzName || '',
      timestamp: Date.now(),
    }));
  } catch (e) {
    console.error('Error saving last read:', e);
  }
};

// Get last read for surah
export const getLastRead = async () => {
  try {
    const json = await AsyncStorage.getItem(LAST_READ_SURAH_KEY);
    if (json) return JSON.parse(json);
    return null;
  } catch (e) {
    return null;
  }
};

// Get last read for juz
export const getLastReadJuz = async () => {
  try {
    const json = await AsyncStorage.getItem(LAST_READ_JUZ_KEY);
    if (json) return JSON.parse(json);
    return null;
  } catch (e) {
    return null;
  }
};

// Get the most recent last read (surah or juz)
export const getMostRecentLastRead = async () => {
  try {
    const [surahJson, juzJson] = await Promise.all([
      AsyncStorage.getItem(LAST_READ_SURAH_KEY),
      AsyncStorage.getItem(LAST_READ_JUZ_KEY),
    ]);
    const surah = surahJson ? JSON.parse(surahJson) : null;
    const juz = juzJson ? JSON.parse(juzJson) : null;

    if (surah && juz) {
      return surah.timestamp > juz.timestamp ? surah : juz;
    }
    return surah || juz || null;
  } catch (e) {
    return null;
  }
};
