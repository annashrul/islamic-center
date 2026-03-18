import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchJuzSurahs } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const JuzSurahListScreen = ({ route, navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const { juz } = route.params;
    const [surahs, setSurahs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadJuzSurahs(); }, []);

    const loadJuzSurahs = async () => {
        try {
            const surahs = await fetchJuzSurahs(juz.number);
            setSurahs(surahs);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.surahCard}
            onPress={() => navigation.navigate('SurahDetail', { surah: item })}
            activeOpacity={0.6}
        >
            <View style={styles.surahNumber}>
                <Text style={styles.surahNumberText}>{item.number}</Text>
            </View>
            <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{item.name}</Text>
                <Text style={styles.surahMeta}>
                    {item.type} · {item.ayahCount} ayat (ayat {item.startAyah}-{item.endAyah})
                </Text>
            </View>
            <Text style={styles.surahArabic}>{item.arabic}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.nav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>Juz {juz.number}</Text>
                <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('JuzDetail', { juz })}>
                    <Ionicons name="book" size={22} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            {/* Banner */}
            <View style={styles.banner}>
                <Text style={styles.bannerJuzName}>{juz.name}</Text>
                <View style={styles.bannerMeta}>
                    <Text style={styles.bannerMetaText}>{juz.startSurah} → {juz.endSurah}</Text>
                </View>
                {!loading && (
                    <Text style={styles.bannerCount}>{surahs.length} Surah</Text>
                )}

                {/* Button to read all ayahs */}
                <TouchableOpacity
                    style={styles.readAllBtn}
                    onPress={() => navigation.navigate('JuzDetail', { juz })}
                    activeOpacity={0.7}
                >
                    <Ionicons name="book-outline" size={16} color={COLORS.white} />
                    <Text style={styles.readAllText}>{t.read_all_ayah}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t.loading_juz}</Text>
                </View>
            ) : (
                <FlatList
                    data={surahs}
                    keyExtractor={(item) => item.number.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    nav: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16,
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    navTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white, letterSpacing: -0.3 },

    banner: {
        backgroundColor: C.primary, paddingVertical: 20, paddingHorizontal: 24, alignItems: 'center',
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    bannerJuzName: { fontSize: SIZES.title, fontWeight: '700', color: C.white },
    bannerMeta: { marginTop: 6 },
    bannerMetaText: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.6)' },
    bannerCount: { fontSize: SIZES.small, color: C.accent, fontWeight: '600', marginTop: 6 },
    readAllBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 18, paddingVertical: 10,
        borderRadius: 20, marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    readAllText: { color: C.white, fontSize: SIZES.small, fontWeight: '600', marginLeft: 8 },

    surahCard: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20,
        backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.divider,
    },
    surahNumber: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    surahNumberText: { color: C.primary, fontSize: SIZES.small, fontWeight: '700' },
    surahInfo: { flex: 1, marginLeft: 14 },
    surahName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    surahMeta: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
    surahArabic: { fontSize: SIZES.arabic, color: C.primary, marginLeft: 8 },

    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
});

export default JuzSurahListScreen;
