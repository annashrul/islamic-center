import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const AUDIO_BASE = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy';

const SurahDetailScreen = ({ route, navigation }) => {
  const { surah } = route.params;
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [fontSize, setFontSize] = useState(SIZES.arabicLarge);

  // Audio states
  const [currentPlayingAyah, setCurrentPlayingAyah] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // 'none', 'one', 'all'

  const soundRef = useRef(null);
  const flatListRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for playing ayah
  useEffect(() => {
    if (isPlaying) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    fetchSurah();
  }, []);

  const fetchSurah = async () => {
    try {
      const [arabicRes, translationRes, audioRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surah.number}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/id.indonesian`),
        fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`),
      ]);

      const arabicData = await arabicRes.json();
      const translationData = await translationRes.json();
      const audioData = await audioRes.json();

      if (arabicData.code === 200 && translationData.code === 200) {
        const combinedAyahs = arabicData.data.ayahs.map((ayah, index) => ({
          ...ayah,
          translation: translationData.data.ayahs[index]?.text || '',
          audio: audioData.code === 200 ? audioData.data.ayahs[index]?.audio : `${AUDIO_BASE}/${ayah.number}.mp3`,
        }));
        setAyahs(combinedAyahs);
      }
    } catch (error) {
      console.error('Error fetching surah:', error);
    } finally {
      setLoading(false);
    }
  };

  const stopAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {}
      soundRef.current = null;
    }
    setIsPlaying(false);
    setCurrentPlayingAyah(null);
    setAudioLoading(false);
  };

  const playAyah = useCallback(async (ayah, index) => {
    try {
      // Stop current audio if playing
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      setAudioLoading(true);
      setCurrentPlayingAyah(ayah.numberInSurah);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const audioUrl = ayah.audio || `${AUDIO_BASE}/${ayah.number}.mp3`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      soundRef.current = sound;
      setIsPlaying(true);
      setAudioLoading(false);

      // Scroll to the playing ayah
      if (flatListRef.current && index >= 0) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3,
        });
      }

      // Listen for playback finish
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          handleAyahFinished(ayah, index);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      setAudioLoading(false);
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
    }
  }, [ayahs, autoPlay, repeatMode]);

  const handleAyahFinished = useCallback((ayah, index) => {
    if (repeatMode === 'one') {
      // Repeat the same ayah
      const currentAyah = ayahs[index];
      if (currentAyah) {
        playAyah(currentAyah, index);
      }
    } else if (autoPlay && index < ayahs.length - 1) {
      // Auto-play next ayah
      const nextIndex = index + 1;
      const nextAyah = ayahs[nextIndex];
      if (nextAyah) {
        playAyah(nextAyah, nextIndex);
      }
    } else if (repeatMode === 'all' && index === ayahs.length - 1) {
      // Repeat all: go back to first ayah
      playAyah(ayahs[0], 0);
    } else {
      setIsPlaying(false);
      setCurrentPlayingAyah(null);
    }
  }, [ayahs, autoPlay, repeatMode]);

  const togglePlayPause = async () => {
    if (!soundRef.current) return;

    const status = await soundRef.current.getStatusAsync();
    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (currentPlayingAyah === null) return;
    const currentIndex = ayahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);
    if (currentIndex < ayahs.length - 1) {
      playAyah(ayahs[currentIndex + 1], currentIndex + 1);
    }
  };

  const playPrevious = () => {
    if (currentPlayingAyah === null) return;
    const currentIndex = ayahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);
    if (currentIndex > 0) {
      playAyah(ayahs[currentIndex - 1], currentIndex - 1);
    }
  };

  const playAllFromStart = () => {
    if (ayahs.length > 0) {
      playAyah(ayahs[0], 0);
    }
  };

  const cycleRepeatMode = () => {
    if (repeatMode === 'none') setRepeatMode('one');
    else if (repeatMode === 'one') setRepeatMode('all');
    else setRepeatMode('none');
  };

  const getRepeatIcon = () => {
    if (repeatMode === 'one') return 'repeat';
    if (repeatMode === 'all') return 'repeat';
    return 'repeat';
  };

  const renderHeader = () => (
    <View style={styles.surahHeader}>
      <View style={styles.surahHeaderBg}>
        <Text style={styles.surahName}>{surah.name}</Text>
        <Text style={styles.surahArabic}>{surah.arabic}</Text>
        <Text style={styles.surahMeaning}>{surah.meaning}</Text>
        <View style={styles.surahMeta}>
          <Text style={styles.surahMetaText}>{surah.type}</Text>
          <View style={styles.metaDot} />
          <Text style={styles.surahMetaText}>{surah.verses} Ayat</Text>
        </View>
        {surah.number !== 9 && (
          <View style={styles.bismillahContainer}>
            <Text style={styles.bismillah}>{BISMILLAH}</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlBtn, showTranslation && styles.controlBtnActive]}
          onPress={() => setShowTranslation(!showTranslation)}
        >
          <Ionicons
            name="language"
            size={16}
            color={showTranslation ? COLORS.white : COLORS.primary}
          />
          <Text
            style={[styles.controlText, showTranslation && styles.controlTextActive]}
          >
            Terjemahan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, autoPlay && styles.controlBtnActive]}
          onPress={() => setAutoPlay(!autoPlay)}
        >
          <Ionicons
            name="play-forward"
            size={16}
            color={autoPlay ? COLORS.white : COLORS.primary}
          />
          <Text style={[styles.controlText, autoPlay && styles.controlTextActive]}>
            Auto Play
          </Text>
        </TouchableOpacity>

        <View style={styles.fontSizeControls}>
          <TouchableOpacity
            style={styles.fontSizeBtn}
            onPress={() => setFontSize((prev) => Math.max(24, prev - 2))}
          >
            <Text style={styles.fontSizeBtnText}>A-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fontSizeBtn}
            onPress={() => setFontSize((prev) => Math.min(44, prev + 2))}
          >
            <Text style={styles.fontSizeBtnText}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAyah = ({ item, index }) => {
    const isCurrentAyah = currentPlayingAyah === item.numberInSurah;

    return (
      <View style={[styles.ayahContainer, isCurrentAyah && styles.ayahContainerPlaying]}>
        <View style={styles.ayahHeader}>
          <Animated.View
            style={[
              styles.ayahNumber,
              isCurrentAyah && styles.ayahNumberPlaying,
              isCurrentAyah && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={[styles.ayahNumberText, isCurrentAyah && styles.ayahNumberTextPlaying]}>
              {item.numberInSurah}
            </Text>
          </Animated.View>
          <View style={styles.ayahActions}>
            <TouchableOpacity
              style={[styles.ayahActionBtn, isCurrentAyah && styles.ayahActionBtnPlaying]}
              onPress={() => {
                if (isCurrentAyah && isPlaying) {
                  togglePlayPause();
                } else if (isCurrentAyah && !isPlaying) {
                  togglePlayPause();
                } else {
                  playAyah(item, index);
                }
              }}
            >
              {audioLoading && isCurrentAyah ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons
                  name={isCurrentAyah && isPlaying ? 'pause' : 'play'}
                  size={18}
                  color={isCurrentAyah ? COLORS.white : COLORS.primary}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.ayahActionBtn}>
              <Ionicons name="bookmark-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.ayahActionBtn}>
              <Ionicons name="share-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {isCurrentAyah && isPlaying && (
          <View style={styles.playingIndicator}>
            <View style={styles.soundBars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.soundBar,
                    { height: 4 + Math.random() * 12 },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.playingText}>Sedang diputar...</Text>
          </View>
        )}

        <Text style={[styles.arabicText, { fontSize }]}>{item.text}</Text>
        {showTranslation && item.translation && (
          <Text style={styles.translation}>{item.translation}</Text>
        )}
      </View>
    );
  };

  const renderAudioPlayer = () => {
    if (currentPlayingAyah === null) return null;

    const currentIndex = ayahs.findIndex((a) => a.numberInSurah === currentPlayingAyah);

    return (
      <View style={styles.audioPlayer}>
        <View style={styles.audioPlayerTop}>
          <View style={styles.audioInfo}>
            <Text style={styles.audioInfoSurah}>{surah.name}</Text>
            <Text style={styles.audioInfoAyah}>Ayat {currentPlayingAyah} dari {ayahs.length}</Text>
          </View>
          <TouchableOpacity onPress={stopAudio} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex + 1) / ayahs.length) * 100}%` }]} />
        </View>

        <View style={styles.audioControls}>
          <TouchableOpacity onPress={cycleRepeatMode} style={styles.audioControlBtn}>
            <Ionicons
              name={getRepeatIcon()}
              size={22}
              color={repeatMode !== 'none' ? COLORS.primary : COLORS.gray}
            />
            {repeatMode === 'one' && <Text style={styles.repeatBadge}>1</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playPrevious}
            style={styles.audioControlBtn}
            disabled={currentIndex <= 0}
          >
            <Ionicons
              name="play-skip-back"
              size={24}
              color={currentIndex > 0 ? COLORS.darkGray : COLORS.lightGray}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlayPause} style={styles.playPauseBtn}>
            {audioLoading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color={COLORS.white}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playNext}
            style={styles.audioControlBtn}
            disabled={currentIndex >= ayahs.length - 1}
          >
            <Ionicons
              name="play-skip-forward"
              size={24}
              color={currentIndex < ayahs.length - 1 ? COLORS.darkGray : COLORS.lightGray}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAutoPlay(!autoPlay)}
            style={styles.audioControlBtn}
          >
            <Ionicons
              name="play-forward"
              size={22}
              color={autoPlay ? COLORS.primary : COLORS.gray}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => { stopAudio(); navigation.goBack(); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>{surah.name}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={playAllFromStart}>
          <Ionicons name="play-circle-outline" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat surah...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={ayahs}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderAyah}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            currentPlayingAyah !== null && { paddingBottom: 140 },
          ]}
          onScrollToIndexFailed={(info) => {
            flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
          }}
        />
      )}

      {renderAudioPlayer()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
  },
  surahHeader: {
    marginBottom: 8,
  },
  surahHeaderBg: {
    backgroundColor: COLORS.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  surahName: {
    fontSize: SIZES.extraLarge,
    fontWeight: '700',
    color: COLORS.white,
  },
  surahArabic: {
    fontSize: 36,
    color: COLORS.secondary,
    marginTop: 8,
  },
  surahMeaning: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  surahMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  surahMetaText: {
    fontSize: SIZES.small,
    color: 'rgba(255,255,255,0.6)',
  },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 8,
  },
  bismillahContainer: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  bismillah: {
    fontSize: 26,
    color: COLORS.white,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  controlBtnActive: {
    backgroundColor: COLORS.primary,
  },
  controlText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  controlTextActive: {
    color: COLORS.white,
  },
  fontSizeControls: {
    flexDirection: 'row',
  },
  fontSizeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    marginLeft: 8,
  },
  fontSizeBtnText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.primary,
  },
  listContainer: {
    paddingBottom: 30,
  },
  ayahContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
  },
  ayahContainerPlaying: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ayahNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ayahNumberPlaying: {
    backgroundColor: COLORS.secondary,
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  ayahNumberText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '700',
  },
  ayahNumberTextPlaying: {
    fontSize: SIZES.font,
  },
  ayahActions: {
    flexDirection: 'row',
  },
  ayahActionBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 17,
  },
  ayahActionBtnPlaying: {
    backgroundColor: COLORS.primary,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  soundBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    marginRight: 8,
  },
  soundBar: {
    width: 3,
    backgroundColor: COLORS.primary,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  playingText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  arabicText: {
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 56,
    marginBottom: 12,
  },
  translation: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    lineHeight: 22,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: 12,
  },
  // Audio Player Bottom Bar
  audioPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  audioPlayerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioInfo: {},
  audioInfoSurah: {
    fontSize: SIZES.font,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  audioInfoAyah: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 3,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  audioControlBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  repeatBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
  },
});

export default SurahDetailScreen;
