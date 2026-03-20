import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchHadithBySections } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const BOOKS = [
    { key: 'bukhari', label: 'Bukhari', name: 'Shahih Bukhari' },
    { key: 'muslim', label: 'Muslim', name: 'Shahih Muslim' },
    { key: 'tirmidhi', label: 'Tirmidzi', name: 'Jami at-Tirmidzi' },
    { key: 'abudawud', label: 'Abu Dawud', name: 'Sunan Abu Dawud' },
    { key: 'ibnmajah', label: 'Ibnu Majah', name: 'Sunan Ibnu Majah' },
    { key: 'nasai', label: "Nasa'i", name: "Sunan an-Nasa'i" },
];

const HadithScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [selectedBook, setSelectedBook] = useState('bukhari');
    const [expandedId, setExpandedId] = useState(null);
    const [haditsData, setHaditsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [bookName, setBookName] = useState('Shahih Bukhari');

    useEffect(() => { loadHadits(selectedBook); }, [selectedBook]);

    const loadHadits = async (book) => {
        setLoading(true);
        setError(false);
        setBookName(BOOKS.find(b => b.key === book)?.name || book);

        try {
            const hadith = await fetchHadithBySections(book);
            if (hadith.length > 0) {
                setHaditsData(hadith.map((h) => ({ ...h, bookName })));
            } else {
                setError(true);
            }
        } catch (e) {
            console.error(e);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                style={styles.haditsCard}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.haditsHeader}>
                    <View style={styles.haditsHeaderLeft}>
                        <View style={styles.haditsNumberBadge}>
                            <Text style={styles.haditsNumber}>{item.number}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.sectionName}>{item.sectionName}</Text>
                            <Text style={styles.haditsNarrator}>{bookName} · No. {item.number}</Text>
                        </View>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
                </View>

                {isExpanded && (
                    <View style={styles.haditsContent}>
                        {item.arabic ? (
                            <View style={styles.arabicContainer}>
                                <Text style={styles.arabicText}>{item.arabic}</Text>
                            </View>
                        ) : null}
                        {item.translation ? (
                            <View style={styles.translationContainer}>
                                <Text style={styles.translationLabel}>{t.translation}:</Text>
                                <Text style={styles.translationText}>{item.translation}</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.hadits_title}</Text>
                <Text style={styles.headerSubtitle}>
                    {loading ? t.loading : `${haditsData.length} ${t.hadits_from} ${bookName}`}
                </Text>
            </View>

            <View style={styles.categoriesScroll}>
                <FlatList
                    horizontal
                    data={BOOKS}
                    keyExtractor={(item) => item.key}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.categoryChip, selectedBook === item.key && styles.categoryChipActive]}
                            onPress={() => { setSelectedBook(item.key); setExpandedId(null); }}
                        >
                            <Text style={[styles.categoryChipText, selectedBook === item.key && styles.categoryChipTextActive]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.centerText}>{t.loading}</Text>
                </View>
            ) : error ? (
                <View style={styles.centerBox}>
                    <Ionicons name="cloud-offline-outline" size={48} color={COLORS.textMuted} />
                    <Text style={styles.centerText}>{t.failed_load}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => loadHadits(selectedBook)}>
                        <Text style={styles.retryText}>{t.retry}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={haditsData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 50, paddingBottom: 22, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    headerTitle: { fontSize: SIZES.header, fontWeight: '700', color: C.white, letterSpacing: -0.5 },
    headerSubtitle: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
    categoriesScroll: { marginTop: 14 },
    categoriesContent: { paddingHorizontal: 16 },
    categoryChip: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: C.surface, marginRight: 8, borderWidth: 1, borderColor: C.divider,
    },
    categoryChipActive: { backgroundColor: C.primary, borderColor: C.primary },
    categoryChipText: { fontSize: SIZES.small, color: C.textMuted, fontWeight: '600' },
    categoryChipTextActive: { color: C.white },
    listContainer: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centerText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
    retryBtn: {
        marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
        backgroundColor: C.primary, borderRadius: 20,
    },
    retryText: { color: C.white, fontWeight: '600', fontSize: SIZES.font },
    haditsCard: {
        backgroundColor: C.surface, borderRadius: SIZES.radius, marginBottom: 10,
        overflow: 'hidden', borderWidth: 1, borderColor: C.divider,
    },
    haditsHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14,
    },
    haditsHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    haditsNumberBadge: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    haditsNumber: { fontSize: SIZES.small, fontWeight: '700', color: C.primary },
    sectionName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    haditsNarrator: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
    haditsContent: { paddingHorizontal: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.divider },
    arabicContainer: { backgroundColor: C.arabicBg, padding: 16, borderRadius: 10, marginTop: 12 },
    arabicText: { fontSize: SIZES.arabic, color: C.textPrimary, textAlign: 'right', lineHeight: 48 },
    translationContainer: { marginTop: 12, backgroundColor: C.surfaceAlt, padding: 12, borderRadius: 10 },
    translationLabel: { fontSize: SIZES.small, fontWeight: '600', color: C.textMuted, marginBottom: 4 },
    translationText: { fontSize: SIZES.font, color: C.textSecondary, lineHeight: 22 },
});

export default HadithScreen;
