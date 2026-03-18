import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const GOLD_PRICE_PER_GRAM = 1_300_000;
const NISAB_GOLD_GRAM = 85;
const NISAB = NISAB_GOLD_GRAM * GOLD_PRICE_PER_GRAM;
const ZAKAT_RATE = 0.025;

const ZakatScreen = () => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const [activeTab, setActiveTab] = useState('mal');

    const [savings, setSavings] = useState('');
    const [gold, setGold] = useState('');
    const [silver, setSilver] = useState('');
    const [investment, setInvestment] = useState('');
    const [debt, setDebt] = useState('');
    const [malResult, setMalResult] = useState(null);

    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [otherIncome, setOtherIncome] = useState('');
    const [monthlyExpense, setMonthlyExpense] = useState('');
    const [incomeResult, setIncomeResult] = useState(null);

    const formatRupiah = (num) => {
        return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseNumber = (str) => {
        const cleaned = str.replace(/[^0-9]/g, '');
        return parseInt(cleaned) || 0;
    };

    const calculateZakatMal = () => {
        const totalAssets = parseNumber(savings) + parseNumber(gold) + parseNumber(silver) + parseNumber(investment);
        const totalDebt = parseNumber(debt);
        const netAssets = totalAssets - totalDebt;
        const meetsNisab = netAssets >= NISAB;
        const zakatAmount = meetsNisab ? netAssets * ZAKAT_RATE : 0;
        setMalResult({ totalAssets, totalDebt, netAssets, meetsNisab, zakatAmount });
    };

    const calculateZakatIncome = () => {
        const yearlyIncome = (parseNumber(monthlyIncome) + parseNumber(otherIncome)) * 12;
        const yearlyExpense = parseNumber(monthlyExpense) * 12;
        const netIncome = yearlyIncome - yearlyExpense;
        const meetsNisab = netIncome >= NISAB;
        const zakatAmount = meetsNisab ? netIncome * ZAKAT_RATE : 0;
        const monthlyZakat = zakatAmount / 12;
        setIncomeResult({ yearlyIncome, yearlyExpense, netIncome, meetsNisab, zakatAmount, monthlyZakat });
    };

    const renderMal = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                    Nisab zakat mal = 85 gram emas = {formatRupiah(NISAB)} (estimasi). Kadar zakat = 2,5%
                </Text>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.formLabel}>Tabungan & Uang Tunai</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={savings} onChangeText={setSavings} placeholderTextColor={COLORS.textMuted} />
                </View>

                <Text style={styles.formLabel}>Nilai Emas & Perhiasan</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={gold} onChangeText={setGold} placeholderTextColor={COLORS.textMuted} />
                </View>

                <Text style={styles.formLabel}>Nilai Perak</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={silver} onChangeText={setSilver} placeholderTextColor={COLORS.textMuted} />
                </View>

                <Text style={styles.formLabel}>Investasi (Saham, Deposito, dll)</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={investment} onChangeText={setInvestment} placeholderTextColor={COLORS.textMuted} />
                </View>

                <Text style={styles.formLabel}>Hutang / Cicilan</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={debt} onChangeText={setDebt} placeholderTextColor={COLORS.textMuted} />
                </View>
            </View>

            <TouchableOpacity style={styles.calculateBtn} onPress={calculateZakatMal}>
                <Ionicons name="calculator" size={20} color={COLORS.white} />
                <Text style={styles.calculateBtnText}>Hitung Zakat</Text>
            </TouchableOpacity>

            {malResult && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Hasil Perhitungan</Text>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Total Aset</Text><Text style={styles.resultValue}>{formatRupiah(malResult.totalAssets)}</Text></View>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Total Hutang</Text><Text style={[styles.resultValue, { color: '#E53935' }]}>- {formatRupiah(malResult.totalDebt)}</Text></View>
                    <View style={styles.divider} />
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Aset Bersih</Text><Text style={styles.resultValue}>{formatRupiah(malResult.netAssets)}</Text></View>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Nisab</Text><Text style={[styles.resultValue, { color: malResult.meetsNisab ? COLORS.primary : '#E53935' }]}>{malResult.meetsNisab ? 'Tercapai' : 'Belum Tercapai'}</Text></View>
                    <View style={styles.divider} />
                    <View style={styles.resultRow}><Text style={styles.resultLabelBig}>Zakat yang Harus Dibayar</Text><Text style={styles.resultValueBig}>{formatRupiah(malResult.zakatAmount)}</Text></View>
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    const renderIncome = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>
                    Zakat penghasilan dihitung dari pendapatan bersih tahunan. Nisab = 85 gram emas/tahun.
                </Text>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.formLabel}>Gaji Bulanan</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={monthlyIncome} onChangeText={setMonthlyIncome} placeholderTextColor={COLORS.textMuted} />
                </View>

                <Text style={styles.formLabel}>Pendapatan Lain (per bulan)</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={otherIncome} onChangeText={setOtherIncome} placeholderTextColor={COLORS.textMuted} />
                </View>

                <Text style={styles.formLabel}>Pengeluaran Pokok (per bulan)</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputPrefix}>Rp</Text>
                    <TextInput style={styles.input} keyboardType="numeric" placeholder="0" value={monthlyExpense} onChangeText={setMonthlyExpense} placeholderTextColor={COLORS.textMuted} />
                </View>
            </View>

            <TouchableOpacity style={styles.calculateBtn} onPress={calculateZakatIncome}>
                <Ionicons name="calculator" size={20} color={COLORS.white} />
                <Text style={styles.calculateBtnText}>Hitung Zakat</Text>
            </TouchableOpacity>

            {incomeResult && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Hasil Perhitungan</Text>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Pendapatan/Tahun</Text><Text style={styles.resultValue}>{formatRupiah(incomeResult.yearlyIncome)}</Text></View>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Pengeluaran/Tahun</Text><Text style={[styles.resultValue, { color: '#E53935' }]}>- {formatRupiah(incomeResult.yearlyExpense)}</Text></View>
                    <View style={styles.divider} />
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Pendapatan Bersih</Text><Text style={styles.resultValue}>{formatRupiah(incomeResult.netIncome)}</Text></View>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Nisab</Text><Text style={[styles.resultValue, { color: incomeResult.meetsNisab ? COLORS.primary : '#E53935' }]}>{incomeResult.meetsNisab ? 'Tercapai' : 'Belum Tercapai'}</Text></View>
                    <View style={styles.divider} />
                    <View style={styles.resultRow}><Text style={styles.resultLabelBig}>Zakat/Tahun</Text><Text style={styles.resultValueBig}>{formatRupiah(incomeResult.zakatAmount)}</Text></View>
                    <View style={styles.resultRow}><Text style={styles.resultLabel}>Zakat/Bulan</Text><Text style={[styles.resultValue, { color: COLORS.primary }]}>{formatRupiah(Math.round(incomeResult.monthlyZakat))}</Text></View>
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t.zakat_title}</Text>
                <Text style={styles.headerSubtitle}>{t.zakat_sub}</Text>
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity style={[styles.tab, activeTab === 'mal' && styles.activeTab]} onPress={() => setActiveTab('mal')}>
                    <Text style={[styles.tabText, activeTab === 'mal' && styles.activeTabText]}>Zakat Mal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, activeTab === 'income' && styles.activeTab]} onPress={() => setActiveTab('income')}>
                    <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>Zakat Penghasilan</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'mal' ? renderMal() : renderIncome()}
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 25, paddingHorizontal: 20,
        borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
    },
    headerTitle: { fontSize: SIZES.xxl, fontWeight: '700', color: C.white },
    headerSubtitle: { fontSize: SIZES.font, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
    tabContainer: {
        flexDirection: 'row', marginHorizontal: 16, marginTop: 16, backgroundColor: C.surface,
        borderRadius: 12, padding: 4,
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    activeTab: { backgroundColor: C.primary },
    tabText: { fontSize: SIZES.font, color: C.textMuted, fontWeight: '600' },
    activeTabText: { color: C.white },
    infoCard: {
        flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.primarySoft,
        marginHorizontal: 16, marginTop: 16, padding: 14, borderRadius: 12,
    },
    infoText: { flex: 1, fontSize: SIZES.small, color: C.textPrimary, marginLeft: 10, lineHeight: 18 },
    formSection: { paddingHorizontal: 16, marginTop: 16 },
    formLabel: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary, marginBottom: 8, marginTop: 12 },
    inputContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        borderRadius: 12, borderWidth: 1, borderColor: C.divider, paddingHorizontal: 14,
    },
    inputPrefix: { fontSize: SIZES.font, color: C.textMuted, fontWeight: '600', marginRight: 8 },
    input: { flex: 1, fontSize: SIZES.medium, color: C.textPrimary, paddingVertical: 12 },
    calculateBtn: {
        flexDirection: 'row', backgroundColor: C.primary, marginHorizontal: 16, marginTop: 24,
        paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
        shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    calculateBtnText: { color: C.white, fontSize: SIZES.medium, fontWeight: '700', marginLeft: 8 },
    resultCard: {
        backgroundColor: C.surface, marginHorizontal: 16, marginTop: 20, padding: 20, borderRadius: 16,
        borderWidth: 1, borderColor: C.divider,
    },
    resultTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary, marginBottom: 16 },
    resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    resultLabel: { fontSize: SIZES.font, color: C.textMuted },
    resultValue: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    resultLabelBig: { fontSize: SIZES.medium, fontWeight: '700', color: C.textPrimary },
    resultValueBig: { fontSize: SIZES.large, fontWeight: '700', color: C.primary },
    divider: { height: 1, backgroundColor: C.divider, marginVertical: 10 },
});

export default ZakatScreen;
