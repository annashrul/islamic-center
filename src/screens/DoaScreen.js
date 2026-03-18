import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const DOA_LIST = [
  {
    id: '1',
    title: 'Doa Sebelum Tidur',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    latin: "Bismikallaahumma amuutu wa ahyaa",
    meaning: 'Dengan menyebut nama-Mu ya Allah, aku mati dan aku hidup.',
    category: 'Harian',
  },
  {
    id: '2',
    title: 'Doa Bangun Tidur',
    arabic: 'اَلْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: "Alhamdu lillahil-ladzi ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur",
    meaning: 'Segala puji bagi Allah yang telah menghidupkan kami sesudah mematikan kami dan kepada-Nya kami dikembalikan.',
    category: 'Harian',
  },
  {
    id: '3',
    title: 'Doa Masuk Masjid',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: "Allaahummaf-tah lii abwaaba rahmatik",
    meaning: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
    category: 'Ibadah',
  },
  {
    id: '4',
    title: 'Doa Keluar Masjid',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    latin: "Allaahumma innii as-aluka min fadllik",
    meaning: 'Ya Allah, sesungguhnya aku memohon kepada-Mu dari karunia-Mu.',
    category: 'Ibadah',
  },
  {
    id: '5',
    title: 'Doa Sebelum Makan',
    arabic: 'بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ',
    latin: "Bismillaahi wa 'alaa barakatillaah",
    meaning: 'Dengan menyebut nama Allah dan dengan berkah Allah.',
    category: 'Harian',
  },
  {
    id: '6',
    title: 'Doa Sesudah Makan',
    arabic: 'اَلْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ',
    latin: "Alhamdu lillaahil-ladzi ath'amanaa wa saqaanaa wa ja'alanaa minal-muslimiin",
    meaning: 'Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami sebagai orang-orang Islam.',
    category: 'Harian',
  },
  {
    id: '7',
    title: 'Doa Masuk Rumah',
    arabic: 'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    latin: "Bismillaahi walajnaa wa bismillaahi kharajnaa wa 'alallahi rabbinaa tawakkalnaa",
    meaning: 'Dengan menyebut nama Allah kami masuk, dengan menyebut nama Allah kami keluar, dan kepada Allah Tuhan kami, kami bertawakal.',
    category: 'Harian',
  },
  {
    id: '8',
    title: 'Doa Keluar Rumah',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    latin: "Bismillaahi tawakkaltu 'alallaahi laa hawla wa laa quwwata illaa billaah",
    meaning: 'Dengan menyebut nama Allah aku bertawakkal kepada Allah, tidak ada daya dan kekuatan kecuali dengan pertolongan Allah.',
    category: 'Harian',
  },
  {
    id: '9',
    title: 'Doa Masuk Kamar Mandi',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
    latin: "Allaahumma innii a'uudzu bika minal-khubutsi wal-khabaa-its",
    meaning: 'Ya Allah, aku berlindung kepada-Mu dari setan laki-laki dan setan perempuan.',
    category: 'Harian',
  },
  {
    id: '10',
    title: 'Doa Sebelum Wudhu',
    arabic: 'بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ',
    latin: "Bismillaahir-rahmaanir-rahiim",
    meaning: 'Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang.',
    category: 'Ibadah',
  },
  {
    id: '11',
    title: 'Doa Sesudah Wudhu',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    latin: "Asyhadu an laa ilaaha illallaahu wahdahu laa syariika lah, wa asyhadu anna Muhammadan 'abduhu wa rasuuluh",
    meaning: 'Aku bersaksi bahwa tidak ada Tuhan selain Allah Yang Maha Esa, tidak ada sekutu bagi-Nya. Dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya.',
    category: 'Ibadah',
  },
  {
    id: '12',
    title: 'Doa Naik Kendaraan',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
    latin: "Subhaanal-ladzi sakhkhara lanaa haadza wa maa kunnaa lahuu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun",
    meaning: 'Maha Suci Tuhan yang telah menundukkan semua ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kami akan kembali kepada Tuhan kami.',
    category: 'Perjalanan',
  },
];

const CATEGORIES = ['Semua', 'Harian', 'Ibadah', 'Perjalanan'];

const DoaScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [expandedId, setExpandedId] = useState(null);

  const filteredDoa = selectedCategory === 'Semua'
    ? DOA_LIST
    : DOA_LIST.filter((d) => d.category === selectedCategory);

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
            <View>
              <Text style={styles.doaTitle}>{item.title}</Text>
              <Text style={styles.doaCategory}>{item.category}</Text>
            </View>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray}
          />
        </View>

        {isExpanded && (
          <View style={styles.doaContent}>
            <View style={styles.arabicContainer}>
              <Text style={styles.arabicText}>{item.arabic}</Text>
            </View>
            <Text style={styles.latinText}>{item.latin}</Text>
            <View style={styles.meaningContainer}>
              <Text style={styles.meaningLabel}>Artinya:</Text>
              <Text style={styles.meaningText}>{item.meaning}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doa Harian</Text>
        <Text style={styles.headerSubtitle}>Kumpulan doa sehari-hari</Text>
      </View>

      <View style={styles.categoryContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredDoa}
        keyExtractor={(item) => item.id}
        renderItem={renderDoaItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
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
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  doaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  doaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  doaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doaNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doaNumber: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.primary,
  },
  doaTitle: {
    fontSize: SIZES.font,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  doaCategory: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 2,
  },
  doaContent: {
    paddingHorizontal: 14,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.lightGray,
  },
  arabicContainer: {
    backgroundColor: COLORS.arabicBg,
    padding: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  arabicText: {
    fontSize: SIZES.arabic,
    color: COLORS.darkGray,
    textAlign: 'right',
    lineHeight: 50,
  },
  latinText: {
    fontSize: SIZES.font,
    color: COLORS.primaryLight,
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 20,
  },
  meaningContainer: {
    marginTop: 10,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
  },
  meaningLabel: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  meaningText: {
    fontSize: SIZES.font,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
});

export default DoaScreen;
