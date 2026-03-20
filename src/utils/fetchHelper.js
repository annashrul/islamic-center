import { Platform } from 'react-native';

const CORS_PROXY = 'https://corsproxy.io/?';

// Wrapper fetch that adds CORS proxy on web platform
export const webFetch = (url, options) => {
    if (Platform.OS === 'web') {
        return fetch(`${CORS_PROXY}${encodeURIComponent(url)}`, options);
    }
    return fetch(url, options);
};
