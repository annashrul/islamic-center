import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StatusBar,
    ActivityIndicator, Linking, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchNearbyMosques } from '../services/apiService';
import { getUserLocation } from '../services/locationService';
import { useSettings } from '../context/SettingsContext';

const RADIUS_OPTIONS = [1000, 3000, 5000, 10000];
const RADIUS_LABELS = ['1 km', '3 km', '5 km', '10 km'];

const NearbyMosqueScreen = ({ navigation }) => {
    const { colors: C, t } = useSettings();
    const s = makeStyles(C);
    const [mosques, setMosques] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRadius, setSelectedRadius] = useState(2); // index: 5km
    const [locationName, setLocationName] = useState('');
    const [userLat, setUserLat] = useState(null);
    const [userLon, setUserLon] = useState(null);

    useEffect(() => { loadMosques(); }, [selectedRadius]);

    const loadMosques = async () => {
        setLoading(true);
        try {
            const location = await getUserLocation();
            setUserLat(location.latitude);
            setUserLon(location.longitude);
            setLocationName(location.fullAddress);
            const data = await fetchNearbyMosques(location.latitude, location.longitude, RADIUS_OPTIONS[selectedRadius]);
            setMosques(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const openMaps = (mosque) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`;
        Linking.openURL(url).catch(() => { });
    };

    const renderMosque = ({ item, index }) => (
        <TouchableOpacity style={s.mosqueCard} onPress={() => openMaps(item)} activeOpacity={0.7}>
            <View style={s.mosqueLeft}>
                <View style={[s.mosqueIcon, index === 0 && s.mosqueIconNearest]}>
                    <Ionicons name="location" size={18} color={index === 0 ? C.white : C.primary} />
                </View>
                <View style={s.mosqueInfo}>
                    <Text style={s.mosqueName} numberOfLines={1}>{item.name}</Text>
                    {item.address ? <Text style={s.mosqueAddress} numberOfLines={1}>{item.address}</Text> : null}
                    <View style={s.mosqueMetaRow}>
                        <View style={s.distanceBadge}>
                            <Ionicons name="walk-outline" size={12} color={C.primary} />
                            <Text style={s.distanceText}>{item.distanceText}</Text>
                        </View>
                        {item.type === 'mosque' && (
                            <View style={[s.typeBadge, { backgroundColor: C.primarySoft }]}>
                                <Text style={[s.typeText, { color: C.primary }]}>Masjid</Text>
                            </View>
                        )}
                        {item.type === 'musholla' && (
                            <View style={[s.typeBadge, { backgroundColor: C.accentLight }]}>
                                <Text style={[s.typeText, { color: C.accent }]}>Musholla</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
            <Ionicons name="navigate-outline" size={18} color={C.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={s.container}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.white} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>{t.nearby_mosque || 'Masjid Terdekat'}</Text>
                <TouchableOpacity onPress={loadMosques} style={s.navBtn}>
                    <Ionicons name="refresh" size={22} color={C.white} />
                </TouchableOpacity>
            </View>

            {/* Location info */}
            {locationName ? (
                <View style={s.locationBar}>
                    <Ionicons name="location" size={14} color={C.primary} />
                    <Text style={s.locationText} numberOfLines={1}>{locationName}</Text>
                </View>
            ) : null}

            {/* Radius selector */}
            <View style={s.radiusRow}>
                {RADIUS_OPTIONS.map((r, idx) => (
                    <TouchableOpacity
                        key={r}
                        style={[s.radiusChip, selectedRadius === idx && s.radiusChipActive]}
                        onPress={() => setSelectedRadius(idx)}
                    >
                        <Text style={[s.radiusText, selectedRadius === idx && s.radiusTextActive]}>
                            {RADIUS_LABELS[idx]}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.loadingText}>{t.loading || 'Memuat...'}</Text>
                </View>
            ) : mosques.length === 0 ? (
                <View style={s.loadingBox}>
                    <Ionicons name="location-outline" size={48} color={C.textMuted} />
                    <Text style={s.emptyText}>{t.no_mosque || 'Tidak ditemukan masjid di sekitar'}</Text>
                    <Text style={s.emptySubtext}>{t.try_larger_radius || 'Coba perbesar radius pencarian'}</Text>
                </View>
            ) : (
                <FlatList
                    data={mosques}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderMosque}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListHeaderComponent={() => (
                        <Text style={s.resultCount}>
                            {mosques.length} {t.mosque_found || 'masjid ditemukan'}
                        </Text>
                    )}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadMosques(); }} colors={[C.primary]} />
                    }
                />
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16,
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white },

    locationBar: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10,
        backgroundColor: C.primarySoft,
    },
    locationText: { fontSize: SIZES.small, color: C.primary, fontWeight: '500', marginLeft: 6, flex: 1 },

    radiusRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
    radiusChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: C.surface, borderWidth: 1, borderColor: C.divider,
    },
    radiusChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    radiusText: { fontSize: SIZES.small, fontWeight: '600', color: C.textMuted },
    radiusTextActive: { color: C.white },

    resultCount: { fontSize: SIZES.small, color: C.textMuted, paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
    emptyText: { fontSize: SIZES.large, color: C.textSecondary, fontWeight: '600', marginTop: 16 },
    emptySubtext: { fontSize: SIZES.font, color: C.textMuted, marginTop: 6 },

    mosqueCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: C.surface, paddingVertical: 14, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: C.divider,
    },
    mosqueLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    mosqueIcon: {
        width: 42, height: 42, borderRadius: 12, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    mosqueIconNearest: { backgroundColor: C.primary },
    mosqueInfo: { flex: 1 },
    mosqueName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    mosqueAddress: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
    mosqueMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
    distanceBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.primarySoft,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    distanceText: { fontSize: 10, fontWeight: '700', color: C.primary, marginLeft: 4 },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    typeText: { fontSize: 10, fontWeight: '700' },
});

export default NearbyMosqueScreen;
