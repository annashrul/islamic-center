// Global mutable theme store
// This is updated by SettingsContext and read by constants/theme.js
// So screens that import COLORS from theme.js get dynamic values

const store = {
    colors: {
        primary: '#0C6B58', primaryDark: '#084D3F', primaryLight: '#0E8A6F', primarySoft: '#E6F5F0',
        accent: '#C9A84C', accentLight: '#F5ECD7',
        background: '#FAF7F2', surface: '#FFFFFF', surfaceAlt: '#F2EFE9',
        textPrimary: '#1A2B2A', textSecondary: '#5C6B6A', textMuted: '#9CA8A7', textOnPrimary: '#FFFFFF',
        white: '#FFFFFF', black: '#1A1A1A', border: '#E8E4DD', divider: '#F0EDE7',
        overlay: 'rgba(12,107,88,0.08)', success: '#2ECC71', warning: '#F39C12', error: '#E74C3C',
        gray: '#5C6B6A', darkGray: '#1A2B2A', lightGray: '#E8E4DD',
        secondary: '#C9A84C', cardBg: '#FFFFFF', arabicBg: '#FDF8ED',
        statusBar: 'light-content',
    },
};

export const getColors = () => store.colors;

export const setColors = (newColors) => {
    Object.assign(store.colors, newColors);
};

export default store;
