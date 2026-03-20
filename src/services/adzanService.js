import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { ADZAN_AUDIO_URL, ADZAN_SUBUH_URL, ALADHAN_API_BASE } from '../constants/apiUrls';

const PRAYER_NAMES = {
    Fajr: 'Subuh', Dhuhr: 'Dzuhur', Asr: 'Ashar', Maghrib: 'Maghrib', Isha: 'Isya',
};
const ADZAN_PRAYERS = Object.keys(PRAYER_NAMES);

let adzanSound = null;

// ====== NOTIFICATION SETUP ======
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
    }),
});

export const requestNotificationPermission = async () => {
    try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') return false;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('adzan', {
                name: 'Adzan',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                sound: true,
            });
        }
        return true;
    } catch (e) {
        console.warn('Permission error:', e);
        return false;
    }
};

// ====== SCHEDULE NOTIFICATIONS ======
export const scheduleAdzanNotifications = async (latitude = -6.2088, longitude = 106.8456) => {
    try {
        // Cancel existing
        await Notifications.cancelAllScheduledNotificationsAsync();

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        // Fetch current month calendar from Aladhan
        const res = await fetch(
            `${ALADHAN_API_BASE}/calendar/${year}/${month}?latitude=${latitude}&longitude=${longitude}&method=20`
        );
        const json = await res.json();
        if (json.code !== 200 || !json.data) {
            console.warn('Aladhan calendar failed');
            return false;
        }

        let count = 0;
        const maxDays = 7; // schedule 7 days ahead

        for (const dayData of json.data) {
            const greg = dayData.date.gregorian;
            const [dd, mm, yyyy] = greg.date.split('-').map(Number);
            const dayDate = new Date(yyyy, mm - 1, dd);

            // Only future days, max 7 days ahead
            const diffDays = Math.floor((dayDate - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
            if (diffDays < 0 || diffDays > maxDays) continue;

            for (const prayerKey of ADZAN_PRAYERS) {
                const timeStr = dayData.timings[prayerKey];
                if (!timeStr) continue;

                // Parse "HH:MM (WIB)" format
                const timePart = timeStr.split(' ')[0];
                const [hours, minutes] = timePart.split(':').map(Number);
                if (isNaN(hours) || isNaN(minutes)) continue;

                const prayerDate = new Date(yyyy, mm - 1, dd, hours, minutes, 0);
                const secondsFromNow = Math.floor((prayerDate.getTime() - now.getTime()) / 1000);

                // Only schedule future prayers
                if (secondsFromNow <= 0) continue;

                try {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: `Waktu ${PRAYER_NAMES[prayerKey]} telah tiba`,
                            body: `Hayya 'alas sholah - ${timePart}`,
                            data: {
                                prayerKey,
                                prayerName: PRAYER_NAMES[prayerKey],
                                time: timePart,
                                playAdzan: true,
                            },
                            sound: true,
                            ...(Platform.OS === 'android' && { channelId: 'adzan' }),
                        },
                        trigger: {
                            seconds: secondsFromNow,
                            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                        },
                    });
                    count++;
                } catch (scheduleErr) {
                    console.warn(`Failed to schedule ${prayerKey}:`, scheduleErr.message);
                }
            }
        }

        console.log(`Scheduled ${count} adzan notifications for next ${maxDays} days`);
        return true;
    } catch (error) {
        console.error('scheduleAdzanNotifications error:', error);
        return false;
    }
};

// ====== AUDIO ======
export const playAdzan = async (prayerKey = 'Dhuhr') => {
    try {
        await stopAdzan();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });
        const url = prayerKey === 'Fajr' ? ADZAN_SUBUH_URL : ADZAN_AUDIO_URL;
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true, volume: 1.0 });
        adzanSound = sound;
        sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) stopAdzan(); });
        return true;
    } catch (e) {
        console.error('playAdzan error:', e);
        return false;
    }
};

export const stopAdzan = async () => {
    if (adzanSound) {
        try { await adzanSound.stopAsync(); await adzanSound.unloadAsync(); } catch (e) {}
        adzanSound = null;
    }
};

export const isAdzanPlaying = () => adzanSound !== null;

export const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
};
