import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { SIZES } from '../constants/theme';

const THEMES = [
    { id: 'light', icon: 'sunny-outline', preview: { bg: '#FAF7F2', primary: '#0C6B58', card: '#FFFFFF', text: '#1A2B2A' } },
    { id: 'dark', icon: 'moon-outline', preview: { bg: '#121820', primary: '#4ECDC4', card: '#1C2530', text: '#E8ECF0' } },
    { id: 'oled', icon: 'contrast-outline', preview: { bg: '#000000', primary: '#4ECDC4', card: '#0A0A0A', text: '#FFFFFF' } },
    { id: 'nature', icon: 'leaf-outline', preview: { bg: '#F0F5EE', primary: '#2D7D46', card: '#FFFFFF', text: '#1A3A2A' } },
    { id: 'ocean', icon: 'water-outline', preview: { bg: '#F0F4F8', primary: '#1565C0', card: '#FFFFFF', text: '#1A2A3A' } },
];

const LANGS = [
    { id: 'id', flag: '🇮🇩' },
    { id: 'en', flag: '🇺🇸' },
    { id: 'ar', flag: '🇸🇦' },
];

const FONT_OPTS = [
    { id: 'small', size: 13 },
    { id: 'medium', size: 15 },
    { id: 'large', size: 18 },
    { id: 'xlarge', size: 21 },
];

const ThemeSettingsScreen = ({ navigation }) => {
    const { colors, t, themeId, setThemeId, langId, setLangId, fontSizeId, setFontSizeId } = useSettings();

    const Radio = ({ selected }) => (
        <View style={[s.radio, selected && { borderColor: colors.primary }]}>
            {selected && <View style={[s.radioDot, { backgroundColor: colors.primary }]} />}
        </View>
    );

    return (
        <ScrollView style={[s.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle={colors.statusBar} />
            <View style={[s.header, { backgroundColor: colors.primary }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={22} color={colors.textOnPrimary} />
                </TouchableOpacity>
                <Text style={[s.headerTitle, { color: colors.textOnPrimary }]}>{t.theme_title}</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ===== THEME ===== */}
            <View style={s.section}>
                <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{t.select_theme}</Text>
                {THEMES.map(theme => {
                    const isSelected = themeId === theme.id;
                    const name = t[`theme_${theme.id}`] || theme.id;
                    return (
                        <TouchableOpacity
                            key={theme.id}
                            style={[s.themeCard, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.divider }]}
                            onPress={() => setThemeId(theme.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[s.themePreview, { backgroundColor: theme.preview.bg }]}>
                                <View style={[s.pvHeader, { backgroundColor: theme.preview.primary }]} />
                                <View style={[s.pvCard, { backgroundColor: theme.preview.card }]}>
                                    <View style={[s.pvLine, { backgroundColor: theme.preview.text, width: '60%' }]} />
                                    <View style={[s.pvLine, { backgroundColor: theme.preview.text, width: '40%', opacity: 0.3 }]} />
                                </View>
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name={theme.icon} size={16} color={isSelected ? colors.primary : colors.textMuted} />
                                    <Text style={[s.themeName, { color: isSelected ? colors.primary : colors.textPrimary }]}> {name}</Text>
                                </View>
                            </View>
                            {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ===== LANGUAGE ===== */}
            <View style={s.section}>
                <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{t.select_lang}</Text>
                <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                    {LANGS.map((lang, idx) => {
                        const isSelected = langId === lang.id;
                        const name = t[`lang_${lang.id}`] || lang.id;
                        return (
                            <TouchableOpacity
                                key={lang.id}
                                style={[s.langRow, idx < LANGS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
                                onPress={() => setLangId(lang.id)}
                            >
                                <Text style={s.langFlag}>{lang.flag}</Text>
                                <Text style={[s.langName, { color: colors.textPrimary }]}>{name}</Text>
                                <Radio selected={isSelected} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* ===== FONT SIZE ===== */}
            <View style={s.section}>
                <Text style={[s.sectionLabel, { color: colors.textMuted }]}>{t.quran_font_size}</Text>
                <View style={[s.card, { backgroundColor: colors.surface, borderColor: colors.divider }]}>
                    {FONT_OPTS.map((font, idx) => {
                        const isSelected = fontSizeId === font.id;
                        const name = t[`font_${font.id}`] || font.id;
                        return (
                            <TouchableOpacity
                                key={font.id}
                                style={[s.fontRow, idx < FONT_OPTS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.divider }]}
                                onPress={() => setFontSizeId(font.id)}
                            >
                                <View>
                                    <Text style={[s.fontLabel, { color: colors.textPrimary }]}>{name}</Text>
                                    <Text style={{ fontSize: font.size, color: colors.textSecondary, marginTop: 4 }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ</Text>
                                </View>
                                <Radio selected={isSelected} />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const s = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 50, paddingBottom: 14, paddingHorizontal: 16,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: SIZES.large, fontWeight: '700' },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionLabel: { fontSize: SIZES.caption, fontWeight: '700', letterSpacing: 0.8, marginBottom: 10 },

    themeCard: {
        flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 12,
        marginBottom: 10, borderWidth: 1.5,
    },
    themePreview: { width: 64, height: 44, borderRadius: 8, overflow: 'hidden', marginRight: 14 },
    pvHeader: { height: 14 },
    pvCard: { marginHorizontal: 4, marginTop: 3, padding: 4, borderRadius: 3 },
    pvLine: { height: 3, borderRadius: 1.5, marginBottom: 2 },
    themeName: { fontSize: SIZES.font, fontWeight: '600' },

    card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
    langRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
    langFlag: { fontSize: 22, marginRight: 12 },
    langName: { flex: 1, fontSize: SIZES.font, fontWeight: '600' },

    fontRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
    fontLabel: { fontSize: SIZES.font, fontWeight: '600' },

    radio: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CCC',
        justifyContent: 'center', alignItems: 'center',
    },
    radioDot: { width: 12, height: 12, borderRadius: 6 },
});

export default ThemeSettingsScreen;
