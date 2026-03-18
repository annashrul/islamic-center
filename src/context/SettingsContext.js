import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setColors as setGlobalColors } from './ThemeStore';
import idLang from '../i18n/id';
import enLang from '../i18n/en';
import arLang from '../i18n/ar';

const SETTINGS_KEY = '@islamic_center_settings';

const LANGUAGES = { id: idLang, en: enLang, ar: arLang };

// Theme palettes
const THEME_COLORS = {
    light: {
        primary: '#0C6B58', primaryDark: '#084D3F', primaryLight: '#0E8A6F', primarySoft: '#E6F5F0',
        accent: '#C9A84C', accentLight: '#F5ECD7',
        background: '#FAF7F2', surface: '#FFFFFF', surfaceAlt: '#F2EFE9',
        textPrimary: '#1A2B2A', textSecondary: '#5C6B6A', textMuted: '#9CA8A7', textOnPrimary: '#FFFFFF',
        white: '#FFFFFF', black: '#1A1A1A', border: '#E8E4DD', divider: '#F0EDE7',
        arabicBg: '#FDF8ED', statusBar: 'light-content',
    },
    dark: {
        primary: '#4ECDC4', primaryDark: '#3BA99F', primaryLight: '#6FE0D8', primarySoft: '#1A3A38',
        accent: '#D4AF37', accentLight: '#3A3525',
        background: '#121820', surface: '#1C2530', surfaceAlt: '#243040',
        textPrimary: '#E8ECF0', textSecondary: '#A0AAB4', textMuted: '#6B7580', textOnPrimary: '#121820',
        white: '#FFFFFF', black: '#000000', border: '#2A3545', divider: '#222E3C',
        arabicBg: '#1E2A36', statusBar: 'light-content',
    },
    oled: {
        primary: '#4ECDC4', primaryDark: '#3BA99F', primaryLight: '#6FE0D8', primarySoft: '#0D1F1D',
        accent: '#D4AF37', accentLight: '#1A1708',
        background: '#000000', surface: '#0A0A0A', surfaceAlt: '#141414',
        textPrimary: '#FFFFFF', textSecondary: '#AAAAAA', textMuted: '#666666', textOnPrimary: '#000000',
        white: '#FFFFFF', black: '#000000', border: '#1A1A1A', divider: '#111111',
        arabicBg: '#0A0F0A', statusBar: 'light-content',
    },
    nature: {
        primary: '#2D7D46', primaryDark: '#1B5C30', primaryLight: '#3FA05A', primarySoft: '#E8F5EC',
        accent: '#A0853C', accentLight: '#F5F0E0',
        background: '#F0F5EE', surface: '#FFFFFF', surfaceAlt: '#E8EFE6',
        textPrimary: '#1A3A2A', textSecondary: '#4A6A5A', textMuted: '#8AA09A', textOnPrimary: '#FFFFFF',
        white: '#FFFFFF', black: '#1A1A1A', border: '#D4E4D8', divider: '#E4EEE6',
        arabicBg: '#F5FAF0', statusBar: 'light-content',
    },
    ocean: {
        primary: '#1565C0', primaryDark: '#0D47A1', primaryLight: '#42A5F5', primarySoft: '#E3F2FD',
        accent: '#FF8F00', accentLight: '#FFF3E0',
        background: '#F0F4F8', surface: '#FFFFFF', surfaceAlt: '#E8EEF4',
        textPrimary: '#1A2A3A', textSecondary: '#5A6A7A', textMuted: '#9AAABA', textOnPrimary: '#FFFFFF',
        white: '#FFFFFF', black: '#1A1A1A', border: '#D4DCE8', divider: '#E4ECF2',
        arabicBg: '#F0F5FB', statusBar: 'light-content',
    },
};

const FONT_SIZES = {
    small: { arabic: 24, arabicLarge: 28 },
    medium: { arabic: 28, arabicLarge: 32 },
    large: { arabic: 34, arabicLarge: 38 },
    xlarge: { arabic: 40, arabicLarge: 44 },
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [themeId, setThemeId] = useState('light');
    const [langId, setLangId] = useState('id');
    const [fontSizeId, setFontSizeId] = useState('medium');
    const [loaded, setLoaded] = useState(false);

    // Load settings on mount
    useEffect(() => {
        (async () => {
            try {
                const json = await AsyncStorage.getItem(SETTINGS_KEY);
                if (json) {
                    const saved = JSON.parse(json);
                    if (saved.themeId) setThemeId(saved.themeId);
                    if (saved.langId) setLangId(saved.langId);
                    if (saved.fontSizeId) setFontSizeId(saved.fontSizeId);
                }
            } catch (e) {}
            setLoaded(true);
        })();
    }, []);

    // Save whenever settings change
    useEffect(() => {
        if (!loaded) return;
        AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ themeId, langId, fontSizeId })).catch(() => {});
    }, [themeId, langId, fontSizeId, loaded]);

    const colors = THEME_COLORS[themeId] || THEME_COLORS.light;
    // Add legacy aliases
    const theme = {
        ...colors,
        gray: colors.textSecondary,
        darkGray: colors.textPrimary,
        lightGray: colors.border,
        secondary: colors.accent,
        cardBg: colors.surface,
    };

    // Sync to global store so constants/theme.js COLORS proxy gets updated
    useEffect(() => {
        setGlobalColors(theme);
    }, [themeId]);

    const t = LANGUAGES[langId] || LANGUAGES.id;
    const fontSize = FONT_SIZES[fontSizeId] || FONT_SIZES.medium;
    const isRTL = langId === 'ar';

    return (
        <SettingsContext.Provider value={{
            themeId, setThemeId,
            langId, setLangId,
            fontSizeId, setFontSizeId,
            colors: theme,
            t,
            fontSize,
            isRTL,
            isDark: themeId === 'dark' || themeId === 'oled',
            loaded,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
