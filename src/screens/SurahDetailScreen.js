import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, ActivityIndicator,
    TouchableOpacity, Animated, Alert, Modal, TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { QURAN_AUDIO_CDN } from '../constants/apiUrls';
import { saveLastRead, getLastRead } from '../services/lastReadService';
import { fetchSurahList, fetchSurahDetail } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650';

const SurahDetailScreen = ({ route, navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const { surah, scrollToAyah, autoPlayFirstAyah } = route.params;
    const [ayahs, setAyahs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showTranslation, setShowTranslation] = useState(true);
    const [showLatin, setShowLatin] = useState(true);
    const [fontSize, setFontSize] = useState(SIZES.arabicLarge);
    const [currentPlayingAyah, setCurrentPlayingAyah] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [autoPlay, setAutoPlay] = useState(true);
    const [audioLoading, setAudioLoading] = useState(false);
    const [repeatMode, setRepeatMode] = useState('none');
    const [markedAyah, setMarkedAyah] = useState(null);
    const [prevSurah, setPrevSurah] = useState(null);
    const [nextSurah, setNextSurah] = useState(null);
    const [showJumpModal, setShowJumpModal] = useState(false);
    const [jumpInput, setJumpInput] = useState('');
    const [highlightedAyah, setHighlightedAyah] = useState(null);
    const highlightTimer = useRef(null);

    const jumpToAyah = () => {
        const num = parseInt(jumpInput);
        if (!num || num < 1 || num > ayahs.length) {
            Alert.alert('', `Masukkan nomor ayat 1 - ${ayahs.length}`);
            return;
        }
        const idx = ayahs.findIndex((a) => a.numberInSurah === num);
        if (idx >= 0 && flatListRef.current) {
            // Set highlight
            setHighlightedAyah(num);
            if (highlightTimer.current) clearTimeout(highlightTimer.current);
            highlightTimer.current = setTimeout(() => setHighlightedAyah(null), 3000);

            try {
                flatListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.1 });
            } catch (e) {
                flatListRef.current.scrollToOffset({ offset: idx * 200, animated: true });
            }
        }
        setShowJumpModal(false);
        setJumpInput('');
    };

    const soundRef = useRef(null);
    const flatListRef = useRef(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (isPlaying) {
            const p = Animated.loop(Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            ]));
            p.start();
            return () => p.stop();
        } else { pulseAnim.setValue(1); }
    }, [isPlaying]);

    useEffect(() => { return () => { stopAudio(); }; }, []);
    useEffect(() => { fetchSurah(); loadMarked(); loadSurahNav(); }, []);

    const loadSurahNav = async () => {
        try {
            const list = await fetchSurahList();
            const formatted = list.map((s) => ({
                number: s.number, name: s.englishName, arabic: s.name,
                meaning: s.englishNameTranslation, verses: s.numberOfAyahs,
                type: s.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah',
            }));
            const idx = formatted.findIndex((s) => s.number === surah.number);
            if (idx > 0) setPrevSurah(formatted[idx - 1]);
            if (idx < formatted.length - 1) setNextSurah(formatted[idx + 1]);
        } catch (e) { }
    };

    const navigateToSurah = (targetSurah, shouldAutoPlayFirstAyah = false) => {
        stopAudio();
        navigation.replace('SurahDetail', { surah: targetSurah, autoPlayFirstAyah: shouldAutoPlayFirstAyah });
    };

    // Auto-scroll to marked ayah after data loads, and ensure it's marked
    useEffect(() => {
        if (ayahs.length > 0 && scrollToAyah) {
            setMarkedAyah(scrollToAyah);
            const idx = ayahs.findIndex((a) => a.numberInSurah === scrollToAyah);
            if (idx >= 0 && flatListRef.current) {
                setTimeout(() => {
                    try {
                        flatListRef.current.scrollToIndex({ index: idx, animated: true, viewPosition: 0.2 });
                    } catch (e) {
                        flatListRef.current.scrollToOffset({ offset: idx * 200, animated: true });
                    }
                }, 500);
            }
        }
    }, [ayahs, scrollToAyah]);

    const loadMarked = async () => {
        const data = await getLastRead();
        if (data && data.surahNumber === surah.number) {
            setMarkedAyah(data.ayahNumber);
        }
    };

    const markAsLastRead = (ayahNumber) => {
        setMarkedAyah(ayahNumber);
        saveLastRead({
            surahNumber: surah.number, surahName: surah.name, surahArabic: surah.arabic,
            surahMeaning: surah.meaning, surahVerses: surah.verses, surahType: surah.type,
            ayahNumber, type: 'surah',
        });
    };

    const fetchSurah = async () => {
        try {
            const ayahs = await fetchSurahDetail(surah.number);
            setAyahs(ayahs);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const stopAudio = async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (e) { }
            soundRef.current = null;
        }
        setIsPlaying(false); setCurrentPlayingAyah(null); setAudioLoading(false);
    };

    const playAyah = useCallback(async (ayah, index) => {
        try {
            if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); soundRef.current = null; }
            setAudioLoading(true); setCurrentPlayingAyah(ayah.numberInSurah);
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true, staysActiveInBackground: true });
            const { sound } = await Audio.Sound.createAsync({ uri: ayah.audio || `${QURAN_AUDIO_CDN}/${ayah.number}.mp3` }, { shouldPlay: true });
            soundRef.current = sound; setIsPlaying(true); setAudioLoading(false);
            if (flatListRef.current) { try { flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 }); } catch (e) { } }
            sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) handleFinished(ayah, index); });
        } catch (e) { setAudioLoading(false); setIsPlaying(false); setCurrentPlayingAyah(null); }
    }, [ayahs, autoPlay, repeatMode]);

    const handleFinished = useCallback((ayah, index) => {
        if (repeatMode === 'one') { playAyah(ayahs[index], index); }
        else if (autoPlay && index < ayahs.length - 1) { playAyah(ayahs[index + 1], index + 1); }
        else if (repeatMode === 'all' && index === ayahs.length - 1) { playAyah(ayahs[0], 0); }
        else if (autoPlay && index === ayahs.length - 1 && nextSurah) { navigateToSurah(nextSurah, true); }
        else { setIsPlaying(false); setCurrentPlayingAyah(null); }
    }, [ayahs, autoPlay, repeatMode, nextSurah]);

    useEffect(() => {
        if (ayahs.length > 0 && autoPlayFirstAyah) {
            playAyah(ayahs[0], 0);
        }
    }, [ayahs, autoPlayFirstAyah, playAyah]);

    const togglePlayPause = async () => {
        if (!soundRef.current) return;
        const s = await soundRef.current.getStatusAsync();
        if (s.isPlaying) { await soundRef.current.pauseAsync(); setIsPlaying(false); }
        else { await soundRef.current.playAsync(); setIsPlaying(true); }
    };

    const playNext = () => { const i = ayahs.findIndex((a) => a.numberInSurah === currentPlayingAyah); if (i < ayahs.length - 1) playAyah(ayahs[i + 1], i + 1); };
    const playPrev = () => { const i = ayahs.findIndex((a) => a.numberInSurah === currentPlayingAyah); if (i > 0) playAyah(ayahs[i - 1], i - 1); };
    const cycleRepeat = () => { setRepeatMode(repeatMode === 'none' ? 'one' : repeatMode === 'one' ? 'all' : 'none'); };

    // ===== RENDER =====
    const renderHeader = () => (
        <View>
            {/* Surah info banner */}
            <View style={styles.banner}>
                <View style={styles.bannerDecor}>
                    {[...Array(5)].map((_, i) => <View key={i} style={[styles.decorDot, { opacity: 0.1 + i * 0.05 }]} />)}
                </View>
                <Text style={styles.bannerArabic}>{surah.arabic}</Text>
                <Text style={styles.bannerName}>{surah.name}</Text>
                {surah.meaning ? <Text style={styles.bannerMeaning}>{surah.meaning}</Text> : null}
                <View style={styles.bannerMeta}>
                    {surah.type ? <View style={styles.metaChip}><Text style={styles.metaChipText}>{surah.type}</Text></View> : null}
                    <View style={styles.metaChip}><Text style={styles.metaChipText}>{ayahs.length || surah.verses} Ayat</Text></View>
                </View>

                {surah.number !== 9 && (
                    <View style={styles.bismillahBox}>
                        <View style={styles.bismillahLine} />
                        <Text style={styles.bismillah}>{BISMILLAH}</Text>
                        <View style={styles.bismillahLine} />
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
                <TouchableOpacity style={[styles.chip, showLatin && styles.chipActive]} onPress={() => setShowLatin(!showLatin)}>
                    <Ionicons name="text-outline" size={14} color={showLatin ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.chipText, showLatin && styles.chipTextActive]}>{t.latin}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.chip, showTranslation && styles.chipActive]} onPress={() => setShowTranslation(!showTranslation)}>
                    <Ionicons name="language-outline" size={14} color={showTranslation ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.chipText, showTranslation && styles.chipTextActive]}>{t.translation}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.chip, autoPlay && styles.chipActive]} onPress={() => setAutoPlay(!autoPlay)}>
                    <Ionicons name="play-forward-outline" size={14} color={autoPlay ? COLORS.white : COLORS.primary} />
                    <Text style={[styles.chipText, autoPlay && styles.chipTextActive]}>{t.auto_play}</Text>
                </TouchableOpacity>
                <View style={styles.fontControls}>
                    <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize((p) => Math.max(22, p - 2))}>
                        <Text style={styles.fontBtnText}>A-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fontBtn} onPress={() => setFontSize((p) => Math.min(46, p + 2))}>
                        <Text style={styles.fontBtnText}>A+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderAyah = ({ item, index }) => {
        const isCurrent = currentPlayingAyah === item.numberInSurah;
        const isMarked = markedAyah === item.numberInSurah;
        const isHighlighted = highlightedAyah === item.numberInSurah;

        return (
            <View style={[
                styles.ayahCard,
                isCurrent && styles.ayahCardPlaying,
                isMarked && !isCurrent && styles.ayahCardMarked,
                isHighlighted && !isCurrent && !isMarked && styles.ayahCardHighlighted,
            ]}>
                {/* Highlighted badge */}
                {isHighlighted && !isMarked && (
                    <View style={styles.highlightBadge}>
                        <Ionicons name="navigate" size={10} color={COLORS.white} />
                        <Text style={styles.highlightBadgeText}>Ayat {item.numberInSurah}</Text>
                    </View>
                )}
                {/* Marked badge */}
                {isMarked && (
                    <View style={styles.markedBadge}>
                        <Ionicons name="bookmark" size={10} color={COLORS.white} />
                        <Text style={styles.markedBadgeText}>{t.last_read_badge}</Text>
                    </View>
                )}

                {/* Ayah number & actions row */}
                <View style={styles.ayahTopRow}>
                    <Animated.View style={[
                        styles.ayahBadge,
                        isCurrent && styles.ayahBadgePlaying,
                        isMarked && !isCurrent && styles.ayahBadgeMarked,
                        isCurrent && isPlaying && { transform: [{ scale: pulseAnim }] },
                    ]}>
                        <Text style={[styles.ayahBadgeText, (isCurrent || isMarked) && { color: COLORS.white }]}>{item.numberInSurah}</Text>
                    </Animated.View>

                    <View style={styles.ayahActions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, isCurrent && isPlaying && styles.actionBtnActive]}
                            onPress={() => isCurrent ? togglePlayPause() : playAyah(item, index)}
                        >
                            {audioLoading && isCurrent ? (
                                <ActivityIndicator size={14} color={COLORS.primary} />
                            ) : (
                                <Ionicons name={isCurrent && isPlaying ? 'pause' : 'play'} size={14} color={isCurrent && isPlaying ? COLORS.white : COLORS.primary} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, isMarked && styles.actionBtnMarked]}
                            onPress={() => markAsLastRead(item.numberInSurah)}
                        >
                            <Ionicons name={isMarked ? 'bookmark' : 'bookmark-outline'} size={14} color={isMarked ? COLORS.white : COLORS.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Ionicons name="copy-outline" size={14} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Playing indicator */}
                {isCurrent && isPlaying && (
                    <View style={styles.playingRow}>
                        {[...Array(8)].map((_, i) => (
                            <View key={i} style={[styles.eqBar, { height: 4 + Math.random() * 10 }]} />
                        ))}
                        <Text style={styles.playingLabel}>{t.now_playing}</Text>
                    </View>
                )}

                {/* Arabic text */}
                <Text style={[styles.arabicText, { fontSize }]}>{item.text}</Text>

                {/* Latin transliteration */}
                {showLatin && item.latin && (
                    <Text style={styles.latinText}>{item.latin}</Text>
                )}

                {/* Translation */}
                {showTranslation && item.translation && (
                    <View style={styles.translationBox}>
                        <Text style={styles.translationText}>{item.translation}</Text>
                    </View>
                )}
            </View>
        );
    };

    const renderPlayer = () => {
        if (currentPlayingAyah === null) return null;
        const idx = ayahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);

        return (
            <View style={styles.player}>
                <View style={styles.playerInfo}>
                    <View style={styles.playerIcon}>
                        <Ionicons name="musical-notes" size={16} color={COLORS.primary} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.playerTitle}>{surah.name} · Ayat {currentPlayingAyah}</Text>
                        <Text style={styles.playerSub}>{idx + 1} dari {ayahs.length} ayat</Text>
                    </View>
                    <TouchableOpacity onPress={stopAudio}>
                        <Ionicons name="close" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>

                {/* Progress */}
                <View style={styles.playerProgress}>
                    <View style={[styles.playerProgressFill, { width: `${((idx + 1) / ayahs.length) * 100}%` }]} />
                </View>

                {/* Controls */}
                <View style={styles.playerControls}>
                    <TouchableOpacity onPress={cycleRepeat} style={styles.pCtrlBtn}>
                        <Ionicons name="repeat" size={18} color={repeatMode !== 'none' ? COLORS.primary : COLORS.textMuted} />
                        {repeatMode === 'one' && <Text style={styles.repeatDot}>1</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playPrev} style={styles.pCtrlBtn} disabled={idx <= 0}>
                        <Ionicons name="play-skip-back" size={20} color={idx > 0 ? COLORS.textPrimary : COLORS.border} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={togglePlayPause} style={styles.pPlayBtn}>
                        {audioLoading ? <ActivityIndicator size="small" color={COLORS.white} />
                            : <Ionicons name={isPlaying ? 'pause' : 'play'} size={24} color={COLORS.white} />}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={playNext} style={styles.pCtrlBtn} disabled={idx >= ayahs.length - 1}>
                        <Ionicons name="play-skip-forward" size={20} color={idx < ayahs.length - 1 ? COLORS.textPrimary : COLORS.border} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setAutoPlay(!autoPlay)} style={styles.pCtrlBtn}>
                        <Ionicons name="play-forward" size={18} color={autoPlay ? COLORS.primary : COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Nav */}
            <View style={styles.nav}>
                <TouchableOpacity onPress={() => { stopAudio(); navigation.goBack(); }} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.navTitle}>{surah.name}</Text>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={styles.navBtn} onPress={() => !loading && setShowJumpModal(true)}>
                        <Ionicons name="swap-vertical" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navBtn} onPress={() => ayahs.length > 0 && playAyah(ayahs[0], 0)}>
                        <Ionicons name="play-circle" size={22} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t.loading_surah_detail}</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={ayahs}
                    keyExtractor={(item) => item.number.toString()}
                    renderItem={renderAyah}
                    ListHeaderComponent={renderHeader}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.list, { paddingBottom: currentPlayingAyah !== null ? 150 : 80 }]}
                    onScrollToIndexFailed={(info) => { flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true }); }}
                />
            )}

            {renderPlayer()}

            {/* Jump to Ayah Modal */}
            <Modal visible={showJumpModal} transparent animationType="fade" onRequestClose={() => setShowJumpModal(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowJumpModal(false)}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>{t.jump_to_ayah}</Text>
                        <Text style={styles.modalSub}>{surah.name} · {ayahs.length} ayat</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder={`1 - ${ayahs.length}`}
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric"
                            value={jumpInput}
                            onChangeText={setJumpInput}
                            autoFocus
                            onSubmitEditing={jumpToAyah}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowJumpModal(false)}>
                                <Text style={styles.modalCancelText}>{t.cancel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalGoBtn} onPress={jumpToAyah}>
                                <Ionicons name="arrow-down" size={16} color={COLORS.white} />
                                <Text style={styles.modalGoText}>{t.jump}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick jump buttons */}
                        <View style={styles.quickJumps}>
                            {[1, Math.ceil(ayahs.length / 4), Math.ceil(ayahs.length / 2), Math.ceil(ayahs.length * 3 / 4), ayahs.length].map((n) => (
                                <TouchableOpacity
                                    key={n}
                                    style={styles.quickJumpBtn}
                                    onPress={() => { setJumpInput(String(n)); }}
                                >
                                    <Text style={styles.quickJumpText}>{n}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Floating Prev/Next */}
            {!loading && (
                <View style={[styles.floatingNav, currentPlayingAyah !== null && { bottom: 140 }]}>
                    {prevSurah ? (
                        <TouchableOpacity style={styles.floatingNavBtn} onPress={() => navigateToSurah(prevSurah)} activeOpacity={0.8}>
                            <Ionicons name="chevron-back" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}

                    <View style={styles.floatingNavCenter}>
                        <Text style={styles.floatingNavSurah}>{surah.number} / 114</Text>
                    </View>

                    {nextSurah ? (
                        <TouchableOpacity style={styles.floatingNavBtn} onPress={() => navigateToSurah(nextSurah)} activeOpacity={0.8}>
                            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
                        </TouchableOpacity>
                    ) : <View style={{ width: 40 }} />}
                </View>
            )}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },

    // Nav
    nav: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 10, paddingBottom: 12, paddingHorizontal: 16,
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    navTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white, letterSpacing: -0.3 },

    // Banner
    banner: {
        backgroundColor: C.primary, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center',
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    bannerDecor: { flexDirection: 'row', marginBottom: 12 },
    decorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.white, marginHorizontal: 4 },
    bannerArabic: { fontSize: 40, color: C.accent, marginBottom: 4 },
    bannerName: { fontSize: SIZES.title, fontWeight: '700', color: C.white },
    bannerMeaning: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.55)', marginTop: 4 },
    bannerMeta: { flexDirection: 'row', marginTop: 12, gap: 8 },
    metaChip: {
        backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    metaChipText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    bismillahBox: { flexDirection: 'row', alignItems: 'center', marginTop: 24, width: '100%' },
    bismillahLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
    bismillah: { fontSize: 24, color: C.white, marginHorizontal: 14 },

    // Controls
    controlsRow: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    },
    chip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface,
    },
    chipActive: { backgroundColor: C.primary, borderColor: C.primary },
    chipText: { fontSize: 11, color: C.primary, fontWeight: '600', marginLeft: 5 },
    chipTextActive: { color: C.white },
    fontControls: { flexDirection: 'row', marginLeft: 'auto', gap: 6 },
    fontBtn: {
        width: 34, height: 34, borderRadius: 10, borderWidth: 1, borderColor: C.border,
        backgroundColor: C.surface, justifyContent: 'center', alignItems: 'center',
    },
    fontBtnText: { fontSize: 12, fontWeight: '700', color: C.primary },

    list: { paddingBottom: 30 },

    // Ayah card
    ayahCard: {
        backgroundColor: C.surface, marginHorizontal: 12, marginVertical: 4,
        borderRadius: SIZES.radius, padding: 18,
        borderWidth: 1, borderColor: C.divider,
    },
    ayahCardPlaying: {
        backgroundColor: C.primarySoft, borderColor: C.primary, borderWidth: 1.5,
    },
    ayahCardMarked: {
        backgroundColor: C.accentLight, borderColor: C.accent, borderWidth: 1.5,
    },
    ayahCardHighlighted: {
        backgroundColor: C.primarySoft, borderColor: C.primaryLight, borderWidth: 2,
    },
    highlightBadge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: C.primaryLight, paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, marginBottom: 10,
    },
    highlightBadgeText: { fontSize: 9, color: C.white, fontWeight: '700', marginLeft: 4 },
    markedBadge: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        backgroundColor: C.accent, paddingHorizontal: 8, paddingVertical: 3,
        borderRadius: 6, marginBottom: 10,
    },
    markedBadgeText: { fontSize: 9, color: C.white, fontWeight: '700', marginLeft: 4 },
    ayahTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    ayahBadge: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center',
    },
    ayahBadgePlaying: { backgroundColor: C.accent },
    ayahBadgeMarked: { backgroundColor: C.accent },
    ayahBadgeText: { fontSize: SIZES.small, fontWeight: '700', color: C.textSecondary },
    ayahActions: { flexDirection: 'row', gap: 4 },
    actionBtn: {
        width: 32, height: 32, borderRadius: 8, backgroundColor: C.surfaceAlt,
        justifyContent: 'center', alignItems: 'center',
    },
    actionBtnActive: { backgroundColor: C.primary },
    actionBtnMarked: { backgroundColor: C.accent },

    // Playing indicator
    playingRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10, gap: 2 },
    eqBar: { width: 3, backgroundColor: C.primary, borderRadius: 1.5 },
    playingLabel: { fontSize: 10, color: C.primary, fontWeight: '600', marginLeft: 6, alignSelf: 'center' },

    // Arabic
    arabicText: { color: C.textPrimary, textAlign: 'right', lineHeight: 58, marginBottom: 10 },

    // Latin
    latinText: {
        fontSize: SIZES.font, color: C.primary, fontStyle: 'italic',
        lineHeight: 22, marginBottom: 10,
    },

    // Translation
    translationBox: {
        backgroundColor: C.surfaceAlt, borderRadius: 10, padding: 14, marginTop: 4,
    },
    translationText: { fontSize: SIZES.font, color: C.textSecondary, lineHeight: 22 },

    // Jump Modal
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
    },
    modalCard: {
        backgroundColor: C.surface, borderRadius: SIZES.radiusLg, padding: 24,
        width: '80%', maxWidth: 320,
    },
    modalTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary },
    modalSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 4 },
    modalInput: {
        backgroundColor: C.surfaceAlt, borderRadius: SIZES.radiusSm, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: SIZES.title, fontWeight: '700', color: C.textPrimary, textAlign: 'center',
        marginTop: 16, borderWidth: 1, borderColor: C.divider,
    },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 10 },
    modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
    modalCancelText: { fontSize: SIZES.font, color: C.textMuted, fontWeight: '600' },
    modalGoBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.primary,
        paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10,
    },
    modalGoText: { fontSize: SIZES.font, color: C.white, fontWeight: '600', marginLeft: 6 },
    quickJumps: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    quickJumpBtn: {
        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
        backgroundColor: C.surfaceAlt, borderWidth: 1, borderColor: C.divider,
    },
    quickJumpText: { fontSize: SIZES.small, fontWeight: '700', color: C.primary },

    // Floating Surah Navigation
    floatingNav: {
        position: 'absolute', bottom: 16, alignSelf: 'center',
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: C.surface, borderRadius: 24,
        paddingVertical: 6, paddingHorizontal: 6,
        borderWidth: 1, borderColor: C.divider,
    },
    floatingNavBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: C.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    floatingNavCenter: { paddingHorizontal: 16 },
    floatingNavSurah: { fontSize: SIZES.small, fontWeight: '700', color: C.textMuted },

    // Loading
    loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { fontSize: SIZES.font, color: C.textMuted, marginTop: 12 },

    // Bottom Player
    player: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: C.surface, borderTopLeftRadius: SIZES.radiusLg, borderTopRightRadius: SIZES.radiusLg,
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: 32,
        borderTopWidth: 1, borderColor: C.divider,
    },
    playerInfo: { flexDirection: 'row', alignItems: 'center' },
    playerIcon: {
        width: 38, height: 38, borderRadius: 10, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    playerTitle: { fontSize: SIZES.font, fontWeight: '700', color: C.textPrimary },
    playerSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 1 },
    playerProgress: { height: 3, backgroundColor: C.divider, borderRadius: 2, marginTop: 12, marginBottom: 10 },
    playerProgressFill: { height: '100%', backgroundColor: C.primary, borderRadius: 2 },
    playerControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    pCtrlBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    pPlayBtn: {
        width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    repeatDot: { position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: '700', color: C.primary },
});

export default SurahDetailScreen;
