import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Animated,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { Audio } from 'expo-av';
import { fetchAsmaulHusna } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const LOCAL_DATA = [
    { no: 1, arabic: '\u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0640\u0670\u0646\u064F', latin: 'Ar-Rahman', meaning: 'Yang Maha Pengasih' },
    { no: 2, arabic: '\u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u064F', latin: 'Ar-Rahim', meaning: 'Yang Maha Penyayang' },
    { no: 3, arabic: '\u0627\u0644\u0652\u0645\u064E\u0644\u0650\u0643\u064F', latin: 'Al-Malik', meaning: 'Yang Maha Merajai' },
    { no: 4, arabic: '\u0627\u0644\u0652\u0642\u064F\u062F\u0651\u064F\u0648\u0633\u064F', latin: 'Al-Quddus', meaning: 'Yang Maha Suci' },
    { no: 5, arabic: '\u0627\u0644\u0633\u0651\u064E\u0644\u064E\u0627\u0645\u064F', latin: 'As-Salam', meaning: 'Yang Maha Memberi Kesejahteraan' },
];

const AsmaulHusnaScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [searchQuery, setSearchQuery] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPlaying, setCurrentPlaying] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [audioLoading, setAudioLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    const flatListRef = useRef(null);
    const soundRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const autoPlayRef = useRef(autoPlay);
    const dataRef = useRef([]);
    const filteredRef = useRef([]);

    useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
    useEffect(() => { dataRef.current = data; }, [data]);

    useEffect(() => {
        if (isPlaying) {
            const pulse = Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.12, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]));
            pulse.start();
            return () => pulse.stop();
        } else { pulseAnim.setValue(1); }
    }, [isPlaying]);

    useEffect(() => { return () => { stopAudio(); }; }, []);
    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const result = await fetchAsmaulHusna();
            if (result) {
                setData(result); dataRef.current = result;
            } else {
                setData(LOCAL_DATA); dataRef.current = LOCAL_DATA;
            }
        } catch (e) { setData(LOCAL_DATA); dataRef.current = LOCAL_DATA; }
        finally { setLoading(false); }
    };

    const stopAudio = useCallback(async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (e) { }
            soundRef.current = null;
        }
        setIsPlaying(false); setCurrentPlaying(null); setAudioLoading(false);
    }, []);

    const playName = useCallback(async (item, index, currentFiltered) => {
        try {
            if (soundRef.current) {
                await soundRef.current.stopAsync(); await soundRef.current.unloadAsync();
                soundRef.current = null;
            }
            setAudioLoading(true); setCurrentPlaying(item.no); setIsPlaying(true);

            if (flatListRef.current && viewMode === 'list') {
                try { flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 }); } catch (e) { }
            }

            if (item.audio) {
                // Play real audio from IslamicAPI
                await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true });
                const { sound } = await Audio.Sound.createAsync({ uri: item.audio }, { shouldPlay: true, volume: 1.0 });
                soundRef.current = sound;
                setAudioLoading(false);

                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) {
                        const list = currentFiltered || filteredRef.current;
                        if (autoPlayRef.current && index < list.length - 1) {
                            setTimeout(() => { playName(list[index + 1], index + 1, list); }, 500);
                        } else { setIsPlaying(false); setCurrentPlaying(null); }
                    }
                });
            } else {
                // Fallback: use Speech TTS
                setAudioLoading(false);
                Speech.speak(item.arabic || item.latin, {
                    language: 'ar-SA', rate: 0.8, volume: 1.0,
                    onDone: () => {
                        const list = currentFiltered || filteredRef.current;
                        if (autoPlayRef.current && index < list.length - 1) {
                            setTimeout(() => { playName(list[index + 1], index + 1, list); }, 600);
                        } else { setIsPlaying(false); setCurrentPlaying(null); }
                    },
                    onError: () => { setIsPlaying(false); setCurrentPlaying(null); },
                });
            }
        } catch (e) { setAudioLoading(false); setIsPlaying(false); setCurrentPlaying(null); }
    }, [viewMode]);

    const togglePlayPause = useCallback(async () => {
        if (isPlaying) { await stopAudio(); }
        else if (currentPlaying !== null) {
            const idx = filteredRef.current.findIndex((d) => d.no === currentPlaying);
            if (idx >= 0) playName(filteredRef.current[idx], idx, filteredRef.current);
        }
    }, [isPlaying, currentPlaying, playName]);

    const playNext = useCallback(() => {
        if (currentPlaying === null) return;
        const idx = filteredRef.current.findIndex((d) => d.no === currentPlaying);
        if (idx < filteredRef.current.length - 1) { stopAudio(); playName(filteredRef.current[idx + 1], idx + 1, filteredRef.current); }
    }, [currentPlaying, playName]);

    const playPrev = useCallback(() => {
        if (currentPlaying === null) return;
        const idx = filteredRef.current.findIndex((d) => d.no === currentPlaying);
        if (idx > 0) { stopAudio(); playName(filteredRef.current[idx - 1], idx - 1, filteredRef.current); }
    }, [currentPlaying, playName]);

    const playAll = useCallback(() => {
        const list = filteredRef.current;
        if (list.length > 0) { playName(list[0], 0, list); }
    }, [playName]);

    const filtered = data.filter((item) =>
        item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.no.toString().includes(searchQuery)
    );

    useEffect(() => { filteredRef.current = filtered; }, [filtered]);

    const renderListItem = ({ item, index }) => {
        const isCurrent = currentPlaying === item.no;
        return (
            <Animated.View style={[styles.listCard, isCurrent && styles.listCardPlaying, isCurrent && isPlaying && { transform: [{ scale: pulseAnim }] }]}>
                <View style={styles.listCardHeader}>
                    <View style={[styles.listNumberBadge, isCurrent && styles.listNumberBadgePlaying]}>
                        <Text style={[styles.listNumberText, isCurrent && { color: COLORS.white }]}>{item.no}</Text>
                    </View>
                    <View style={styles.listCardContent}>
                        <Text style={styles.listArabic}>{item.arabic}</Text>
                        <Text style={styles.listLatin}>{item.latin}</Text>
                        <Text style={styles.listMeaning}>{item.meaning}</Text>
                    </View>
                    <TouchableOpacity style={[styles.playBtn, isCurrent && isPlaying && styles.playBtnActive]}
                        onPress={() => { if (isCurrent && isPlaying) stopAudio(); else playName(item, index, filtered); }}>
                        <Ionicons name={isCurrent && isPlaying ? 'pause' : 'play'} size={18} color={isCurrent && isPlaying ? COLORS.white : COLORS.primary} />
                    </TouchableOpacity>
                </View>
                {isCurrent && isPlaying && (
                    <View style={styles.playingBar}>
                        {[...Array(12)].map((_, i) => (<View key={i} style={[styles.soundBar, { height: 4 + Math.random() * 14 }]} />))}
                    </View>
                )}
            </Animated.View>
        );
    };

    const renderGridItem = ({ item, index }) => {
        const isCurrent = currentPlaying === item.no;
        return (
            <TouchableOpacity style={[styles.gridCard, isCurrent && styles.gridCardPlaying]}
                onPress={() => { if (isCurrent && isPlaying) stopAudio(); else playName(item, index, filtered); }} activeOpacity={0.7}>
                <View style={[styles.gridNumberBadge, isCurrent && styles.gridNumberBadgePlaying]}>
                    <Text style={[styles.gridNumberText, isCurrent && { color: COLORS.white }]}>{item.no}</Text>
                </View>
                <Text style={[styles.gridArabic, isCurrent && { color: COLORS.primary }]}>{item.arabic}</Text>
                <Text style={styles.gridLatin}>{item.latin}</Text>
                <Text style={styles.gridMeaning} numberOfLines={2}>{item.meaning}</Text>
                {isCurrent && isPlaying && (
                    <View style={styles.gridPlayingIcon}><Ionicons name="volume-high" size={14} color={COLORS.primary} /></View>
                )}
            </TouchableOpacity>
        );
    };

    const renderPlayer = () => {
        if (currentPlaying === null) return null;
        const currentItem = data.find((d) => d.no === currentPlaying);
        const currentIdx = filtered.findIndex((d) => d.no === currentPlaying);
        return (
            <View style={styles.playerContainer}>
                <View style={styles.playerTop}>
                    <View style={styles.playerInfo}>
                        <Text style={styles.playerArabic}>{currentItem?.arabic}</Text>
                        <Text style={styles.playerLatin}>{currentItem?.latin} - {currentItem?.meaning}</Text>
                    </View>
                    <TouchableOpacity onPress={stopAudio}><Ionicons name="close" size={22} color={COLORS.textMuted} /></TouchableOpacity>
                </View>
                <View style={styles.progressBar}><View style={[styles.progressFill, { width: `${((currentPlaying) / 99) * 100}%` }]} /></View>
                <View style={styles.playerControls}>
                    <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)} style={styles.playerControlBtn}>
                        <Ionicons name="play-forward" size={20} color={autoPlay ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[styles.autoPlayLabel, autoPlay && { color: COLORS.primary }]}>Auto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playPrev} style={styles.playerControlBtn} disabled={currentIdx <= 0}>
                        <Ionicons name="play-skip-back" size={22} color={currentIdx > 0 ? COLORS.textPrimary : COLORS.border} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={togglePlayPause} style={styles.playerPlayBtn}>
                        <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playNext} style={styles.playerControlBtn} disabled={currentIdx >= filtered.length - 1}>
                        <Ionicons name="play-skip-forward" size={22} color={currentIdx < filtered.length - 1 ? COLORS.textPrimary : COLORS.border} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)} style={styles.playerControlBtn}>
                        <Ionicons name="play-forward" size={20} color={autoPlay ? COLORS.primary : COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Asmaul Husna</Text>
                <Text style={styles.headerSubtitle}>99 Nama Allah Yang Indah</Text>
                <TouchableOpacity style={styles.playAllBtn} onPress={playAll}>
                    <Ionicons name="play-circle" size={20} color={COLORS.white} />
                    <Text style={styles.playAllText}>Putar Semua</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} />
                    <TextInput style={styles.searchInput} placeholder="Cari nama Allah..." placeholderTextColor={COLORS.textMuted}
                        value={searchQuery} onChangeText={setSearchQuery} />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}><Ionicons name="close-circle" size={18} color={COLORS.textMuted} /></TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity style={styles.viewToggle} onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={22} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Memuat Asmaul Husna...</Text>
                </View>
            ) : (
                <FlatList key={viewMode} ref={flatListRef} data={filtered} keyExtractor={(item) => item.no.toString()}
                    renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
                    numColumns={viewMode === 'grid' ? 2 : 1}
                    {...(viewMode === 'grid' ? { columnWrapperStyle: styles.gridRow } : {})}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[viewMode === 'list' ? styles.listContainer : styles.gridContainer, currentPlaying !== null && { paddingBottom: 150 }]}
                    onScrollToIndexFailed={(info) => { flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true }); }}
                />
            )}

            {renderPlayer()}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
    },
    headerTitle: { fontSize: SIZES.xxl, fontWeight: '700', color: C.white },
    headerSubtitle: { fontSize: SIZES.font, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    playAllBtn: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20, marginTop: 14,
    },
    playAllText: { color: C.white, fontSize: SIZES.font, fontWeight: '600', marginLeft: 8 },
    searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: -14 },
    searchContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12,
        borderWidth: 1, borderColor: C.divider,
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: SIZES.font, color: C.textPrimary },
    viewToggle: {
        width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
        backgroundColor: C.surface, borderRadius: 12, marginLeft: 8,
        borderWidth: 1, borderColor: C.divider,
    },
    warningBanner: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.accentLight,
        marginHorizontal: 16, marginTop: 10, padding: 12, borderRadius: 10,
    },
    warningText: { flex: 1, fontSize: 11, color: C.accent, marginLeft: 8, lineHeight: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },

    // Grid
    gridContainer: { padding: 12, paddingBottom: 30 },
    gridRow: { justifyContent: 'space-between' },
    gridCard: {
        backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 10,
        width: '48%', alignItems: 'center', borderWidth: 1.5, borderColor: C.divider,
    },
    gridCardPlaying: { borderColor: C.primary, backgroundColor: C.primarySoft },
    gridNumberBadge: {
        width: 28, height: 28, borderRadius: 14, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    gridNumberBadgePlaying: { backgroundColor: C.primary },
    gridNumberText: { color: C.primary, fontSize: 11, fontWeight: '700' },
    gridArabic: { fontSize: 22, color: C.textPrimary, marginBottom: 6 },
    gridLatin: { fontSize: SIZES.small, color: C.primary, fontWeight: '600' },
    gridMeaning: { fontSize: 11, color: C.textMuted, textAlign: 'center', marginTop: 4 },
    gridPlayingIcon: { position: 'absolute', top: 10, right: 10 },

    // List
    listContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 30 },
    listCard: {
        backgroundColor: C.surface, borderRadius: 14, marginBottom: 8, overflow: 'hidden',
        borderWidth: 1.5, borderColor: C.divider,
    },
    listCardPlaying: { borderColor: C.primary, backgroundColor: C.primarySoft },
    listCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    listNumberBadge: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    listNumberBadgePlaying: { backgroundColor: C.primary },
    listNumberText: { color: C.primary, fontSize: SIZES.small, fontWeight: '700' },
    listCardContent: { flex: 1, marginLeft: 14 },
    listArabic: { fontSize: 24, color: C.textPrimary },
    listLatin: { fontSize: SIZES.font, color: C.primary, fontWeight: '600', marginTop: 2 },
    listMeaning: { fontSize: SIZES.small, color: C.textMuted, marginTop: 2 },
    playBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    playBtnActive: { backgroundColor: C.primary },
    playingBar: {
        flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
        height: 20, paddingBottom: 8, paddingHorizontal: 14,
    },
    soundBar: { width: 3, backgroundColor: C.primary, marginHorizontal: 1.5, borderRadius: 2 },

    // Player
    playerContainer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surface,
        borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 30,
        shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 20,
    },
    playerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    playerInfo: { flex: 1 },
    playerArabic: { fontSize: 22, color: C.textPrimary, fontWeight: '600' },
    playerLatin: { fontSize: SIZES.small, color: C.textMuted, marginTop: 2 },
    progressBar: { height: 3, backgroundColor: C.divider, borderRadius: 2, marginTop: 10, marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
    playerControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    playerControlBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    playerPlayBtn: {
        width: 56, height: 56, borderRadius: 28, backgroundColor: C.primary,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    autoPlayLabel: { fontSize: 9, color: C.textMuted, fontWeight: '600', marginTop: 1 },
    speedControl: { flexDirection: 'row', alignItems: 'center' },
    speedBtn: {
        width: 24, height: 24, borderRadius: 12, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    speedBtnText: { fontSize: 14, fontWeight: '700', color: C.primary },
    speedText: { fontSize: 11, fontWeight: '700', color: C.textMuted, marginHorizontal: 4 },
});

export default AsmaulHusnaScreen;
