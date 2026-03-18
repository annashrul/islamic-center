import * as Location from 'expo-location';

const DEFAULT_LOCATION = {
  latitude: -6.2088,
  longitude: 106.8456,
  cityName: 'Jakarta',
  fullAddress: 'Jakarta, Indonesia',
  coords: '-6.2088° S, 106.8456° E',
};

let cachedLocation = null;

export const getUserLocation = async () => {
  // Return cache if fresh (less than 10 minutes old)
  if (cachedLocation && Date.now() - cachedLocation.timestamp < 600000) {
    return cachedLocation.data;
  }

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return DEFAULT_LOCATION;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;

    // Reverse geocode to get city name
    let cityName = '';
    let fullAddress = '';

    try {
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode && geocode.length > 0) {
        const place = geocode[0];
        cityName = place.city || place.subregion || place.region || '';
        const parts = [
          place.district || place.subregion || '',
          place.city || '',
          place.region || '',
          place.country || '',
        ].filter(Boolean);
        // Remove duplicates
        const unique = [...new Set(parts)];
        fullAddress = unique.join(', ');
      }
    } catch (e) {
      // Reverse geocode failed, use coordinates
      cityName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      fullAddress = cityName;
    }

    const latDir = latitude >= 0 ? 'N' : 'S';
    const lngDir = longitude >= 0 ? 'E' : 'W';

    const result = {
      latitude,
      longitude,
      cityName: cityName || 'Lokasi Saat Ini',
      fullAddress: fullAddress || `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lngDir}`,
      coords: `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lngDir}`,
    };

    // Cache it
    cachedLocation = { data: result, timestamp: Date.now() };

    return result;
  } catch (error) {
    console.error('Error getting location:', error);
    return DEFAULT_LOCATION;
  }
};

export const clearLocationCache = () => {
  cachedLocation = null;
};
