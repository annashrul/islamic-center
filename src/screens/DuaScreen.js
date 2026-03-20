import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchDoaList } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const DuaScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [expandedId, setExpandedId] = useState(null);
    const [doaData, setDoaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => { loadDoa(); }, []);

    const loadDoa = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await fetchDoaList();
            if (data && Array.isArray(data) && data.length > 0) {
                setDoaData(data.map((item, idx) => ({
                    id: String(item.id || idx + 1),
                    title: item.doa || `Doa ${idx + 1}`,
                    arabic: item.ayat || '',
                    latin: item.latin || '',
                    meaning: item.artinya || '',
                })));
            } else {
                setError(true);
            }
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const renderDoaItem = ({ item }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                style={styles.doaCard}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.doaHeader}>
                    <View style={styles.doaHeaderLeft}>
                        <View style={styles.doaNumberBadge}>
                            <Text style={styles.doaNumber}>{item.id}</Text>
                        </View>
                        <Text style={styles.doaTitle} numberOfLines={2}>{item.title}</Text>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
                </View>

                {isExpanded && (
                    <View style={styles.doaContent}>
                        {item.arabic ? (
                            <View style={styles.arabicContainer}>
                                <Text style={styles.arabicText}>{item.arabic}</Text>
                            </View>
                        ) : null}
                        {item.latin ? <Text style={styles.latinText}>{item.latin}</Text> : null}
                        {item.meaning ? (
                            <View style={styles.meaningContainer}>
                                <Text style={styles.meaningLabel}>{t.meaning}</Text>
                                <Text style={styles.meaningText}>{item.meaning}</Text>
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
                <Text style={styles.headerTitle}>{t.doa_title}</Text>
                <Text style={styles.headerSubtitle}>
                    {loading ? t.loading : `${doaData.length} ${t.doa_subtitle}`}
                </Text>
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
                    <TouchableOpacity style={styles.retryBtn} onPress={loadDoa}>
                        <Text style={styles.retryText}>{t.retry}</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={doaData}
                    keyExtractor={(item) => item.id}
                    renderItem={renderDoaItem}
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
    centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    centerText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },
    retryBtn: {
        marginTop: 16, paddingHorizontal: 24, paddingVertical: 10,
        backgroundColor: C.primary, borderRadius: 20,
    },
    retryText: { color: C.white, fontWeight: '600', fontSize: SIZES.font },
    listContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },
    doaCard: {
        backgroundColor: C.surface, borderRadius: SIZES.radius, marginBottom: 10,
        overflow: 'hidden', borderWidth: 1, borderColor: C.divider,
    },
    doaHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14,
    },
    doaHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    doaNumberBadge: {
        width: 32, height: 32, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    doaNumber: { fontSize: SIZES.small, fontWeight: '700', color: C.primary },
    doaTitle: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary, flex: 1 },
    doaContent: { paddingHorizontal: 14, paddingBottom: 16, borderTopWidth: 1, borderTopColor: C.divider },
    arabicContainer: { backgroundColor: C.arabicBg, padding: 16, borderRadius: 10, marginTop: 12 },
    arabicText: { fontSize: SIZES.arabic, color: C.textPrimary, textAlign: 'right', lineHeight: 48 },
    latinText: {
        fontSize: SIZES.font, color: C.primary, fontStyle: 'italic', marginTop: 12, lineHeight: 22,
    },
    meaningContainer: { marginTop: 10, backgroundColor: C.surfaceAlt, padding: 12, borderRadius: 10 },
    meaningLabel: { fontSize: SIZES.small, fontWeight: '600', color: C.textMuted, marginBottom: 4 },
    meaningText: { fontSize: SIZES.font, color: C.textSecondary, lineHeight: 22 },
});

export default DuaScreen;
