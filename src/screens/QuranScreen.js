import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, SHADOWS } from '../constants/theme';
import { fetchSurahList, fetchJuzList } from '../data/apiService';
import { getMostRecentLastRead } from '../services/lastReadService';
import { useSettings } from '../context/SettingsContext';

const QuranScreen = ({ navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [activeTab, setActiveTab] = useState('surah');
    const [searchQuery, setSearchQuery] = useState('');
    const [surahList, setSurahList] = useState([]);
    const [juzList, setJuzList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastRead, setLastRead] = useState(null);

    const loadLastRead = async () => {
        const data = await getMostRecentLastRead();
        if (data) setLastRead(data);
    };

    const loadSurahs = async () => {
        try {
            const data = await fetchSurahList();
            setSurahList(data.map((s) => ({
                number: s.number, name: s.englishName, arabic: s.name,
                meaning: s.englishNameTranslation, verses: s.numberOfAyahs,
                type: s.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah',
            })));
        } catch (e) {
            console.error('Failed to load surahs:', e);
        } finally {
            setLoading(false);
        }
    };

    const loadJuz = async () => {
        try {
            const list = await fetchJuzList();
            setJuzList(list);
        } catch (e) { console.error('Failed to load juz:', e); }
    };

    useEffect(() => { loadSurahs(); loadJuz(); loadLastRead(); }, []);
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => { loadLastRead(); });
        return unsubscribe;
    }, [navigation]);

    const filteredSurahs = surahList.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.number.toString().includes(searchQuery)
    );

    const renderSurahItem = ({ item, index }) => (
        <TouchableOpacity
            style={[styles.surahCard, index === 0 && { marginTop: 4 }]}
            onPress={() => navigation.navigate('SurahDetail', { surah: item })}
            activeOpacity={0.6}
        >
            <View style={styles.surahNumber}>
                <Text style={styles.surahNumberText}>{item.number}</Text>
            </View>
            <View style={styles.surahInfo}>
                <Text style={styles.surahName}>{item.name}</Text>
                <Text style={styles.surahMeta}>{item.type} · {item.verses} Ayat</Text>
            </View>
            <View style={styles.surahRight}>
                <Text style={styles.surahArabic}>{item.arabic}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderJuzItem = ({ item }) => (
        <TouchableOpacity
            style={styles.juzCard}
            activeOpacity={0.6}
            onPress={() => navigation.navigate('JuzSurahList', { juz: item })}
        >
            <View style={styles.juzLeft}>
                <View style={styles.juzNumber}>
                    <Text style={styles.juzNumberText}>{item.number}</Text>
                </View>
                <View style={styles.juzInfo}>
                    <Text style={styles.juzName}>{item.name}</Text>
                    <Text style={styles.juzRange}>{item.startSurah} - {item.endSurah}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.quran_title}</Text>
                <Text style={styles.headerSubtitle}>{t.quran_subtitle}</Text>

                <View style={styles.lastReadBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="bookmark" size={16} color={COLORS.accent} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.lastReadLabel}>{t.last_read}</Text>
                            <Text style={styles.lastReadSurah}>
                                {lastRead
                                    ? lastRead.type === 'juz'
                                        ? `Juz ${lastRead.juzNumber} · ${lastRead.surahName} : ${lastRead.ayahNumberInSurah || ''}`
                                        : `${lastRead.surahName} · ${t.ayah} ${lastRead.ayahNumber}`
                                    : t.last_read_empty}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.continueBtn}
                        onPress={() => {
                            if (lastRead) {
                                if (lastRead.type === 'juz') {
                                    navigation.navigate('JuzDetail', {
                                        juz: { number: lastRead.juzNumber, name: lastRead.juzName || '' },
                                        scrollToAyah: lastRead.ayahNumber,
                                    });
                                } else {
                                    navigation.navigate('SurahDetail', {
                                        surah: { number: lastRead.surahNumber, name: lastRead.surahName, arabic: lastRead.surahArabic || '', meaning: lastRead.surahMeaning || '', verses: lastRead.surahVerses || 0, type: lastRead.surahType || '' },
                                        scrollToAyah: lastRead.ayahNumber,
                                    });
                                }
                            }
                        }}
                    >
                        <Text style={styles.continueBtnText}>{t.continue_reading}</Text>
                        <Ionicons name="arrow-forward" size={14} color={COLORS.white} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
                <TextInput
                    style={styles.searchInput} placeholder={t.search_surah} placeholderTextColor={COLORS.textMuted}
                    value={searchQuery} onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
                {[
                    { key: 'surah', label: t.surah },
                    { key: 'juz', label: t.juz },
                    { key: 'bookmark', label: t.bookmark },
                ].map((tab) => (
                    <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.activeTab]} onPress={() => setActiveTab(tab.key)}>
                        <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t.loading_surah}</Text>
                </View>
            ) : activeTab === 'surah' ? (
                <FlatList data={filteredSurahs} keyExtractor={(item) => item.number.toString()} renderItem={renderSurahItem} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} />
            ) : activeTab === 'juz' ? (
                <FlatList data={juzList} keyExtractor={(item) => item.number.toString()} renderItem={renderJuzItem} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }} />
            ) : (
                <View style={styles.emptyState}>
                    <Ionicons name="bookmark-outline" size={52} color={COLORS.border} />
                    <Text style={styles.emptyText}>{t.no_bookmark}</Text>
                    <Text style={styles.emptySubtext}>{t.bookmark_hint}</Text>
                </View>
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 20, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    headerTitle: { fontSize: SIZES.header, fontWeight: '700', color: C.white, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    lastReadBanner: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: SIZES.radius, padding: 14, marginTop: 16,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    },
    lastReadLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.3 },
    lastReadSurah: { fontSize: SIZES.font, color: C.white, fontWeight: '600', marginTop: 1 },
    continueBtn: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.accent, paddingHorizontal: 14, paddingVertical: 7, borderRadius: SIZES.radiusFull,
    },
    continueBtnText: { color: C.white, fontSize: SIZES.small, fontWeight: '600' },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        marginHorizontal: 20, marginTop: -14, paddingHorizontal: 16, paddingVertical: 11,
        borderRadius: SIZES.radius, ...SHADOWS.medium,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: SIZES.font, color: C.textPrimary },
    tabContainer: {
        flexDirection: 'row', marginHorizontal: 20, marginTop: 16, marginBottom: 8,
        backgroundColor: C.surfaceAlt, borderRadius: SIZES.radiusSm, padding: 3,
    },
    tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: C.surface, ...SHADOWS.soft },
    tabText: { fontSize: SIZES.small, color: C.textMuted, fontWeight: '600' },
    activeTabText: { color: C.primary },

    // Surah card
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
    surahRight: { marginLeft: 10 },
    surahArabic: { fontSize: SIZES.arabic, color: C.primary },

    // Juz card
    juzCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: 14, paddingHorizontal: 20,
        backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.divider,
    },
    juzLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    juzNumber: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: C.accentLight,
        justifyContent: 'center', alignItems: 'center',
    },
    juzNumberText: { color: C.accent, fontSize: SIZES.small, fontWeight: '700' },
    juzInfo: { marginLeft: 14, flex: 1 },
    juzName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    juzRange: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 },
    emptyText: { fontSize: SIZES.large, color: C.textSecondary, fontWeight: '600', marginTop: 16 },
    emptySubtext: { fontSize: SIZES.font, color: C.textMuted, marginTop: 6 },
});

export default QuranScreen;
