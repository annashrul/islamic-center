import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';
import { SURAH_LIST, JUZ_LIST } from '../data/quranData';
import SurahCard from '../components/SurahCard';

const QuranScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('surah');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAH_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.number.toString().includes(searchQuery)
  );

  const renderSurahItem = ({ item }) => (
    <SurahCard
      surah={item}
      onPress={() => navigation.navigate('SurahDetail', { surah: item })}
    />
  );

  const renderJuzItem = ({ item }) => (
    <TouchableOpacity style={styles.juzItem}>
      <View style={styles.juzNumber}>
        <Text style={styles.juzNumberText}>{item.number}</Text>
      </View>
      <Text style={styles.juzName}>{item.name}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Al-Quran</Text>
        <Text style={styles.headerSubtitle}>Baca & Pelajari Al-Quran</Text>

        <View style={styles.lastReadBanner}>
          <View style={styles.lastReadLeft}>
            <Ionicons name="book-outline" size={20} color={COLORS.white} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.lastReadLabel}>Terakhir Dibaca</Text>
              <Text style={styles.lastReadSurah}>Al-Fatihah - Ayat 1</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>Lanjut</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari surah..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.gray} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'surah' && styles.activeTab]}
          onPress={() => setActiveTab('surah')}
        >
          <Text style={[styles.tabText, activeTab === 'surah' && styles.activeTabText]}>
            Surah
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'juz' && styles.activeTab]}
          onPress={() => setActiveTab('juz')}
        >
          <Text style={[styles.tabText, activeTab === 'juz' && styles.activeTabText]}>
            Juz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookmark' && styles.activeTab]}
          onPress={() => setActiveTab('bookmark')}
        >
          <Text style={[styles.tabText, activeTab === 'bookmark' && styles.activeTabText]}>
            Bookmark
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'surah' && (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderSurahItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'juz' && (
        <FlatList
          data={JUZ_LIST}
          keyExtractor={(item) => item.number.toString()}
          renderItem={renderJuzItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {activeTab === 'bookmark' && (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={60} color={COLORS.lightGray} />
          <Text style={styles.emptyText}>Belum ada bookmark</Text>
          <Text style={styles.emptySubtext}>
            Tandai ayat favorit Anda untuk akses cepat
          </Text>
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
    paddingBottom: 20,
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
  lastReadBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  lastReadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReadLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  lastReadSurah: {
    fontSize: SIZES.font,
    color: COLORS.white,
    fontWeight: '600',
  },
  continueBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  continueBtnText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: SIZES.font,
    color: COLORS.darkGray,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.font,
    color: COLORS.gray,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.white,
  },
  listContainer: {
    paddingBottom: 20,
  },
  juzItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lightGray,
  },
  juzNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  juzNumberText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '700',
  },
  juzName: {
    flex: 1,
    fontSize: SIZES.medium,
    color: COLORS.darkGray,
    fontWeight: '500',
    marginLeft: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: SIZES.large,
    color: COLORS.gray,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: SIZES.font,
    color: COLORS.lightGray,
    marginTop: 8,
  },
});

export default QuranScreen;
