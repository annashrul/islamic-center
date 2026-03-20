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
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const DZIKIR_PAGI = [
    { id: '1', arabic: '\u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0645\u0650\u0646\u064E \u0627\u0644\u0634\u0651\u064E\u064A\u0652\u0637\u064E\u0627\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062C\u0650\u064A\u0645\u0650. \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0647\u064F\u0648\u064E \u0627\u0644\u0652\u062D\u064E\u064A\u0651\u064F \u0627\u0644\u0652\u0642\u064E\u064A\u0651\u064F\u0648\u0645\u064F', title: 'Ayat Kursi', latin: "A'udzubillahi minasy-syaithonir rojiim. Allaahu laa ilaaha illaa huwal hayyul qoyyuum...", meaning: 'Dibaca 1x di pagi hari. Barangsiapa membacanya di pagi hari, ia dijaga dari gangguan jin hingga sore.', count: '1x' },
    { id: '2', arabic: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650. \u0642\u064F\u0644\u0652 \u0647\u064F\u0648\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0623\u064E\u062D\u064E\u062F\u064C. \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0627\u0644\u0635\u0651\u064E\u0645\u064E\u062F\u064F. \u0644\u064E\u0645\u0652 \u064A\u064E\u0644\u0650\u062F\u0652 \u0648\u064E\u0644\u064E\u0645\u0652 \u064A\u064F\u0648\u0644\u064E\u062F\u0652. \u0648\u064E\u0644\u064E\u0645\u0652 \u064A\u064E\u0643\u064F\u0646 \u0644\u0651\u064E\u0647\u064F \u0643\u064F\u0641\u064F\u0648\u064B\u0627 \u0623\u064E\u062D\u064E\u062F\u064C', title: 'Surat Al-Ikhlas', latin: 'Bismillahirrahmanirrahim. Qul huwallahu ahad. Allahush-shamad. Lam yalid wa lam yuulad. Wa lam yakun lahu kufuwan ahad.', meaning: 'Dibaca 3x di pagi hari.', count: '3x' },
    { id: '3', arabic: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650. \u0642\u064F\u0644\u0652 \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0631\u064E\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064E\u0644\u064E\u0642\u0650. \u0645\u0650\u0646 \u0634\u064E\u0631\u0651\u0650 \u0645\u064E\u0627 \u062E\u064E\u0644\u064E\u0642\u064E. \u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0651\u0650 \u063A\u064E\u0627\u0633\u0650\u0642\u064D \u0625\u0650\u0630\u064E\u0627 \u0648\u064E\u0642\u064E\u0628\u064E. \u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0651\u0650 \u0627\u0644\u0646\u0651\u064E\u0641\u0651\u064E\u0627\u062B\u064E\u0627\u062A\u0650 \u0641\u0650\u064A \u0627\u0644\u0652\u0639\u064F\u0642\u064E\u062F\u0650. \u0648\u064E\u0645\u0650\u0646 \u0634\u064E\u0631\u0651\u0650 \u062D\u064E\u0627\u0633\u0650\u062F\u064D \u0625\u0650\u0630\u064E\u0627 \u062D\u064E\u0633\u064E\u062F\u064E', title: 'Surat Al-Falaq', latin: "Bismillahirrahmanirrahim. Qul a'uudzu birabbil falaq. Min syarri maa khalaq...", meaning: 'Dibaca 3x di pagi hari.', count: '3x' },
    { id: '4', arabic: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0652\u0645\u064E\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062D\u0650\u064A\u0645\u0650. \u0642\u064F\u0644\u0652 \u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0631\u064E\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064E\u0627\u0633\u0650. \u0645\u064E\u0644\u0650\u0643\u0650 \u0627\u0644\u0646\u0651\u064E\u0627\u0633\u0650. \u0625\u0650\u0644\u064E\u0670\u0647\u0650 \u0627\u0644\u0646\u0651\u064E\u0627\u0633\u0650. \u0645\u0650\u0646 \u0634\u064E\u0631\u0651\u0650 \u0627\u0644\u0652\u0648\u064E\u0633\u0652\u0648\u064E\u0627\u0633\u0650 \u0627\u0644\u0652\u062E\u064E\u0646\u0651\u064E\u0627\u0633\u0650', title: 'Surat An-Nas', latin: "Bismillahirrahmanirrahim. Qul a'uudzu birabbin-naas. Malikin-naas. Ilaahin-naas. Min syarril waswaasil khannaas...", meaning: 'Dibaca 3x di pagi hari.', count: '3x' },
    { id: '5', arabic: '\u0623\u064E\u0635\u0652\u0628\u064E\u062D\u0652\u0646\u064E\u0627 \u0648\u064E\u0623\u064E\u0635\u0652\u0628\u064E\u062D\u064E \u0627\u0644\u0652\u0645\u064F\u0644\u0652\u0643\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650 \u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0648\u064E\u062D\u0652\u062F\u064E\u0647\u064F \u0644\u064E\u0627 \u0634\u064E\u0631\u0650\u064A\u0643\u064E \u0644\u064E\u0647\u064F', title: 'Dzikir Pagi', latin: "Ashbahnaa wa ashbahal mulku lillah walhamdu lillah laa ilaaha illallahu wahdahu laa syariika lah...", meaning: 'Kami telah memasuki waktu pagi dan kerajaan hanya milik Allah. Segala puji bagi Allah.', count: '1x' },
    { id: '6', arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0628\u0650\u0643\u064E \u0623\u064E\u0635\u0652\u0628\u064E\u062D\u0652\u0646\u064E\u0627 \u0648\u064E\u0628\u0650\u0643\u064E \u0623\u064E\u0645\u0652\u0633\u064E\u064A\u0652\u0646\u064E\u0627 \u0648\u064E\u0628\u0650\u0643\u064E \u0646\u064E\u062D\u0652\u064A\u064E\u0627 \u0648\u064E\u0628\u0650\u0643\u064E \u0646\u064E\u0645\u064F\u0648\u062A\u064F \u0648\u064E\u0625\u0650\u0644\u064E\u064A\u0652\u0643\u064E \u0627\u0644\u0646\u0651\u064F\u0634\u064F\u0648\u0631\u064F', title: 'Doa Pagi', latin: 'Allahumma bika ashbahnaa wa bika amsainaa wa bika nahyaa wa bika namuutu wa ilaikan-nusyuur.', meaning: 'Ya Allah, dengan rahmat-Mu kami memasuki waktu pagi dan sore, hidup dan mati, dan kepada-Mu kebangkitan.', count: '1x' },
    { id: '7', arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0623\u064E\u0646\u0652\u062A\u064E \u0631\u064E\u0628\u0651\u0650\u064A \u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0623\u064E\u0646\u0652\u062A\u064E \u062E\u064E\u0644\u064E\u0642\u0652\u062A\u064E\u0646\u0650\u064A \u0648\u064E\u0623\u064E\u0646\u064E\u0627 \u0639\u064E\u0628\u0652\u062F\u064F\u0643\u064E \u0648\u064E\u0623\u064E\u0646\u064E\u0627 \u0639\u064E\u0644\u064E\u0649\u0670 \u0639\u064E\u0647\u0652\u062F\u0650\u0643\u064E \u0648\u064E\u0648\u064E\u0639\u0652\u062F\u0650\u0643\u064E \u0645\u064E\u0627 \u0627\u0633\u0652\u062A\u064E\u0637\u064E\u0639\u0652\u062A\u064F', title: 'Sayyidul Istighfar', latin: "Allahumma anta rabbii laa ilaaha illaa anta khalaqtanii wa ana 'abduka wa ana 'alaa 'ahdika wa wa'dika mastatha'tu...", meaning: 'Penghulu istighfar. Siapa yang membacanya di pagi hari dengan yakin lalu meninggal sebelum sore, maka ia termasuk ahli surga.', count: '1x' },
    { id: '8', arabic: '\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0628\u0650\u062D\u064E\u0645\u0652\u062F\u0650\u0647\u0650', title: 'Tasbih Pagi', latin: 'Subhanallahi wa bihamdihi.', meaning: 'Maha Suci Allah dan segala puji bagi-Nya. Siapa yang mengucapkannya 100x di pagi hari, dosa-dosanya dihapus walau sebanyak buih di lautan.', count: '100x' },
    { id: '9', arabic: '\u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0648\u064E\u062D\u0652\u062F\u064E\u0647\u064F \u0644\u064E\u0627 \u0634\u064E\u0631\u0650\u064A\u0643\u064E \u0644\u064E\u0647\u064F \u0644\u064E\u0647\u064F \u0627\u0644\u0652\u0645\u064F\u0644\u0652\u0643\u064F \u0648\u064E\u0644\u064E\u0647\u064F \u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0648\u064E\u0647\u064F\u0648\u064E \u0639\u064E\u0644\u064E\u0649\u0670 \u0643\u064F\u0644\u0651\u0650 \u0634\u064E\u064A\u0652\u0621\u064D \u0642\u064E\u062F\u0650\u064A\u0631\u064C', title: 'Tahlil', latin: 'Laa ilaaha illallahu wahdahu laa syariika lahu lahul mulku wa lahul hamdu wa huwa alaa kulli syai-in qadiir.', meaning: 'Siapa yang membacanya 10x, pahalanya seperti memerdekakan 4 budak dari keturunan Ismail.', count: '10x' },
    { id: '10', arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0625\u0650\u0646\u0651\u0650\u064A \u0623\u064E\u0633\u0652\u0623\u064E\u0644\u064F\u0643\u064E \u0627\u0644\u0652\u0639\u064E\u0627\u0641\u0650\u064A\u064E\u0629\u064E \u0641\u0650\u064A \u0627\u0644\u062F\u0651\u064F\u0646\u0652\u064A\u064E\u0627 \u0648\u064E\u0627\u0644\u0652\u0622\u062E\u0650\u0631\u064E\u0629\u0650', title: "Doa Memohon 'Afiyah", latin: "Allahumma innii as'alukal 'aafiyah fid-dunyaa wal-aakhirah.", meaning: 'Ya Allah, aku memohon keselamatan di dunia dan akhirat.', count: '1x' },
];

const DZIKIR_PETANG = [
    { id: '1p', arabic: '\u0623\u064E\u0639\u064F\u0648\u0630\u064F \u0628\u0650\u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0645\u0650\u0646\u064E \u0627\u0644\u0634\u0651\u064E\u064A\u0652\u0637\u064E\u0627\u0646\u0650 \u0627\u0644\u0631\u0651\u064E\u062C\u0650\u064A\u0645\u0650. \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0647\u064F\u0648\u064E \u0627\u0644\u0652\u062D\u064E\u064A\u0651\u064F \u0627\u0644\u0652\u0642\u064E\u064A\u0651\u064F\u0648\u0645\u064F', title: 'Ayat Kursi', latin: "A'udzubillahi minasy-syaithonir rojiim. Allaahu laa ilaaha illaa huwal hayyul qoyyuum...", meaning: 'Dibaca 1x di petang hari.', count: '1x' },
    { id: '2p', arabic: '\u0623\u064E\u0645\u0652\u0633\u064E\u064A\u0652\u0646\u064E\u0627 \u0648\u064E\u0623\u064E\u0645\u0652\u0633\u064E\u0649 \u0627\u0644\u0652\u0645\u064F\u0644\u0652\u0643\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0627\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u0651\u064E\u0647\u0650 \u0644\u064E\u0627 \u0625\u0650\u0644\u064E\u0670\u0647\u064E \u0625\u0650\u0644\u0651\u064E\u0627 \u0627\u0644\u0644\u0651\u064E\u0647\u064F \u0648\u064E\u062D\u0652\u062F\u064E\u0647\u064F \u0644\u064E\u0627 \u0634\u064E\u0631\u0650\u064A\u0643\u064E \u0644\u064E\u0647\u064F', title: 'Dzikir Petang', latin: 'Amsainaa wa amsal mulku lillah walhamdu lillah laa ilaaha illallahu wahdahu laa syariika lah...', meaning: 'Kami memasuki waktu petang dan kerajaan milik Allah.', count: '1x' },
    { id: '3p', arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0628\u0650\u0643\u064E \u0623\u064E\u0645\u0652\u0633\u064E\u064A\u0652\u0646\u064E\u0627 \u0648\u064E\u0628\u0650\u0643\u064E \u0623\u064E\u0635\u0652\u0628\u064E\u062D\u0652\u0646\u064E\u0627 \u0648\u064E\u0628\u0650\u0643\u064E \u0646\u064E\u062D\u0652\u064A\u064E\u0627 \u0648\u064E\u0628\u0650\u0643\u064E \u0646\u064E\u0645\u064F\u0648\u062A\u064F \u0648\u064E\u0625\u0650\u0644\u064E\u064A\u0652\u0643\u064E \u0627\u0644\u0652\u0645\u064E\u0635\u0650\u064A\u0631\u064F', title: 'Doa Petang', latin: 'Allahumma bika amsainaa wa bika ashbahnaa wa bika nahyaa wa bika namuutu wa ilaikal mashiir.', meaning: 'Ya Allah, dengan rahmat-Mu kami memasuki waktu petang dan pagi, hidup dan mati, dan kepada-Mu tempat kembali.', count: '1x' },
    { id: '4p', arabic: '\u0627\u0644\u0644\u0651\u064E\u0647\u064F\u0645\u0651\u064E \u0639\u064E\u0627\u0644\u0650\u0645\u064E \u0627\u0644\u0652\u063A\u064E\u064A\u0652\u0628\u0650 \u0648\u064E\u0627\u0644\u0634\u0651\u064E\u0647\u064E\u0627\u062F\u064E\u0629\u0650 \u0641\u064E\u0627\u0637\u0650\u0631\u064E \u0627\u0644\u0633\u0651\u064E\u0645\u064E\u0627\u0648\u064E\u0627\u062A\u0650 \u0648\u064E\u0627\u0644\u0652\u0623\u064E\u0631\u0652\u0636\u0650 \u0631\u064E\u0628\u0651\u064E \u0643\u064F\u0644\u0651\u0650 \u0634\u064E\u064A\u0652\u0621\u064D \u0648\u064E\u0645\u064E\u0644\u0650\u064A\u0643\u064E\u0647\u064F', title: 'Doa Perlindungan', latin: "Allahumma 'aalimal ghaibi wasy-syahadah faathiras-samaawaati wal-ardh...", meaning: 'Ya Allah, Yang Maha Mengetahui yang gaib dan nyata, Pencipta langit dan bumi.', count: '1x' },
    { id: '5p', arabic: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0627\u0644\u0651\u064E\u0630\u0650\u064A \u0644\u064E\u0627 \u064A\u064E\u0636\u064F\u0631\u0651\u064F \u0645\u064E\u0639\u064E \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064E\u064A\u0652\u0621\u064C \u0641\u0650\u064A \u0627\u0644\u0652\u0623\u064E\u0631\u0652\u0636\u0650 \u0648\u064E\u0644\u064E\u0627 \u0641\u0650\u064A \u0627\u0644\u0633\u0651\u064E\u0645\u064E\u0627\u0621\u0650 \u0648\u064E\u0647\u064F\u0648\u064E \u0627\u0644\u0633\u0651\u064E\u0645\u0650\u064A\u0639\u064F \u0627\u0644\u0652\u0639\u064E\u0644\u0650\u064A\u0645\u064F', title: 'Bismillah Perlindungan', latin: 'Bismillahilladzi laa yadhurru ma\'asmihi syai-un fil-ardhi wa laa fis-samaa-i wahuwas-samii\'ul \'aliim.', meaning: 'Dengan nama Allah yang tidak membahayakan apa pun di bumi dan langit. Dibaca 3x.', count: '3x' },
    { id: '6p', arabic: '\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0627\u0644\u0644\u0651\u064E\u0647\u0650 \u0648\u064E\u0628\u0650\u062D\u064E\u0645\u0652\u062F\u0650\u0647\u0650', title: 'Tasbih Petang', latin: 'Subhanallahi wa bihamdihi.', meaning: 'Maha Suci Allah dan puji bagi-Nya. Dibaca 100x.', count: '100x' },
];

const DhikrScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [activeTab, setActiveTab] = useState('pagi');
    const [expandedId, setExpandedId] = useState(null);

    const data = activeTab === 'pagi' ? DZIKIR_PAGI : DZIKIR_PETANG;

    const renderItem = ({ item }) => {
        const isExpanded = expandedId === item.id;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.7}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={styles.countBadge}>
                            <Text style={styles.countText}>{item.count}</Text>
                        </View>
                        <Text style={styles.cardTitle}>{item.title}</Text>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.textMuted} />
                </View>

                <View style={styles.arabicPreview}>
                    <Text style={[styles.arabicText, !isExpanded && { numberOfLines: 2 }]} numberOfLines={isExpanded ? undefined : 2}>
                        {item.arabic}
                    </Text>
                </View>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.latinText}>{item.latin}</Text>
                        <View style={styles.meaningBox}>
                            <Ionicons name="information-circle" size={16} color={COLORS.primary} />
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
                <Text style={styles.headerTitle}>{t.dzikir_title}</Text>
                <Text style={styles.headerSubtitle}>{t.dzikir_sub}</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pagi' && styles.activeTab]}
                    onPress={() => { setActiveTab('pagi'); setExpandedId(null); }}
                >
                    <Ionicons name="sunny" size={16} color={activeTab === 'pagi' ? COLORS.white : COLORS.textMuted} />
                    <Text style={[styles.tabText, activeTab === 'pagi' && styles.activeTabText]}>{t.dzikir_morning}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'petang' && styles.activeTab]}
                    onPress={() => { setActiveTab('petang'); setExpandedId(null); }}
                >
                    <Ionicons name="moon" size={16} color={activeTab === 'petang' ? COLORS.white : COLORS.textMuted} />
                    <Text style={[styles.tabText, activeTab === 'petang' && styles.activeTabText]}>{t.dzikir_evening}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
            />
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
    tabContainer: {
        flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: C.surface,
        borderRadius: 12, padding: 4, marginBottom: 8,
    },
    tab: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: C.primary },
    tabText: { fontSize: SIZES.font, color: C.textMuted, fontWeight: '600', marginLeft: 6 },
    activeTabText: { color: C.white },
    listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
    card: {
        backgroundColor: C.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden',
        borderWidth: 1, borderColor: C.divider,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, paddingBottom: 8 },
    cardHeaderLeft: { flexDirection: 'row', alignItems: 'center' },
    countBadge: { backgroundColor: C.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
    countText: { color: C.white, fontSize: 11, fontWeight: '700' },
    cardTitle: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    arabicPreview: { paddingHorizontal: 14, paddingBottom: 12 },
    arabicText: { fontSize: 20, color: C.textPrimary, textAlign: 'right', lineHeight: 38 },
    expandedContent: { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 0.5, borderTopColor: C.divider, paddingTop: 12 },
    latinText: { fontSize: SIZES.font, color: C.primary, fontStyle: 'italic', lineHeight: 22, marginBottom: 10 },
    meaningBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.primarySoft, padding: 12, borderRadius: 10 },
    meaningText: { flex: 1, fontSize: SIZES.small, color: C.textPrimary, marginLeft: 8, lineHeight: 18 },
});

export default DhikrScreen;
