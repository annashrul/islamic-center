import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchProphetStories } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const getArabicName = (name) => {
    const map = {
        'Adam': '\u0622\u062F\u0645', 'Idris': '\u0625\u062F\u0631\u064A\u0633', 'Nuh': '\u0646\u0648\u062D', 'Hud': '\u0647\u0648\u062F', 'Shaleh': '\u0635\u0627\u0644\u062D',
        'Ibrahim': '\u0625\u0628\u0631\u0627\u0647\u064A\u0645', 'Lut': '\u0644\u0648\u0637', 'Ismail': '\u0625\u0633\u0645\u0627\u0639\u064A\u0644', 'Ishaq': '\u0625\u0633\u062D\u0627\u0642',
        'Yaqub': '\u064A\u0639\u0642\u0648\u0628', 'Yusuf': '\u064A\u0648\u0633\u0641', 'Ayyub': '\u0623\u064A\u0648\u0628', 'Dzulkifli': '\u0630\u0648 \u0627\u0644\u0643\u0641\u0644',
        "Syu'aib": '\u0634\u0639\u064A\u0628', 'Musa': '\u0645\u0648\u0633\u0649', 'Harun': '\u0647\u0627\u0631\u0648\u0646', 'Daud': '\u062F\u0627\u0648\u062F',
        'Sulaiman': '\u0633\u0644\u064A\u0645\u0627\u0646', 'Ilyas': '\u0625\u0644\u064A\u0627\u0633', 'Ilyasa': '\u0627\u0644\u064A\u0633\u0639', 'Yunus': '\u064A\u0648\u0646\u0633',
        'Zakaria': '\u0632\u0643\u0631\u064A\u0627', 'Yahya': '\u064A\u062D\u064A\u0649', 'Isa': '\u0639\u064A\u0633\u0649', 'Muhammad': '\u0645\u062D\u0645\u062F',
        'Saleh': '\u0635\u0627\u0644\u062D', 'Syuaib': '\u0634\u0639\u064A\u0628', 'Zulkifli': '\u0630\u0648 \u0627\u0644\u0643\u0641\u0644',
    };
    for (const [key, val] of Object.entries(map)) {
        if (name.includes(key)) return val;
    }
    return '';
};

// Export for use in detail screen
export { getArabicName };

const ProphetStoriesScreen = ({ navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [nabiList, setNabiList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const list = await fetchProphetStories();
            setNabiList(list);
        } catch (e) {
            console.error('Error fetching kisah nabi:', e);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const arabic = getArabicName(item.name);
        const preview = item.description.substring(0, 100).replace(/\n/g, ' ');

        return (
            <TouchableOpacity
                style={styles.nabiCard}
                onPress={() => navigation.navigate('ProphetDetail', { nabi: item })}
                activeOpacity={0.6}
            >
                <View style={styles.nabiNumber}>
                    <Text style={styles.nabiNumberText}>{item.no}</Text>
                </View>
                <View style={styles.nabiInfo}>
                    <Text style={styles.nabiName}>{item.name}</Text>
                    <Text style={styles.nabiMeta}>
                        {[item.age ? `${item.age} tahun` : '', item.location].filter(Boolean).join(' · ')}
                    </Text>
                    <Text style={styles.nabiPreview} numberOfLines={2}>{preview}...</Text>
                </View>
                {arabic ? <Text style={styles.nabiArabic}>{arabic}</Text> : null}
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.prophets_title}</Text>
                <Text style={styles.headerSubtitle}>
                    {loading ? t.loading : `${nabiList.length} ${t.prophets_count}`}
                </Text>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t.loading}</Text>
                </View>
            ) : (
                <FlatList
                    data={nabiList}
                    keyExtractor={(item) => item.no.toString()}
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
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 22, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    headerTitle: { fontSize: SIZES.header, fontWeight: '700', color: C.white, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
    nabiCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.surface, paddingVertical: 14, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: C.divider,
    },
    nabiNumber: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    nabiNumberText: { color: C.primary, fontSize: SIZES.small, fontWeight: '700' },
    nabiInfo: { flex: 1, marginLeft: 14, marginRight: 8 },
    nabiName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    nabiMeta: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
    nabiPreview: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 4, lineHeight: 16 },
    nabiArabic: { fontSize: 20, color: C.accent, marginRight: 6 },
});

export default ProphetStoriesScreen;
