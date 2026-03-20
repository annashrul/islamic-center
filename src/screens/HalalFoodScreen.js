import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StatusBar,
    ActivityIndicator, Linking, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchHalalRestaurants } from '../services/apiService';
import { getUserLocation } from '../services/locationService';
import { useSettings } from '../context/SettingsContext';

const RADIUS_OPTIONS = [1000, 3000, 5000, 10000];
const RADIUS_LABELS = ['1 km', '3 km', '5 km', '10 km'];

const HalalFoodScreen = ({ navigation }) => {
    const { colors: C, t } = useSettings();
    const s = makeStyles(C);
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedRadius, setSelectedRadius] = useState(2);
    const [locationName, setLocationName] = useState('');

    useEffect(() => { loadData(); }, [selectedRadius]);

    const loadData = async () => {
        setLoading(true);
        try {
            const location = await getUserLocation();
            setLocationName(location.fullAddress);
            const data = await fetchHalalRestaurants(location.latitude, location.longitude, RADIUS_OPTIONS[selectedRadius]);
            setRestaurants(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const openMaps = (item) => {
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lon}`).catch(() => { });
    };

    const getCuisineIcon = (cuisine) => {
        if (!cuisine) return 'restaurant-outline';
        const c = cuisine.toLowerCase();
        if (c.includes('pizza') || c.includes('italian')) return 'pizza-outline';
        if (c.includes('coffee') || c.includes('cafe')) return 'cafe-outline';
        if (c.includes('burger') || c.includes('fast')) return 'fast-food-outline';
        if (c.includes('japanese') || c.includes('sushi')) return 'fish-outline';
        return 'restaurant-outline';
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity style={s.card} onPress={() => openMaps(item)} activeOpacity={0.7}>
            <View style={s.cardLeft}>
                <View style={[s.cardIcon, index === 0 && s.cardIconNearest]}>
                    <Ionicons name={getCuisineIcon(item.cuisine)} size={18} color={index === 0 ? C.white : C.primary} />
                </View>
                <View style={s.cardInfo}>
                    <Text style={s.cardName} numberOfLines={1}>{item.name}</Text>
                    {item.cuisine ? (
                        <Text style={s.cardCuisine} numberOfLines={1}>{item.cuisine}</Text>
                    ) : null}
                    {item.address ? (
                        <Text style={s.cardAddress} numberOfLines={1}>{item.address}</Text>
                    ) : null}
                    <View style={s.cardMetaRow}>
                        <View style={s.distBadge}>
                            <Ionicons name="walk-outline" size={11} color={C.primary} />
                            <Text style={s.distText}>{item.distanceText}</Text>
                        </View>
                        {item.halalCertified && (
                            <View style={s.halalBadge}>
                                <Ionicons name="checkmark-circle" size={11} color="#10B981" />
                                <Text style={s.halalText}>Halal</Text>
                            </View>
                        )}
                        {item.openingHours ? (
                            <View style={s.hoursBadge}>
                                <Ionicons name="time-outline" size={11} color={C.textMuted} />
                                <Text style={s.hoursText} numberOfLines={1}>{item.openingHours}</Text>
                            </View>
                        ) : null}
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
                <Text style={s.headerTitle}>{t.halal_food || 'Restoran Halal'}</Text>
                <TouchableOpacity onPress={loadData} style={s.navBtn}>
                    <Ionicons name="refresh" size={22} color={C.white} />
                </TouchableOpacity>
            </View>

            {locationName ? (
                <View style={s.locationBar}>
                    <Ionicons name="location" size={14} color={C.primary} />
                    <Text style={s.locationText} numberOfLines={1}>{locationName}</Text>
                </View>
            ) : null}

            <View style={s.radiusRow}>
                {RADIUS_OPTIONS.map((r, idx) => (
                    <TouchableOpacity key={r} style={[s.radiusChip, selectedRadius === idx && s.radiusChipActive]} onPress={() => setSelectedRadius(idx)}>
                        <Text style={[s.radiusText, selectedRadius === idx && s.radiusTextActive]}>{RADIUS_LABELS[idx]}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={C.primary} />
                    <Text style={s.centerText}>{t.loading || 'Memuat...'}</Text>
                </View>
            ) : restaurants.length === 0 ? (
                <View style={s.center}>
                    <Ionicons name="restaurant-outline" size={48} color={C.textMuted} />
                    <Text style={s.emptyTitle}>{t.no_halal || 'Tidak ditemukan restoran halal'}</Text>
                    <Text style={s.emptySub}>{t.try_larger_radius || 'Coba perbesar radius pencarian'}</Text>
                </View>
            ) : (
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListHeaderComponent={() => (
                        <Text style={s.resultCount}>{restaurants.length} {t.halal_found || 'restoran ditemukan'}</Text>
                    )}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[C.primary]} />}
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
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: C.primarySoft,
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
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centerText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
    emptyTitle: { fontSize: SIZES.large, color: C.textSecondary, fontWeight: '600', marginTop: 16 },
    emptySub: { fontSize: SIZES.font, color: C.textMuted, marginTop: 6 },
    card: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: C.surface, paddingVertical: 14, paddingHorizontal: 20,
        borderBottomWidth: 1, borderBottomColor: C.divider,
    },
    cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    cardIcon: {
        width: 42, height: 42, borderRadius: 12, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    cardIconNearest: { backgroundColor: C.primary },
    cardInfo: { flex: 1 },
    cardName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    cardCuisine: { fontSize: SIZES.caption, color: C.primary, fontWeight: '500', marginTop: 1 },
    cardAddress: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 1 },
    cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8, flexWrap: 'wrap' },
    distBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.primarySoft,
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    distText: { fontSize: 10, fontWeight: '700', color: C.primary, marginLeft: 3 },
    halalBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5',
        paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
    },
    halalText: { fontSize: 10, fontWeight: '700', color: '#10B981', marginLeft: 3 },
    hoursBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surfaceAlt,
        paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, maxWidth: 120,
    },
    hoursText: { fontSize: 9, color: C.textMuted, marginLeft: 3 },
});

export default HalalFoodScreen;
