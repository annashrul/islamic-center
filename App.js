import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import {
    requestNotificationPermission,
    scheduleAdzanNotifications,
    playAdzan,
    stopAdzan,
} from './src/services/adzanService';
import { getUserLocation } from './src/services/locationService';
import { SettingsProvider } from './src/context/SettingsContext';

export default function App() {
    const [adzanAlert, setAdzanAlert] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();
    const isAdzanPlayingRef = useRef(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const showAdzanAndPlay = async (data) => {
        // Guard: prevent double play
        if (isAdzanPlayingRef.current) return;
        isAdzanPlayingRef.current = true;

        await stopAdzan(); // stop any existing first

        setAdzanAlert({
            prayerName: data.prayerName,
            time: data.time,
            prayerKey: data.prayerKey,
        });

        await playAdzan(data.prayerKey);

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    };

    useEffect(() => {
        setupNotifications();

        // Listen for incoming notifications (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            const data = notification.request.content.data;
            if (data?.playAdzan) {
                showAdzanAndPlay(data);
            }
        });

        // Listen for notification taps (background/killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            const data = response.notification.request.content.data;
            if (data?.playAdzan) {
                showAdzanAndPlay(data);
            }
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    const setupNotifications = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            const location = await getUserLocation();
            await scheduleAdzanNotifications(location.latitude, location.longitude);
        }
    };

    const dismissAdzan = () => {
        stopAdzan();
        isAdzanPlayingRef.current = false;
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setAdzanAlert(null);
        });
    };

    const mobileWrapper = Platform.OS === 'web' ? {
        flex: 1, maxWidth: 430, alignSelf: 'center', width: '100%',
        shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 20,
    } : { flex: 1 };

    return (
        <SettingsProvider>
            <View style={{ flex: 1, backgroundColor: '#1A1A1A' }}>
                <View style={mobileWrapper}>
                    <StatusBar style="light" />
                    <AppNavigator />

            {adzanAlert && (
                <Animated.View style={[styles.adzanOverlay, { opacity: fadeAnim }]}>
                    <View style={styles.adzanCard}>
                        <View style={styles.adzanIconContainer}>
                            <Text style={styles.adzanIcon}>🕌</Text>
                        </View>
                        <Text style={styles.adzanTitle}>Waktu {adzanAlert.prayerName}</Text>
                        <Text style={styles.adzanTime}>{adzanAlert.time}</Text>
                        <Text style={styles.adzanArabic}>حَيَّ عَلَى الصَّلَاةِ</Text>
                        <Text style={styles.adzanSubtitle}>Hayya 'alas sholah</Text>
                        <Text style={styles.adzanMeaning}>Mari menunaikan sholat</Text>

                        <View style={styles.adzanActions}>
                            <TouchableOpacity style={styles.adzanDismissBtn} onPress={dismissAdzan}>
                                <Text style={styles.adzanDismissText}>Tutup & Hentikan Adzan</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )}
                </View>
            </View>
        </SettingsProvider>
    );
}

const styles = StyleSheet.create({
    adzanOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(26,43,42,0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
    },
    adzanCard: {
        backgroundColor: '#FFFFFF', borderRadius: 28, padding: 32, alignItems: 'center', marginHorizontal: 28,
        shadowColor: '#0C6B58', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 20,
    },
    adzanIconContainer: {
        width: 72, height: 72, borderRadius: 24, backgroundColor: '#E6F5F0',
        justifyContent: 'center', alignItems: 'center', marginBottom: 18,
    },
    adzanIcon: { fontSize: 36 },
    adzanTitle: { fontSize: 22, fontWeight: '700', color: '#0C6B58', letterSpacing: -0.3 },
    adzanTime: { fontSize: 40, fontWeight: '700', color: '#1A2B2A', marginTop: 4, marginBottom: 18, letterSpacing: 2 },
    adzanArabic: { fontSize: 26, color: '#0C6B58' },
    adzanSubtitle: { fontSize: 14, color: '#0C6B58', fontStyle: 'italic', marginTop: 4 },
    adzanMeaning: { fontSize: 14, color: '#5C6B6A', marginTop: 4, marginBottom: 24 },
    adzanActions: { width: '100%' },
    adzanDismissBtn: {
        backgroundColor: '#0C6B58', paddingVertical: 15, borderRadius: 14, alignItems: 'center',
    },
    adzanDismissText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
