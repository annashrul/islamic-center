import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

import HomeScreen from '../screens/HomeScreen';
import QuranScreen from '../screens/QuranScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import QiblaScreen from '../screens/QiblaScreen';
import DoaScreen from '../screens/DoaScreen';
import MoreScreen from '../screens/MoreScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const QuranStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="QuranList" component={QuranScreen} />
    <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Quran') iconName = focused ? 'book' : 'book-outline';
            else if (route.name === 'PrayerTimes') iconName = focused ? 'time' : 'time-outline';
            else if (route.name === 'Qibla') iconName = focused ? 'compass' : 'compass-outline';
            else if (route.name === 'Doa') iconName = focused ? 'heart' : 'heart-outline';
            else if (route.name === 'More') iconName = focused ? 'grid' : 'grid-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 0.5,
            borderTopColor: COLORS.lightGray,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 10,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: 'Beranda' }} />
        <Tab.Screen name="Quran" component={QuranStack} options={{ tabBarLabel: 'Al-Quran' }} />
        <Tab.Screen name="PrayerTimes" component={PrayerTimesScreen} options={{ tabBarLabel: 'Sholat' }} />
        <Tab.Screen name="Doa" component={DoaScreen} options={{ tabBarLabel: 'Doa' }} />
        <Tab.Screen name="More" component={MoreScreen} options={{ tabBarLabel: 'Lainnya' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
