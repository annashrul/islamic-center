import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Vibration,
  Animated, ScrollView, StatusBar, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BEAD_SIZE = 28;
const RING_RADIUS = 130;
const TOTAL_BEADS = 33;

const DZIKIR_LIST = [
  { id: 1, arabic: '\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u0650', latin: 'Subhanallah', meaning: 'Maha Suci Allah', target: 33 },
  { id: 2, arabic: '\u0627\u064E\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650', latin: 'Alhamdulillah', meaning: 'Segala puji bagi Allah', target: 33 },
  { id: 3, arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0623\u064E\u0643\u0652\u0628\u064E\u0631\u064F', latin: 'Allahu Akbar', meaning: 'Allah Maha Besar', target: 33 },
  { id: 4, arabic: '\u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0627\u0644\u0644\u0651\u064E\u0647\u064F', latin: 'La ilaha illallah', meaning: 'Tidak ada Tuhan selain Allah', target: 100 },
  { id: 5, arabic: '\u0623\u064E\u0633\u0652\u062A\u064E\u063A\u0652\u0641\u0650\u0631\u064F \u0627\u0644\u0644\u0651\u064E\u0647\u064E', latin: 'Astaghfirullah', meaning: 'Aku mohon ampun kepada Allah', target: 100 },
  { id: 6, arabic: '\u0644\u064E\u0627 \u062D\u064E\u0648\u0652\u0644\u064E \u0648\u064E\u0644\u064E\u0627 \u0642\u064F\u0648\u0651\u064E\u0629\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0628\u0650\u0627\u0644\u0644\u0651\u064E\u0647\u0650', latin: 'La hawla wa la quwwata illa billah', meaning: 'Tiada daya kecuali dengan Allah', target: 100 },
];

const TasbihScreen = () => {
  const { colors: COLORS, t } = useSettings();
  const styles = makeStyles(COLORS);
  const [count, setCount] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDzikir, setSelectedDzikir] = useState(DZIKIR_LIST[0]);
  const [showPicker, setShowPicker] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const beadAnims = useRef(
    Array.from({ length: TOTAL_BEADS }, () => new Animated.Value(0))
  ).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Glow pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Animate bead when count changes
  useEffect(() => {
    const beadIdx = count % TOTAL_BEADS;
    if (count > 0) {
      Animated.sequence([
        Animated.timing(beadAnims[beadIdx === 0 ? TOTAL_BEADS - 1 : beadIdx - 1], {
          toValue: 0, duration: 150, useNativeDriver: true,
        }),
        Animated.timing(beadAnims[beadIdx], {
          toValue: 1, duration: 200, useNativeDriver: true,
        }),
      ]).start();

      // Rotate string slightly
      Animated.timing(rotateAnim, {
        toValue: count,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [count]);

  const handlePress = () => {
    Vibration.vibrate(25);

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 40, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    if (count >= selectedDzikir.target) {
      Vibration.vibrate([0, 80, 60, 80, 60, 80]);
      setCount(0);
      setRounds((r) => r + 1);
      // Reset beads
      beadAnims.forEach((a) => a.setValue(0));
    } else {
      setCount((c) => c + 1);
      setTotalCount((t) => t + 1);
    }
  };

  const handleReset = () => {
    setCount(0);
    setRounds(0);
    beadAnims.forEach((a) => a.setValue(0));
  };

  const selectDzikir = (d) => {
    setSelectedDzikir(d);
    setCount(0);
    setRounds(0);
    setShowPicker(false);
    beadAnims.forEach((a) => a.setValue(0));
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, TOTAL_BEADS],
    outputRange: ['0deg', '-360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.35],
  });

  // Render beads in a circle
  const renderBeads = () => {
    const beads = [];
    for (let i = 0; i < TOTAL_BEADS; i++) {
      const angle = (i / TOTAL_BEADS) * 2 * Math.PI - Math.PI / 2;
      const x = Math.cos(angle) * RING_RADIUS;
      const y = Math.sin(angle) * RING_RADIUS;
      const isActive = i < (count % TOTAL_BEADS) || (count > 0 && count % TOTAL_BEADS === 0 && count >= TOTAL_BEADS);
      const isCurrent = i === (count % TOTAL_BEADS) - 1 || (count % TOTAL_BEADS === 0 && count > 0 && i === TOTAL_BEADS - 1);

      const beadScale = beadAnims[i].interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
      });

      beads.push(
        <Animated.View
          key={i}
          style={[
            styles.bead,
            {
              left: RING_RADIUS + x - BEAD_SIZE / 2 + 20,
              top: RING_RADIUS + y - BEAD_SIZE / 2 + 20,
              backgroundColor: isActive ? COLORS.accent : '#D4CBC0',
              transform: [{ scale: isCurrent ? beadScale : 1 }],
            },
            isCurrent && styles.beadCurrent,
          ]}
        >
          {/* Bead highlight */}
          <View style={[
            styles.beadShine,
            { backgroundColor: isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.25)' },
          ]} />
        </Animated.View>
      );
    }
    return beads;
  };

  // ===== Dzikir Picker =====
  if (showPicker) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => setShowPicker(false)}>
            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>{t.pick_dzikir}</Text>
          <View style={{ width: 24 }} />
        </View>
        <ScrollView contentContainerStyle={styles.pickerList}>
          {DZIKIR_LIST.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[styles.pickerItem, selectedDzikir.id === d.id && styles.pickerItemActive]}
              onPress={() => selectDzikir(d)}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerArabic}>{d.arabic}</Text>
              <Text style={styles.pickerLatin}>{d.latin}</Text>
              <View style={styles.pickerBottom}>
                <Text style={styles.pickerMeaning}>{d.meaning}</Text>
                <View style={styles.pickerTarget}>
                  <Text style={styles.pickerTargetText}>{d.target}x</Text>
                </View>
              </View>
              {selectedDzikir.id === d.id && (
                <View style={styles.pickerCheck}>
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ===== Main Tasbih View =====
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Tasbih</Text>
          <Text style={styles.topBarSub}>Total: {totalCount} · Putaran: {rounds}</Text>
        </View>
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Ionicons name="refresh" size={18} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Dzikir text */}
      <TouchableOpacity style={styles.dzikirBox} onPress={() => setShowPicker(true)} activeOpacity={0.7}>
        <Text style={styles.dzikirArabic}>{selectedDzikir.arabic}</Text>
        <View style={styles.dzikirMeta}>
          <Text style={styles.dzikirLatin}>{selectedDzikir.latin}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
        </View>
      </TouchableOpacity>

      {/* Tasbih Ring */}
      <View style={styles.ringContainer}>
        {/* Glow behind */}
        <Animated.View style={[styles.ringGlow, { opacity: glowOpacity }]} />

        {/* String/Ring */}
        <View style={styles.ringOutline} />

        {/* Connector (top piece like real tasbih) */}
        <View style={styles.connector}>
          <View style={styles.connectorBead} />
          <View style={styles.connectorTassel} />
          <View style={styles.connectorTasselEnd} />
        </View>

        {/* Beads */}
        <Animated.View style={[styles.beadsContainer, { transform: [{ rotate: rotation }] }]}>
          {renderBeads()}
        </Animated.View>

        {/* Center counter */}
        <Animated.View style={[styles.centerCounter, { transform: [{ scale: scaleAnim }] }]}>
          <TouchableOpacity
            style={styles.centerButton}
            onPress={handlePress}
            activeOpacity={0.8}
          >
            <Text style={styles.countNumber}>{count}</Text>
            <View style={styles.countDivider} />
            <Text style={styles.countTarget}>{selectedDzikir.target}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Tap instruction */}
      <Text style={styles.tapHint}>Ketuk angka untuk menghitung</Text>

      {/* Progress dots */}
      <View style={styles.progressDots}>
        {Array.from({ length: Math.min(selectedDzikir.target, 33) }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < (count % 33 || (count > 0 && count % 33 === 0 ? 33 : 0)) && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const makeStyles = (C) => ({
  container: { flex: 1, backgroundColor: C.background },

  // Top bar
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 8,
  },
  topBarTitle: { fontSize: SIZES.title, fontWeight: '700', color: C.textPrimary, letterSpacing: -0.3 },
  topBarSub: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },
  resetBtn: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: C.primarySoft,
    justifyContent: 'center', alignItems: 'center',
  },

  // Dzikir box
  dzikirBox: { alignItems: 'center', paddingVertical: 12 },
  dzikirArabic: { fontSize: 30, color: C.textPrimary, textAlign: 'center' },
  dzikirMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  dzikirLatin: { fontSize: SIZES.small, color: C.textMuted, fontStyle: 'italic' },

  // Ring
  ringContainer: {
    alignItems: 'center', justifyContent: 'center',
    height: (RING_RADIUS + BEAD_SIZE) * 2 + 60,
    marginTop: 4,
  },
  ringGlow: {
    position: 'absolute', width: RING_RADIUS * 2 + 60, height: RING_RADIUS * 2 + 60,
    borderRadius: RING_RADIUS + 30, backgroundColor: C.accent,
  },
  ringOutline: {
    position: 'absolute',
    width: RING_RADIUS * 2 + 8, height: RING_RADIUS * 2 + 8,
    borderRadius: RING_RADIUS + 4, borderWidth: 3,
    borderColor: '#D4CBC0', borderStyle: 'dashed',
  },

  // Connector (top tassel)
  connector: { position: 'absolute', top: -8, alignItems: 'center', zIndex: 10 },
  connectorBead: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: C.accent,
    borderWidth: 2, borderColor: '#B8962E',
  },
  connectorTassel: {
    width: 3, height: 28, backgroundColor: '#B8962E', borderRadius: 1.5,
  },
  connectorTasselEnd: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent,
    borderWidth: 1.5, borderColor: '#B8962E',
  },

  // Beads
  beadsContainer: {
    position: 'absolute',
    width: (RING_RADIUS + BEAD_SIZE) * 2 + 40,
    height: (RING_RADIUS + BEAD_SIZE) * 2 + 40,
  },
  bead: {
    position: 'absolute', width: BEAD_SIZE, height: BEAD_SIZE,
    borderRadius: BEAD_SIZE / 2, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
  },
  beadCurrent: {
    borderColor: C.accent, borderWidth: 2,
  },
  beadShine: {
    position: 'absolute', top: 3, left: 4,
    width: BEAD_SIZE * 0.35, height: BEAD_SIZE * 0.25,
    borderRadius: BEAD_SIZE * 0.2,
  },

  // Center
  centerCounter: {
    position: 'absolute', alignItems: 'center', justifyContent: 'center',
  },
  centerButton: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: C.surface,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: C.accent,
  },
  countNumber: { fontSize: 42, fontWeight: '700', color: C.textPrimary, lineHeight: 46 },
  countDivider: { width: 30, height: 1.5, backgroundColor: C.border, marginVertical: 2 },
  countTarget: { fontSize: SIZES.medium, fontWeight: '600', color: C.textMuted },

  // Tap hint
  tapHint: { textAlign: 'center', fontSize: SIZES.caption, color: C.textMuted, marginTop: 4 },

  // Progress dots
  progressDots: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    paddingHorizontal: 40, marginTop: 16, gap: 4,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#DDD8D0',
  },
  dotActive: { backgroundColor: C.accent },

  // ===== Picker =====
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 16,
  },
  pickerTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary },
  pickerList: { paddingHorizontal: 20, paddingBottom: 40 },
  pickerItem: {
    backgroundColor: C.surface, borderRadius: SIZES.radius, padding: 18,
    marginBottom: 10, borderWidth: 1.5, borderColor: C.divider,
  },
  pickerItemActive: { borderColor: C.primary, backgroundColor: C.primarySoft },
  pickerArabic: { fontSize: 26, color: C.textPrimary, textAlign: 'center' },
  pickerLatin: {
    fontSize: SIZES.font, color: C.primary, fontWeight: '600',
    fontStyle: 'italic', textAlign: 'center', marginTop: 6,
  },
  pickerBottom: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10,
  },
  pickerMeaning: { fontSize: SIZES.small, color: C.textMuted, flex: 1 },
  pickerTarget: {
    backgroundColor: C.accentLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  pickerTargetText: { fontSize: SIZES.small, fontWeight: '700', color: C.accent },
  pickerCheck: { position: 'absolute', top: 14, right: 14 },
});

export default TasbihScreen;
