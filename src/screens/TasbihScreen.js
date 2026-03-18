import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Animated,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const DZIKIR_LIST = [
  { id: 1, arabic: 'سُبْحَانَ اللَّهِ', latin: 'Subhanallah', meaning: 'Maha Suci Allah', target: 33 },
  { id: 2, arabic: 'اَلْحَمْدُ لِلَّهِ', latin: 'Alhamdulillah', meaning: 'Segala puji bagi Allah', target: 33 },
  { id: 3, arabic: 'اللَّهُ أَكْبَرُ', latin: 'Allahu Akbar', meaning: 'Allah Maha Besar', target: 33 },
  { id: 4, arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', latin: 'La ilaha illallah', meaning: 'Tidak ada Tuhan selain Allah', target: 100 },
  { id: 5, arabic: 'أَسْتَغْفِرُ اللَّهَ', latin: 'Astaghfirullah', meaning: 'Aku memohon ampun kepada Allah', target: 100 },
  { id: 6, arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ', latin: 'La hawla wa la quwwata illa billah', meaning: 'Tidak ada daya dan kekuatan kecuali dengan Allah', target: 100 },
];

const TasbihScreen = () => {
  const [count, setCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDzikir, setSelectedDzikir] = useState(DZIKIR_LIST[0]);
  const [showDzikirList, setShowDzikirList] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: count / selectedDzikir.target,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [count, selectedDzikir.target]);

  const handlePress = () => {
    Vibration.vibrate(30);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    if (count >= selectedDzikir.target) {
      Vibration.vibrate([0, 100, 50, 100]);
      setCount(0);
    } else {
      setCount((prev) => prev + 1);
      setTotalCount((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    setCount(0);
  };

  const selectDzikir = (dzikir) => {
    setSelectedDzikir(dzikir);
    setCount(0);
    setShowDzikirList(false);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasbih Digital</Text>
        <Text style={styles.headerSubtitle}>Total hari ini: {totalCount}</Text>
      </View>

      {showDzikirList ? (
        <ScrollView style={styles.dzikirListContainer}>
          {DZIKIR_LIST.map((dzikir) => (
            <TouchableOpacity
              key={dzikir.id}
              style={[
                styles.dzikirItem,
                selectedDzikir.id === dzikir.id && styles.dzikirItemActive,
              ]}
              onPress={() => selectDzikir(dzikir)}
            >
              <Text style={styles.dzikirItemArabic}>{dzikir.arabic}</Text>
              <Text style={styles.dzikirItemLatin}>{dzikir.latin}</Text>
              <Text style={styles.dzikirItemMeaning}>{dzikir.meaning}</Text>
              <Text style={styles.dzikirItemTarget}>Target: {dzikir.target}x</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.dzikirSelector}
            onPress={() => setShowDzikirList(true)}
          >
            <Text style={styles.dzikirArabic}>{selectedDzikir.arabic}</Text>
            <Text style={styles.dzikirLatin}>{selectedDzikir.latin}</Text>
            <Text style={styles.dzikirMeaning}>{selectedDzikir.meaning}</Text>
            <View style={styles.changeBtn}>
              <Text style={styles.changeBtnText}>Ganti Dzikir</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>
            <Text style={styles.progressText}>
              {count} / {selectedDzikir.target}
            </Text>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.countButton}
              onPress={handlePress}
              activeOpacity={0.8}
            >
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.tapText}>Ketuk untuk menghitung</Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleReset}>
              <Ionicons name="refresh" size={24} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 55,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.font,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  dzikirSelector: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dzikirArabic: {
    fontSize: 32,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  dzikirLatin: {
    fontSize: SIZES.medium,
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  dzikirMeaning: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
  },
  changeBtnText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
  progressContainer: {
    width: '80%',
    marginTop: 24,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    marginTop: 8,
    fontWeight: '600',
  },
  countButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  countText: {
    fontSize: 56,
    fontWeight: '700',
    color: COLORS.white,
  },
  tapText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  bottomActions: {
    flexDirection: 'row',
    marginTop: 30,
  },
  actionBtn: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionBtnText: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
  },
  dzikirListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dzikirItem: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dzikirItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  dzikirItemArabic: {
    fontSize: SIZES.arabic,
    color: COLORS.darkGray,
  },
  dzikirItemLatin: {
    fontSize: SIZES.font,
    color: COLORS.primary,
    fontWeight: '600',
    fontStyle: 'italic',
    marginTop: 6,
  },
  dzikirItemMeaning: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  dzikirItemTarget: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 6,
  },
});

export default TasbihScreen;
