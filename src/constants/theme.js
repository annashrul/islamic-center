import { getColors } from '../context/ThemeStore';

export const COLORS = new Proxy({}, {
    get(_, prop) {
        return getColors()[prop];
    },
});

export const FONTS = {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extrabold: 'Inter_800ExtraBold',
};

export const SIZES = {
    xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, xxl: 32, xxxl: 40,
    caption: 11, small: 12, font: 14, medium: 16, large: 18, title: 22, header: 28, hero: 36,
    arabic: 26, arabicLarge: 32,
    radiusSm: 10, radius: 14, radiusLg: 20, radiusXl: 28, radiusFull: 999,
};

export const SHADOWS = {
    soft: { shadowColor: '#1A2B2A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
    medium: { shadowColor: '#1A2B2A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 4 },
    strong: { shadowColor: '#0C6B58', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8 },
};

export const getThemeColors = () => ({ ...getColors() });
