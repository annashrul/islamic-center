import { useSettings } from './SettingsContext';

// Simple hook to get colors, t (translations), fontSize from settings
// Usage: const { C, t, fontSize } = useTheme();
export const useTheme = () => {
    const settings = useSettings();
    return {
        C: settings.colors,
        t: settings.t,
        fontSize: settings.fontSize,
        isRTL: settings.isRTL,
        isDark: settings.isDark,
    };
};
