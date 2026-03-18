import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import { fetchPrayerTimes } from './apiService';
import { Platform } from 'react-native';
import { ADZAN_AUDIO_URL, ADZAN_SUBUH_URL } from '../constants/apiUrls';
import { PRAYER_NAMES_ID } from '../data/adzanPrayer';



// Prayers that should trigger adzan (not Sunrise/Imsak)
const ADZAN_PRAYERS = Object.keys(PRAYER_NAMES_ID);

let adzanSound = null;

// Configure notification handler - sound disabled here, App.js handles audio playback
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
    }),
});

// Request notification permissions
export const requestNotificationPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return false;
    }

    // Android notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('adzan', {
            name: 'Adzan',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            sound: true,
        });
    }

    return true;
};

// Schedule adzan notifications for today
export const scheduleAdzanNotifications = async (latitude = -6.2088, longitude = 106.8456) => {
    try {
        // Cancel all existing notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        const prayerData = await fetchPrayerTimes(latitude, longitude);
        const timings = prayerData.timings;
        const now = new Date();

        for (const prayerKey of ADZAN_PRAYERS) {
            const timeStr = timings[prayerKey];
            if (!timeStr) continue;

            const [hours, minutes] = timeStr.split(':').map(Number);

            // Create date for this prayer time today
            const prayerDate = new Date();
            prayerDate.setHours(hours, minutes, 0, 0);

            // Only schedule if prayer time is in the future
            if (prayerDate > now) {
                const secondsUntil = Math.floor((prayerDate - now) / 1000);

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Waktu ${PRAYER_NAMES_ID[prayerKey]} telah tiba`,
                        body: `Hayya 'alas sholah - Mari menunaikan sholat ${PRAYER_NAMES_ID[prayerKey]} (${timeStr})`,
                        data: {
                            prayerKey,
                            prayerName: PRAYER_NAMES_ID[prayerKey],
                            time: timeStr,
                            playAdzan: true,
                        },
                        sound: true,
                        priority: 'max',
                        ...(Platform.OS === 'android' && { channelId: 'adzan' }),
                    },
                    trigger: {
                        seconds: secondsUntil,
                        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                    },
                });

            }
        }

        return true;
    } catch (error) {
        console.error('Error scheduling adzan:', error);
        return false;
    }
};

// Play adzan audio
export const playAdzan = async (prayerKey = 'Dhuhr') => {
    try {
        // Stop any existing adzan
        await stopAdzan();

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
        });

        const audioUrl = prayerKey === 'Fajr' ? ADZAN_SUBUH_URL : ADZAN_AUDIO_URL;

        const { sound } = await Audio.Sound.createAsync(
            { uri: audioUrl },
            { shouldPlay: true, volume: 1.0 }
        );
        adzanSound = sound;

        // Auto cleanup when done
        if (adzanSound) {
            adzanSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    stopAdzan();
                }
            });
        }

        return true;
    } catch (error) {
        console.error('Error playing adzan:', error);
        return false;
    }
};

// Stop adzan audio
export const stopAdzan = async () => {
    if (adzanSound) {
        try {
            await adzanSound.stopAsync();
            await adzanSound.unloadAsync();
        } catch (e) { }
        adzanSound = null;
    }
};

// Check if adzan is currently playing
export const isAdzanPlaying = () => {
    return adzanSound !== null;
};

// Get scheduled notifications
export const getScheduledNotifications = async () => {
    return await Notifications.getAllScheduledNotificationsAsync();
};
