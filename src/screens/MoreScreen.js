import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES, SHADOWS } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

const MoreScreen = ({ navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);

    const MENU_ITEMS = [
        {
            section: t.section_islamic,
            items: [
                { icon: 'book-outline', color: COLORS.primary, title: t.menu_quran, subtitle: '', screen: 'Quran' },
                { icon: 'time-outline', color: '#E6960A', title: t.menu_prayer, subtitle: '', screen: 'PrayerTimes' },
                { icon: 'compass-outline', color: '#3B82F6', title: t.menu_qibla, subtitle: '', screen: 'Qibla' },
                { icon: 'heart-outline', color: '#E91E63', title: t.menu_doa, subtitle: '', screen: 'Doa' },
                { icon: 'radio-button-on-outline', color: '#7E57C2', title: t.menu_tasbih, subtitle: '', screen: 'Tasbih' },
                { icon: 'sunny-outline', color: '#F59E0B', title: t.menu_dzikir, subtitle: '', screen: 'Dzikir' },
            ],
        },
        {
            section: t.section_learning,
            items: [
                { icon: 'star-outline', color: '#EC4899', title: t.menu_asmaul, subtitle: '', screen: 'AsmaulHusna' },
                { icon: 'people-outline', color: '#06B6D4', title: t.menu_kisah, subtitle: '', screen: 'KisahNabi' },
                { icon: 'document-text-outline', color: '#6366F1', title: t.menu_hadits, subtitle: '', screen: 'Hadits' },
                { icon: 'calculator-outline', color: '#8B5CF6', title: t.menu_zakat, subtitle: '', screen: 'Zakat' },
                { icon: 'calendar-outline', color: '#10B981', title: t.menu_hijri_calendar, subtitle: '', screen: 'HijriCalendar' },
            ],
        },
        {
            section: t.section_settings,
            items: [
                { icon: 'notifications-outline', color: COLORS.textMuted, title: t.menu_notif, subtitle: '', screen: 'NotificationSettings' },
                { icon: 'color-palette-outline', color: COLORS.textMuted, title: t.menu_theme, subtitle: '', screen: 'ThemeSettings' },
                { icon: 'information-circle-outline', color: COLORS.textMuted, title: t.menu_about, subtitle: '', screen: 'About' },
            ],
        },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={28} color={COLORS.white} />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{t.more_greeting}</Text>
                        <Text style={styles.profileSubtitle}>{t.more_subtitle}</Text>
                    </View>
                </View>
            </View>

            {MENU_ITEMS.map((section) => (
                <View key={section.section} style={styles.section}>
                    <Text style={styles.sectionTitle}>{section.section}</Text>
                    <View style={styles.sectionCard}>
                        {section.items.map((item, index) => (
                            <TouchableOpacity
                                key={item.title}
                                style={[styles.menuItem, index < section.items.length - 1 && styles.menuItemBorder]}
                                activeOpacity={0.6}
                                onPress={() => item.screen && navigation.navigate(item.screen)}
                            >
                                <View style={[styles.menuIcon, { backgroundColor: `${item.color}12` }]}>
                                    <Ionicons name={item.icon} size={20} color={item.color} />
                                </View>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            ))}

            <View style={styles.footer}>
                <Text style={styles.footerText}>{t.more_subtitle} v1.0</Text>
            </View>
            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        backgroundColor: C.primary, paddingTop: 30, paddingBottom: 24, paddingHorizontal: 20,
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    avatar: {
        width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center', alignItems: 'center',
    },
    profileInfo: { marginLeft: 14 },
    profileName: { fontSize: SIZES.large, fontWeight: '700', color: C.white },
    profileSubtitle: { fontSize: SIZES.small, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
    section: { marginTop: 24, paddingHorizontal: 20 },
    sectionTitle: {
        fontSize: SIZES.caption, fontWeight: '700', color: C.textMuted, marginBottom: 8,
        textTransform: 'uppercase', letterSpacing: 0.8,
    },
    sectionCard: { backgroundColor: C.surface, borderRadius: SIZES.radius, ...SHADOWS.soft },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, paddingVertical: 16 },
    menuItemBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
    menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuTitle: { flex: 1, fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    footer: { alignItems: 'center', marginTop: 32 },
    footerText: { fontSize: SIZES.caption, color: C.textMuted },
});

export default MoreScreen;
