import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, StatusBar, ActivityIndicator, Animated, Dimensions,
} from 'react-native';
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchQiblaDirection } from '../services/apiService';
import { getUserLocation } from '../services/locationService';
import { useSettings } from '../context/SettingsContext';

const { width: SCREEN_W } = Dimensions.get('window');
const COMPASS_SIZE = SCREEN_W * 0.72;

const QiblaScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [qiblaData, setQiblaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState(t.loading_location);
    const [locationCoords, setLocationCoords] = useState('');
    const [heading, setHeading] = useState(0);
    const [sensorAvailable, setSensorAvailable] = useState(true);

    const compassAnim = useRef(new Animated.Value(0)).current;
    const qiblaAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => { loadQibla(); }, []);

    // Heading: prefer OS-fused heading (Location API), fallback to raw Magnetometer
    useEffect(() => {
        let headingSub;
        let magSub;

        const startHeading = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    headingSub = await Location.watchHeadingAsync((headingData) => {
                        const h = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
                        setHeading(Math.round(h));
                    });
                    return;
                }
            } catch (e) {
                console.log('Location heading not available, falling back to magnetometer');
            }

            try {
                const available = await Magnetometer.isAvailableAsync();
                if (!available) { setSensorAvailable(false); return; }

                Magnetometer.setUpdateInterval(100);
                magSub = Magnetometer.addListener(({ x, y }) => {
                    let angle = Math.atan2(y, x) * (180 / Math.PI);
                    let h = (360 - ((angle + 360) % 360)) % 360;
                    setHeading(Math.round(h));
                });
            } catch (e) {
                setSensorAvailable(false);
            }
        };

        startHeading();
        return () => {
            if (headingSub) headingSub.remove();
            if (magSub) magSub.remove();
        };
    }, []);

    // Animate compass rotation smoothly
    useEffect(() => {
        Animated.timing(compassAnim, {
            toValue: -heading,
            duration: 150,
            useNativeDriver: true,
        }).start();

        if (qiblaData?.direction) {
            Animated.timing(qiblaAnim, {
                toValue: qiblaData.direction - heading,
                duration: 150,
                useNativeDriver: true,
            }).start();
        }
    }, [heading, qiblaData]);

    const loadQibla = async () => {
        try {
            const location = await getUserLocation();
            setLocationName(location.fullAddress);
            setLocationCoords(location.coords);
            const data = await fetchQiblaDirection(location.latitude, location.longitude);
            setQiblaData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const qiblaDeg = qiblaData?.direction ? qiblaData.direction.toFixed(1) : '295.5';

    const getCompassDir = (deg) => {
        const d = parseFloat(deg);
        if (d >= 337.5 || d < 22.5) return 'Utara';
        if (d < 67.5) return 'Timur Laut';
        if (d < 112.5) return 'Timur';
        if (d < 157.5) return 'Tenggara';
        if (d < 202.5) return 'Selatan';
        if (d < 247.5) return 'Barat Daya';
        if (d < 292.5) return 'Barat';
        return 'Barat Laut';
    };

    const compassRotate = compassAnim.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
    });

    const qiblaRotate = qiblaAnim.interpolate({
        inputRange: [-360, 0, 360],
        outputRange: ['-360deg', '0deg', '360deg'],
    });

    // Check if facing qibla (within 5 degrees)
    const diff = qiblaData?.direction ? Math.abs(((heading - qiblaData.direction + 540) % 360) - 180) : 999;
    const isFacingQibla = diff < 5;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Arah Kiblat</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.accent} />
                    <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
                </View>
                {locationCoords ? <Text style={styles.coordsText}>{locationCoords}</Text> : null}
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Menghitung arah kiblat...</Text>
                </View>
            ) : (
                <View style={styles.content}>
                    {/* Heading display */}
                    <View style={styles.headingRow}>
                        <Text style={styles.headingDeg}>{heading}°</Text>
                        <Text style={styles.headingDir}>{getCompassDir(heading)}</Text>
                    </View>

                    {/* Compass */}
                    <View style={styles.compassWrapper}>
                        {/* Facing qibla glow */}
                        {isFacingQibla && <View style={styles.qiblaGlow} />}

                        {/* "You are here" indicator - fixed at top */}
                        <View style={styles.youAreHere}>
                            <View style={[styles.youIconCircle, isFacingQibla && styles.youIconCircleActive]}>
                                <Ionicons name="person" size={14} color={isFacingQibla ? COLORS.accent : COLORS.primary} />
                            </View>
                            <View style={[styles.youArrow, isFacingQibla && styles.youArrowActive]} />
                            <Text style={[styles.youLabel, isFacingQibla && styles.youLabelActive]}>{t.you_are_here}</Text>
                        </View>

                        {/* Compass ring rotates with device */}
                        <Animated.View style={[styles.compassRing, { transform: [{ rotate: compassRotate }] }]}>
                            {/* N E S W labels */}
                            <Text style={[styles.dirLabel, styles.dirN]}>N</Text>
                            <Text style={[styles.dirLabel, styles.dirE]}>E</Text>
                            <Text style={[styles.dirLabel, styles.dirS]}>S</Text>
                            <Text style={[styles.dirLabel, styles.dirW]}>W</Text>

                            {/* Degree ticks */}
                            {Array.from({ length: 72 }, (_, i) => {
                                const deg = i * 5;
                                const isMajor = deg % 30 === 0;
                                return (
                                    <View
                                        key={i}
                                        style={[
                                            styles.tick,
                                            isMajor && styles.tickMajor,
                                            { transform: [{ rotate: `${deg}deg` }, { translateY: -(COMPASS_SIZE / 2 - 8) }] },
                                        ]}
                                    />
                                );
                            })}
                        </Animated.View>

                        {/* Qibla needle - points to qibla */}
                        <Animated.View style={[styles.qiblaNeedle, { transform: [{ rotate: qiblaRotate }] }]}>
                            <View style={styles.needleLine} />
                            <View style={[styles.needleHead, isFacingQibla && styles.needleHeadActive]}>
                                <Text style={styles.kaabaEmoji}>🕋</Text>
                            </View>
                        </Animated.View>

                        {/* Center dot */}
                        <View style={styles.centerDot} />
                    </View>

                    {/* Qibla info */}
                    <View style={[styles.qiblaInfoCard, isFacingQibla && styles.qiblaInfoCardActive]}>
                        {isFacingQibla ? (
                            <>
                                <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                                <Text style={styles.qiblaInfoTextActive}>{t.facing_qibla}</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="compass-outline" size={18} color={COLORS.textMuted} />
                                <Text style={styles.qiblaInfoText}>Kiblat: {qiblaDeg}° {getCompassDir(qiblaDeg)}</Text>
                            </>
                        )}
                    </View>

                    {/* Sensor info */}
                    {!sensorAvailable && (
                        <View style={styles.warningCard}>
                            <Ionicons name="warning-outline" size={16} color="#E6960A" />
                            <Text style={styles.warningText}>Magnetometer tidak tersedia di perangkat ini. Kompas tidak bisa bergerak.</Text>
                        </View>
                    )}

                    <View style={styles.tipCard}>
                        <Ionicons name="information-circle-outline" size={15} color={COLORS.textMuted} />
                        <Text style={styles.tipText}>Kalibrasi: gerakkan HP membentuk angka 8. Jauhkan dari benda logam.</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 22, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    headerTitle: { fontSize: SIZES.header, fontWeight: '700', color: C.white, letterSpacing: -0.5 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
    locationText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.6)', marginLeft: 4, flex: 1 },
    coordsText: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, marginLeft: 17 },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: C.textMuted },

    content: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    // Heading
    headingRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
    headingDeg: { fontSize: 36, fontWeight: '700', color: C.textPrimary, letterSpacing: 1 },
    headingDir: { fontSize: SIZES.medium, color: C.textMuted, marginLeft: 8, fontWeight: '500' },

    // Compass
    compassWrapper: {
        marginTop: 40,
        width: COMPASS_SIZE, height: COMPASS_SIZE,
        justifyContent: 'center', alignItems: 'center',
    },
    qiblaGlow: {
        position: 'absolute', width: COMPASS_SIZE + 20, height: COMPASS_SIZE + 20,
        borderRadius: (COMPASS_SIZE + 20) / 2, backgroundColor: C.primarySoft,
    },
    compassRing: {
        width: COMPASS_SIZE, height: COMPASS_SIZE,
        borderRadius: COMPASS_SIZE / 2,
        borderWidth: 2, borderColor: C.border,
        justifyContent: 'center', alignItems: 'center',
    },
    dirLabel: {
        position: 'absolute', fontSize: 15, fontWeight: '700', color: C.textMuted,
    },
    dirN: { top: 14, color: C.primary, fontSize: 17 },
    dirE: { right: 14 },
    dirS: { bottom: 14 },
    dirW: { left: 14 },

    tick: {
        position: 'absolute', width: 1, height: 8,
        backgroundColor: C.border, alignSelf: 'center',
    },
    tickMajor: { width: 2, height: 14, backgroundColor: C.textMuted },

    // Qibla needle
    qiblaNeedle: {
        position: 'absolute', alignItems: 'center',
        width: COMPASS_SIZE, height: COMPASS_SIZE,
        justifyContent: 'flex-start',
    },
    needleLine: {
        width: 3, height: COMPASS_SIZE / 2 - 40,
        backgroundColor: C.primary, borderRadius: 2, marginTop: 30,
    },
    needleHead: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: C.surface, borderWidth: 3, borderColor: C.primary,
        justifyContent: 'center', alignItems: 'center', marginTop: -4,
    },
    needleHeadActive: { backgroundColor: C.primarySoft, borderColor: C.accent },
    kaabaEmoji: { fontSize: 20 },

    // "You are here" indicator - fixed at top of compass
    youAreHere: { position: 'absolute', top: -44, alignItems: 'center', zIndex: 20 },
    youIconCircle: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: C.primarySoft, borderWidth: 2, borderColor: C.primary,
        justifyContent: 'center', alignItems: 'center', marginBottom: 2,
    },
    youIconCircleActive: { backgroundColor: C.accentLight, borderColor: C.accent },
    youArrow: {
        width: 0, height: 0,
        borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 10,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderTopColor: C.primary,
    },
    youArrowActive: { borderTopColor: C.accent },
    youLabel: { fontSize: 9, fontWeight: '700', color: C.primary, marginTop: 3 },
    youLabelActive: { color: C.accent },

    // Center dot
    centerDot: {
        position: 'absolute', width: 10, height: 10, borderRadius: 5,
        backgroundColor: C.primary,
    },

    // Info cards
    qiblaInfoCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.divider,
        paddingHorizontal: 18, paddingVertical: 12, borderRadius: SIZES.radius, marginTop: 20,
    },
    qiblaInfoCardActive: { backgroundColor: C.primarySoft, borderColor: C.primary },
    qiblaInfoText: { fontSize: SIZES.font, color: C.textSecondary, marginLeft: 8, fontWeight: '500' },
    qiblaInfoTextActive: { fontSize: SIZES.font, color: C.primary, marginLeft: 8, fontWeight: '700' },

    warningCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentLight,
        paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginTop: 12, marginHorizontal: 20,
    },
    warningText: { fontSize: SIZES.caption, color: '#9A7B2D', marginLeft: 8, flex: 1 },

    tipCard: {
        flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingHorizontal: 20,
    },
    tipText: { fontSize: SIZES.caption, color: C.textMuted, marginLeft: 6 },
});

export default QiblaScreen;
