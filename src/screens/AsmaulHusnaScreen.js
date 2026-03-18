import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

const ASMAUL_HUSNA = [
  { no: 1, arabic: 'ٱلرَّحْمَـٰنُ', latin: 'Ar-Rahman', meaning: 'Yang Maha Pengasih' },
  { no: 2, arabic: 'ٱلرَّحِيمُ', latin: 'Ar-Rahim', meaning: 'Yang Maha Penyayang' },
  { no: 3, arabic: 'ٱلْمَلِكُ', latin: 'Al-Malik', meaning: 'Yang Maha Merajai' },
  { no: 4, arabic: 'ٱلْقُدُّوسُ', latin: 'Al-Quddus', meaning: 'Yang Maha Suci' },
  { no: 5, arabic: 'ٱلسَّلَامُ', latin: 'As-Salam', meaning: 'Yang Maha Memberi Kesejahteraan' },
  { no: 6, arabic: 'ٱلْمُؤْمِنُ', latin: "Al-Mu'min", meaning: 'Yang Maha Memberi Keamanan' },
  { no: 7, arabic: 'ٱلْمُهَيْمِنُ', latin: 'Al-Muhaymin', meaning: 'Yang Maha Pemelihara' },
  { no: 8, arabic: 'ٱلْعَزِيزُ', latin: "Al-'Aziz", meaning: 'Yang Maha Perkasa' },
  { no: 9, arabic: 'ٱلْجَبَّارُ', latin: 'Al-Jabbar', meaning: 'Yang Memiliki Mutlak Kegagahan' },
  { no: 10, arabic: 'ٱلْمُتَكَبِّرُ', latin: 'Al-Mutakabbir', meaning: 'Yang Maha Megah' },
  { no: 11, arabic: 'ٱلْخَالِقُ', latin: 'Al-Khaliq', meaning: 'Yang Maha Pencipta' },
  { no: 12, arabic: 'ٱلْبَارِئُ', latin: "Al-Bari'", meaning: 'Yang Maha Melepaskan' },
  { no: 13, arabic: 'ٱلْمُصَوِّرُ', latin: 'Al-Musawwir', meaning: 'Yang Maha Membentuk Rupa' },
  { no: 14, arabic: 'ٱلْغَفَّارُ', latin: 'Al-Ghaffar', meaning: 'Yang Maha Pengampun' },
  { no: 15, arabic: 'ٱلْقَهَّارُ', latin: 'Al-Qahhar', meaning: 'Yang Maha Memaksa' },
  { no: 16, arabic: 'ٱلْوَهَّابُ', latin: 'Al-Wahhab', meaning: 'Yang Maha Pemberi Karunia' },
  { no: 17, arabic: 'ٱلرَّزَّاقُ', latin: 'Ar-Razzaq', meaning: 'Yang Maha Pemberi Rezeki' },
  { no: 18, arabic: 'ٱلْفَتَّاحُ', latin: 'Al-Fattah', meaning: 'Yang Maha Pembuka' },
  { no: 19, arabic: 'ٱلْعَلِيمُ', latin: "Al-'Alim", meaning: 'Yang Maha Mengetahui' },
  { no: 20, arabic: 'ٱلْقَابِضُ', latin: 'Al-Qabid', meaning: 'Yang Maha Menyempitkan' },
  { no: 21, arabic: 'ٱلْبَاسِطُ', latin: 'Al-Basit', meaning: 'Yang Maha Melapangkan' },
  { no: 22, arabic: 'ٱلْخَافِضُ', latin: 'Al-Khafid', meaning: 'Yang Maha Merendahkan' },
  { no: 23, arabic: 'ٱلرَّافِعُ', latin: "Ar-Rafi'", meaning: 'Yang Maha Meninggikan' },
  { no: 24, arabic: 'ٱلْمُعِزُّ', latin: "Al-Mu'izz", meaning: 'Yang Maha Memuliakan' },
  { no: 25, arabic: 'ٱلْمُذِلُّ', latin: 'Al-Mudhill', meaning: 'Yang Maha Menghinakan' },
  { no: 26, arabic: 'ٱلسَّمِيعُ', latin: "As-Sami'", meaning: 'Yang Maha Mendengar' },
  { no: 27, arabic: 'ٱلْبَصِيرُ', latin: 'Al-Basir', meaning: 'Yang Maha Melihat' },
  { no: 28, arabic: 'ٱلْحَكَمُ', latin: 'Al-Hakam', meaning: 'Yang Maha Menetapkan' },
  { no: 29, arabic: 'ٱلْعَدْلُ', latin: "Al-'Adl", meaning: 'Yang Maha Adil' },
  { no: 30, arabic: 'ٱللَّطِيفُ', latin: 'Al-Latif', meaning: 'Yang Maha Lembut' },
  { no: 31, arabic: 'ٱلْخَبِيرُ', latin: 'Al-Khabir', meaning: 'Yang Maha Mengenal' },
  { no: 32, arabic: 'ٱلْحَلِيمُ', latin: 'Al-Halim', meaning: 'Yang Maha Penyantun' },
  { no: 33, arabic: 'ٱلْعَظِيمُ', latin: "Al-'Azim", meaning: 'Yang Maha Agung' },
  { no: 34, arabic: 'ٱلْغَفُورُ', latin: 'Al-Ghafur', meaning: 'Yang Maha Pengampun' },
  { no: 35, arabic: 'ٱلشَّكُورُ', latin: 'Asy-Syakur', meaning: 'Yang Maha Pembalas Budi' },
  { no: 36, arabic: 'ٱلْعَلِيُّ', latin: "Al-'Aliyy", meaning: 'Yang Maha Tinggi' },
  { no: 37, arabic: 'ٱلْكَبِيرُ', latin: 'Al-Kabir', meaning: 'Yang Maha Besar' },
  { no: 38, arabic: 'ٱلْحَفِيظُ', latin: 'Al-Hafiz', meaning: 'Yang Maha Memelihara' },
  { no: 39, arabic: 'ٱلْمُقِيتُ', latin: 'Al-Muqit', meaning: 'Yang Maha Pemberi Kecukupan' },
  { no: 40, arabic: 'ٱلْحَسِيبُ', latin: 'Al-Hasib', meaning: 'Yang Maha Membuat Perhitungan' },
  { no: 41, arabic: 'ٱلْجَلِيلُ', latin: 'Al-Jalil', meaning: 'Yang Maha Mulia' },
  { no: 42, arabic: 'ٱلْكَرِيمُ', latin: 'Al-Karim', meaning: 'Yang Maha Pemurah' },
  { no: 43, arabic: 'ٱلرَّقِيبُ', latin: 'Ar-Raqib', meaning: 'Yang Maha Mengawasi' },
  { no: 44, arabic: 'ٱلْمُجِيبُ', latin: 'Al-Mujib', meaning: 'Yang Maha Mengabulkan' },
  { no: 45, arabic: 'ٱلْوَاسِعُ', latin: "Al-Wasi'", meaning: 'Yang Maha Luas' },
  { no: 46, arabic: 'ٱلْحَكِيمُ', latin: 'Al-Hakim', meaning: 'Yang Maha Bijaksana' },
  { no: 47, arabic: 'ٱلْوَدُودُ', latin: 'Al-Wadud', meaning: 'Yang Maha Mencintai' },
  { no: 48, arabic: 'ٱلْمَجِيدُ', latin: 'Al-Majid', meaning: 'Yang Maha Mulia' },
  { no: 49, arabic: 'ٱلْبَاعِثُ', latin: "Al-Ba'ith", meaning: 'Yang Maha Membangkitkan' },
  { no: 50, arabic: 'ٱلشَّهِيدُ', latin: 'Asy-Syahid', meaning: 'Yang Maha Menyaksikan' },
  { no: 51, arabic: 'ٱلْحَقُّ', latin: 'Al-Haqq', meaning: 'Yang Maha Benar' },
  { no: 52, arabic: 'ٱلْوَكِيلُ', latin: 'Al-Wakil', meaning: 'Yang Maha Memelihara' },
  { no: 53, arabic: 'ٱلْقَوِيُّ', latin: 'Al-Qawiyy', meaning: 'Yang Maha Kuat' },
  { no: 54, arabic: 'ٱلْمَتِينُ', latin: 'Al-Matin', meaning: 'Yang Maha Kokoh' },
  { no: 55, arabic: 'ٱلْوَلِيُّ', latin: 'Al-Waliyy', meaning: 'Yang Maha Melindungi' },
  { no: 56, arabic: 'ٱلْحَمِيدُ', latin: 'Al-Hamid', meaning: 'Yang Maha Terpuji' },
  { no: 57, arabic: 'ٱلْمُحْصِىُ', latin: 'Al-Muhsi', meaning: 'Yang Maha Menghitung' },
  { no: 58, arabic: 'ٱلْمُبْدِئُ', latin: "Al-Mubdi'", meaning: 'Yang Maha Memulai' },
  { no: 59, arabic: 'ٱلْمُعِيدُ', latin: "Al-Mu'id", meaning: 'Yang Maha Mengembalikan' },
  { no: 60, arabic: 'ٱلْمُحْىِۦ', latin: 'Al-Muhyi', meaning: 'Yang Maha Menghidupkan' },
  { no: 61, arabic: 'ٱلْمُمِيتُ', latin: 'Al-Mumit', meaning: 'Yang Maha Mematikan' },
  { no: 62, arabic: 'ٱلْحَىُّ', latin: 'Al-Hayy', meaning: 'Yang Maha Hidup' },
  { no: 63, arabic: 'ٱلْقَيُّومُ', latin: 'Al-Qayyum', meaning: 'Yang Maha Mandiri' },
  { no: 64, arabic: 'ٱلْوَاجِدُ', latin: 'Al-Wajid', meaning: 'Yang Maha Penemu' },
  { no: 65, arabic: 'ٱلْمَاجِدُ', latin: 'Al-Majid', meaning: 'Yang Maha Mulia' },
  { no: 66, arabic: 'ٱلْوَاحِدُ', latin: 'Al-Wahid', meaning: 'Yang Maha Esa' },
  { no: 67, arabic: 'ٱلْأَحَدُ', latin: 'Al-Ahad', meaning: 'Yang Maha Tunggal' },
  { no: 68, arabic: 'ٱلصَّمَدُ', latin: 'As-Samad', meaning: 'Yang Maha Dibutuhkan' },
  { no: 69, arabic: 'ٱلْقَادِرُ', latin: 'Al-Qadir', meaning: 'Yang Maha Menentukan' },
  { no: 70, arabic: 'ٱلْمُقْتَدِرُ', latin: 'Al-Muqtadir', meaning: 'Yang Maha Berkuasa' },
  { no: 71, arabic: 'ٱلْمُقَدِّمُ', latin: 'Al-Muqaddim', meaning: 'Yang Maha Mendahulukan' },
  { no: 72, arabic: 'ٱلْمُؤَخِّرُ', latin: "Al-Mu'akhkhir", meaning: 'Yang Maha Mengakhirkan' },
  { no: 73, arabic: 'ٱلْأَوَّلُ', latin: 'Al-Awwal', meaning: 'Yang Maha Awal' },
  { no: 74, arabic: 'ٱلْآخِرُ', latin: 'Al-Akhir', meaning: 'Yang Maha Akhir' },
  { no: 75, arabic: 'ٱلظَّاهِرُ', latin: 'Az-Zahir', meaning: 'Yang Maha Nyata' },
  { no: 76, arabic: 'ٱلْبَاطِنُ', latin: 'Al-Batin', meaning: 'Yang Maha Tersembunyi' },
  { no: 77, arabic: 'ٱلْوَالِى', latin: 'Al-Wali', meaning: 'Yang Maha Memerintah' },
  { no: 78, arabic: 'ٱلْمُتَعَالِى', latin: "Al-Muta'ali", meaning: 'Yang Maha Tinggi' },
  { no: 79, arabic: 'ٱلْبَرُّ', latin: 'Al-Barr', meaning: 'Yang Maha Penderma' },
  { no: 80, arabic: 'ٱلتَّوَّابُ', latin: 'At-Tawwab', meaning: 'Yang Maha Penerima Taubat' },
  { no: 81, arabic: 'ٱلْمُنْتَقِمُ', latin: 'Al-Muntaqim', meaning: 'Yang Maha Pemberi Balasan' },
  { no: 82, arabic: 'ٱلْعَفُوُّ', latin: "Al-'Afuww", meaning: 'Yang Maha Pemaaf' },
  { no: 83, arabic: 'ٱلرَّءُوفُ', latin: "Ar-Ra'uf", meaning: 'Yang Maha Pengasih' },
  { no: 84, arabic: 'مَالِكُ ٱلْمُلْكِ', latin: 'Malikul Mulk', meaning: 'Yang Menguasai Kerajaan' },
  { no: 85, arabic: 'ذُو ٱلْجَلَالِ وَٱلْإِكْرَامِ', latin: 'Dzul Jalali wal Ikram', meaning: 'Yang Memiliki Kebesaran dan Kemuliaan' },
  { no: 86, arabic: 'ٱلْمُقْسِطُ', latin: 'Al-Muqsit', meaning: 'Yang Maha Pemberi Keadilan' },
  { no: 87, arabic: 'ٱلْجَامِعُ', latin: "Al-Jami'", meaning: 'Yang Maha Mengumpulkan' },
  { no: 88, arabic: 'ٱلْغَنِيُّ', latin: 'Al-Ghaniyy', meaning: 'Yang Maha Kaya' },
  { no: 89, arabic: 'ٱلْمُغْنِى', latin: 'Al-Mughni', meaning: 'Yang Maha Pemberi Kekayaan' },
  { no: 90, arabic: 'ٱلْمَانِعُ', latin: "Al-Mani'", meaning: 'Yang Maha Mencegah' },
  { no: 91, arabic: 'ٱلضَّارُّ', latin: 'Ad-Darr', meaning: 'Yang Maha Penimpa Mudarat' },
  { no: 92, arabic: 'ٱلنَّافِعُ', latin: "An-Nafi'", meaning: 'Yang Maha Pemberi Manfaat' },
  { no: 93, arabic: 'ٱلنُّورُ', latin: 'An-Nur', meaning: 'Yang Maha Bercahaya' },
  { no: 94, arabic: 'ٱلْهَادِى', latin: 'Al-Hadi', meaning: 'Yang Maha Pemberi Petunjuk' },
  { no: 95, arabic: 'ٱلْبَدِيعُ', latin: "Al-Badi'", meaning: 'Yang Maha Pencipta' },
  { no: 96, arabic: 'ٱلْبَاقِى', latin: 'Al-Baqi', meaning: 'Yang Maha Kekal' },
  { no: 97, arabic: 'ٱلْوَارِثُ', latin: 'Al-Warith', meaning: 'Yang Maha Pewaris' },
  { no: 98, arabic: 'ٱلرَّشِيدُ', latin: 'Ar-Rasyid', meaning: 'Yang Maha Pandai' },
  { no: 99, arabic: 'ٱلصَّبُورُ', latin: 'As-Sabur', meaning: 'Yang Maha Sabar' },
];

const AsmaulHusnaScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ASMAUL_HUSNA.filter(
    (item) =>
      item.latin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.no.toString().includes(searchQuery)
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.numberBadge}>
        <Text style={styles.numberText}>{item.no}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.arabicText}>{item.arabic}</Text>
        <Text style={styles.latinText}>{item.latin}</Text>
        <Text style={styles.meaningText}>{item.meaning}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Asmaul Husna</Text>
        <Text style={styles.headerSubtitle}>99 Nama Allah Yang Indah</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama Allah..."
          placeholderTextColor={COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.no.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 55, paddingBottom: 25, paddingHorizontal: 20,
    borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
  },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: SIZES.font, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    marginHorizontal: 16, marginTop: -14, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: SIZES.font, color: COLORS.darkGray },
  listContainer: { padding: 12, paddingBottom: 30 },
  row: { justifyContent: 'space-between' },
  card: {
    backgroundColor: COLORS.white, borderRadius: 14, padding: 14,
    marginBottom: 10, width: '48%', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  numberBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  numberText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  cardContent: { alignItems: 'center' },
  arabicText: { fontSize: 22, color: COLORS.darkGray, marginBottom: 6 },
  latinText: { fontSize: SIZES.small, color: COLORS.primary, fontWeight: '600' },
  meaningText: { fontSize: 11, color: COLORS.gray, textAlign: 'center', marginTop: 4 },
});

export default AsmaulHusnaScreen;
