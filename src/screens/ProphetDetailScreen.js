import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { getArabicName } from './ProphetStoriesScreen';
import { useSettings } from '../context/SettingsContext';

const ProphetDetailScreen = ({ route, navigation }) => {
    const { colors: COLORS, t } = useSettings();
    const styles = makeStyles(COLORS);
    const { nabi } = route.params;
    const arabic = getArabicName(nabi.name);

    const paragraphs = nabi.description
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.nav}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.navTitle} numberOfLines={1}>{nabi.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.banner}>
                    <View style={styles.bannerDecor}>
                        {[...Array(5)].map((_, i) => <View key={i} style={[styles.decorDot, { opacity: 0.1 + i * 0.05 }]} />)}
                    </View>
                    {arabic ? <Text style={styles.bannerArabic}>{arabic}</Text> : null}
                    <Text style={styles.bannerName}>{nabi.name}</Text>

                    <View style={styles.bannerChips}>
                        {nabi.birthYear ? (
                            <View style={styles.chip}>
                                <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.6)" />
                                <Text style={styles.chipText}>{nabi.birthYear} SM</Text>
                            </View>
                        ) : null}
                        {nabi.age ? (
                            <View style={styles.chip}>
                                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.6)" />
                                <Text style={styles.chipText}>{nabi.age} tahun</Text>
                            </View>
                        ) : null}
                        {nabi.location ? (
                            <View style={styles.chip}>
                                <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.6)" />
                                <Text style={styles.chipText}>{nabi.location}</Text>
                            </View>
                        ) : null}
                    </View>
                </View>

                <View style={styles.storyContainer}>
                    <Text style={styles.storyTitle}>{t.full_story}</Text>
                    {paragraphs.map((para, idx) => {
                        const isHeading = para.length < 80 && !para.endsWith('.') && !para.endsWith(',');
                        return isHeading ? (
                            <Text key={idx} style={styles.storyHeading}>{para}</Text>
                        ) : (
                            <Text key={idx} style={styles.storyParagraph}>{para}</Text>
                        );
                    })}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    nav: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    navTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white, flex: 1, textAlign: 'center' },
    banner: {
        backgroundColor: C.primary, paddingVertical: 28, paddingHorizontal: 24, alignItems: 'center',
        borderBottomLeftRadius: SIZES.radiusXl, borderBottomRightRadius: SIZES.radiusXl,
    },
    bannerDecor: { flexDirection: 'row', marginBottom: 12 },
    decorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.white, marginHorizontal: 4 },
    bannerArabic: { fontSize: 44, color: C.accent, marginBottom: 6 },
    bannerName: { fontSize: SIZES.title, fontWeight: '700', color: C.white },
    bannerChips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 14, gap: 8 },
    chip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    },
    chipText: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
    storyContainer: { padding: 20 },
    storyTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary, marginBottom: 16 },
    storyHeading: {
        fontSize: SIZES.medium, fontWeight: '700', color: C.primary,
        marginTop: 20, marginBottom: 8,
    },
    storyParagraph: {
        fontSize: SIZES.font, color: C.textSecondary, lineHeight: 24,
        marginBottom: 12, textAlign: 'justify',
    },
});

export default ProphetDetailScreen;
