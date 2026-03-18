import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { NavigationContainer, getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { useSettings } from '../context/SettingsContext';

import HomeScreen from '../screens/HomeScreen';
import QuranScreen from '../screens/QuranScreen';
import SurahDetailScreen from '../screens/SurahDetailScreen';
import PrayerTimesScreen from '../screens/PrayerTimesScreen';
import QiblaScreen from '../screens/QiblaScreen';
import DuaScreen from '../screens/DuaScreen';
import MoreScreen from '../screens/MoreScreen';
import TasbihScreen from '../screens/TasbihScreen';
import AsmaulHusnaScreen from '../screens/AsmaulHusnaScreen';
import ProphetStoriesScreen from '../screens/ProphetStoriesScreen';
import ZakatScreen from '../screens/ZakatScreen';
import HadithScreen from '../screens/HadithScreen';
import DhikrScreen from '../screens/DhikrScreen';
import JuzDetailScreen from '../screens/JuzDetailScreen';
import JuzSurahListScreen from '../screens/JuzSurahListScreen';
import ProphetDetailScreen from '../screens/ProphetDetailScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import AboutScreen from '../screens/AboutScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const DETAIL_SCREENS = ['SurahDetail', 'JuzDetail', 'JuzSurahList', 'Home_SurahDetail'];

const defaultTabStyle = (C) => ({
    backgroundColor: C.surface || '#FFFFFF',
    borderTopWidth: 0,
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
    shadowColor: '#1A2B2A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 10,
});

const shouldHideTabBar = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route);
    return DETAIL_SCREENS.includes(routeName);
};

const QuranStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="QuranList" component={QuranScreen} />
        <Stack.Screen name="SurahDetail" component={SurahDetailScreen} />
        <Stack.Screen name="JuzSurahList" component={JuzSurahListScreen} />
        <Stack.Screen name="JuzDetail" component={JuzDetailScreen} />
    </Stack.Navigator>
);

const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="Home_SurahDetail" component={SurahDetailScreen} />
        <Stack.Screen name="Home_PrayerTimes" component={PrayerTimesScreen} />
        <Stack.Screen name="Home_Qibla" component={QiblaScreen} />
        <Stack.Screen name="Home_Tasbih" component={TasbihScreen} />
        <Stack.Screen name="Home_AsmaulHusna" component={AsmaulHusnaScreen} />
        <Stack.Screen name="Home_Doa" component={DuaScreen} />
    </Stack.Navigator>
);

const MoreStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MoreMain" component={MoreScreen} />
        <Stack.Screen name="Tasbih" component={TasbihScreen} />
        <Stack.Screen name="AsmaulHusna" component={AsmaulHusnaScreen} />
        <Stack.Screen name="KisahNabi" component={ProphetStoriesScreen} />
        <Stack.Screen name="ProphetDetail" component={ProphetDetailScreen} />
        <Stack.Screen name="Zakat" component={ZakatScreen} />
        <Stack.Screen name="Hadits" component={HadithScreen} />
        <Stack.Screen name="Dzikir" component={DhikrScreen} />
        <Stack.Screen name="Qibla" component={QiblaScreen} />
        <Stack.Screen name="PrayerTimes" component={PrayerTimesScreen} />
        <Stack.Screen name="Doa" component={DuaScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
);

const QiblaFloatingButton = ({ onPress }) => {
    const { colors: C } = useSettings();
    return (
        <TouchableOpacity style={{ top: -22, justifyContent: 'center', alignItems: 'center' }} onPress={onPress} activeOpacity={0.85}>
            <View style={{
                width: 56, height: 56, borderRadius: 28, backgroundColor: C.primary,
                justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: C.surface,
            }}>
                <Ionicons name="compass" size={26} color={C.white} />
            </View>
        </TouchableOpacity>
    );
};

const AppNavigator = () => {
    const { colors: COLORS, t, themeId, langId } = useSettings();
    return (
        <NavigationContainer key={`${themeId}-${langId}`}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    headerShown: false,
                    tabBarIcon: ({ focused, color }) => {
                        let iconName;
                        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Quran') iconName = focused ? 'book' : 'book-outline';
                        else if (route.name === 'Qibla') iconName = 'compass';
                        else if (route.name === 'Doa') iconName = focused ? 'heart' : 'heart-outline';
                        else if (route.name === 'More') iconName = focused ? 'grid' : 'grid-outline';

                        if (route.name === 'Qibla') return null;

                        return (
                            <View style={{ alignItems: 'center', paddingTop: 2 }}>
                                <Ionicons name={iconName} size={22} color={color} />
                                {focused && (
                                    <View style={{
                                        width: 4, height: 4, borderRadius: 2,
                                        backgroundColor: COLORS.primary, marginTop: 4,
                                    }} />
                                )}
                            </View>
                        );
                    },
                    tabBarActiveTintColor: COLORS.primary,
                    tabBarInactiveTintColor: COLORS.textMuted || '#9CA8A7',
                    tabBarLabelStyle: {
                        fontSize: 10,
                        fontWeight: '600',
                        marginTop: -2,
                    },
                })}
            >
                <Tab.Screen name="Home" component={HomeStack} options={({ route }) => ({
                    tabBarLabel: t.tab_home,
                    tabBarStyle: shouldHideTabBar(route) ? { display: 'none' } : defaultTabStyle(COLORS),
                })} />
                <Tab.Screen name="Quran" component={QuranStack} options={({ route }) => ({
                    tabBarLabel: t.tab_quran,
                    tabBarStyle: shouldHideTabBar(route) ? { display: 'none' } : defaultTabStyle(COLORS),
                })} />
                <Tab.Screen
                    name="Qibla"
                    component={QiblaScreen}
                    options={{
                        tabBarLabel: () => null,
                        tabBarButton: (props) => (
                            <QiblaFloatingButton onPress={props.onPress} />
                        ),
                    }}
                />
                <Tab.Screen name="Doa" component={DuaScreen} options={{ tabBarLabel: t.tab_doa, tabBarStyle: defaultTabStyle(COLORS) }} />
                <Tab.Screen name="More" component={MoreStack} options={{ tabBarLabel: t.tab_more, tabBarStyle: defaultTabStyle(COLORS) }} />
            </Tab.Navigator>
        </NavigationContainer>
    );
};


export default AppNavigator;
