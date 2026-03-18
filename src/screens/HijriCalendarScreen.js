import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity, StatusBar, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SIZES } from '../constants/theme';
import { fetchHijriCalendar } from '../services/apiService';
import { useSettings } from '../context/SettingsContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HijriCalendarScreen = ({ navigation }) => {
    const { colors: C, t } = useSettings();
    const s = makeStyles(C);

    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => { loadCalendar(); }, [year, month]);

    const loadCalendar = async () => {
        setLoading(true);
        try {
            const data = await fetchHijriCalendar(year, month);
            setDays(data);
        } catch (e) {
            console.error('Calendar load error:', e);
            setDays([]);
        }
        setLoading(false);
        // Auto-select today
        const today = new Date();
        if (year === today.getFullYear() && month === today.getMonth() + 1) {
            setSelectedDay(today.getDate());
        } else {
            setSelectedDay(null);
        }
    };

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(year - 1); }
        else setMonth(month - 1);
    };

    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(year + 1); }
        else setMonth(month + 1);
    };

    const goToday = () => {
        const today = new Date();
        setYear(today.getFullYear());
        setMonth(today.getMonth() + 1);
    };

    // Build calendar grid
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const grid = [];
    for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(d);

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
    };

    const getHijriForDay = (day) => days.find((d) => d.gregorian.day === day);
    const selected = selectedDay ? getHijriForDay(selectedDay) : null;

    // Get hijri month info from first day of current month
    const firstHijri = days.length > 0 ? days[0].hijri : null;
    const lastHijri = days.length > 0 ? days[days.length - 1].hijri : null;

    return (
        <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
            <StatusBar barStyle="light-content" />
            <View style={s.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.navBtn}>
                    <Ionicons name="arrow-back" size={22} color={C.white} />
                </TouchableOpacity>
                <Text style={s.headerTitle}>{t.hijri_calendar || 'Kalender Hijriyah'}</Text>
                <TouchableOpacity onPress={goToday} style={s.navBtn}>
                    <Ionicons name="today-outline" size={22} color={C.white} />
                </TouchableOpacity>
            </View>

            {/* Month Navigator */}
            <View style={s.monthNav}>
                <TouchableOpacity onPress={prevMonth} style={s.monthBtn}>
                    <Ionicons name="chevron-back" size={20} color={C.primary} />
                </TouchableOpacity>
                <View style={s.monthCenter}>
                    <Text style={s.monthGregorian}>{MONTHS[month]} {year}</Text>
                    {firstHijri && lastHijri && (
                        <Text style={s.monthHijri}>
                            {firstHijri.monthEn} {firstHijri.year}
                            {lastHijri.monthEn !== firstHijri.monthEn ? ` - ${lastHijri.monthEn} ${lastHijri.year}` : ''}
                        </Text>
                    )}
                </View>
                <TouchableOpacity onPress={nextMonth} style={s.monthBtn}>
                    <Ionicons name="chevron-forward" size={20} color={C.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={s.loadingBox}>
                    <ActivityIndicator size="large" color={C.primary} />
                </View>
            ) : (
                <>
                    {/* Weekday headers */}
                    <View style={s.weekRow}>
                        {WEEKDAYS.map((w) => (
                            <View key={w} style={s.weekCell}>
                                <Text style={[s.weekText, w === 'Fri' && { color: C.primary, fontWeight: '700' }]}>{w}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Calendar grid */}
                    <View style={s.calGrid}>
                        {grid.map((day, idx) => {
                            if (day === null) return <View key={`e${idx}`} style={s.dayCell} />;
                            const hijri = getHijriForDay(day);
                            const today = isToday(day);
                            const isSelected = selectedDay === day;
                            const hasHoliday = hijri?.hijri.holidays?.length > 0;
                            const isFriday = new Date(year, month - 1, day).getDay() === 5;

                            return (
                                <TouchableOpacity
                                    key={day}
                                    style={[s.dayCell, today && s.dayCellToday, isSelected && s.dayCellSelected]}
                                    onPress={() => setSelectedDay(day)}
                                    activeOpacity={0.6}
                                >
                                    <Text style={[s.dayGreg, today && s.dayGregToday, isSelected && s.dayGregSelected, isFriday && { color: C.primary }]}>
                                        {day}
                                    </Text>
                                    <Text style={[s.dayHijri, today && s.dayHijriToday, isSelected && s.dayHijriSelected]}>
                                        {hijri?.hijri.day || ''}
                                    </Text>
                                    {hasHoliday && <View style={s.holidayDot} />}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Selected day info */}
                    {selected && (
                        <View style={s.infoCard}>
                            <View style={s.infoRow}>
                                <View style={s.infoDateBox}>
                                    <Text style={s.infoDateBig}>{selected.gregorian.day}</Text>
                                    <Text style={s.infoDateSub}>{MONTHS[selected.gregorian.month]} {selected.gregorian.year}</Text>
                                </View>
                                <View style={s.infoDivider} />
                                <View style={s.infoHijriBox}>
                                    <Text style={s.infoHijriDay}>{selected.hijri.day}</Text>
                                    <Text style={s.infoHijriMonth}>{selected.hijri.monthEn}</Text>
                                    <Text style={s.infoHijriYear}>{selected.hijri.year} H</Text>
                                </View>
                            </View>
                            <Text style={s.infoWeekday}>{selected.gregorian.weekday}</Text>
                            {selected.hijri.holidays.length > 0 && (
                                <View style={s.holidayBanner}>
                                    <Ionicons name="star" size={14} color={C.accent} />
                                    <Text style={s.holidayText}>{selected.hijri.holidays.join(', ')}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Agenda - Islamic Events this month */}
                    {(() => {
                        const events = days.filter(d => d.hijri && d.hijri.holidays && d.hijri.holidays.length > 0);
                        if (events.length === 0) return (
                            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                                <Text style={{ fontSize: 12, color: C.textMuted, textAlign: 'center' }}>
                                    {days.length > 0 ? (t.no_events || 'Tidak ada hari besar Islam bulan ini') : (t.failed_load || 'Gagal memuat data')}
                                </Text>
                            </View>
                        );
                        return (
                            <View style={s.agendaSection}>
                                <Text style={s.agendaTitle}>{t.agenda || 'Agenda'}</Text>
                                {events.map((ev, idx) => {
                                    const isPast = new Date(year, month - 1, ev.gregorian.day) < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            style={[s.agendaCard, isPast && s.agendaCardPast]}
                                            onPress={() => setSelectedDay(ev.gregorian.day)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[s.agendaDateBox, isPast && s.agendaDateBoxPast]}>
                                                <Text style={[s.agendaDateDay, isPast && { color: C.textMuted }]}>{ev.gregorian.day}</Text>
                                                <Text style={[s.agendaDateMonth, isPast && { color: C.textMuted }]}>{MONTHS[ev.gregorian.month]}</Text>
                                            </View>
                                            <View style={s.agendaInfo}>
                                                <Text style={[s.agendaEventName, isPast && { color: C.textMuted }]}>
                                                    {ev.hijri.holidays.join(', ')}
                                                </Text>
                                                <Text style={s.agendaHijriDate}>
                                                    {ev.hijri.day} {ev.hijri.monthEn} {ev.hijri.year} H · {ev.gregorian.weekday}
                                                </Text>
                                            </View>
                                            {!isPast && <Ionicons name="star" size={14} color={C.accent} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        );
                    })()}

                    {/* Legend */}
                    <View style={s.legend}>
                        <View style={s.legendItem}>
                            <View style={[s.legendDot, { backgroundColor: C.primary }]} />
                            <Text style={s.legendText}>{t.today || 'Hari ini'}</Text>
                        </View>
                        <View style={s.legendItem}>
                            <View style={[s.legendDot, { backgroundColor: C.accent }]} />
                            <Text style={s.legendText}>{t.islamic_holiday || 'Hari besar Islam'}</Text>
                        </View>
                    </View>
                </>
            )}
            <View style={{ height: 30 }} />
        </ScrollView>
    );
};

const makeStyles = (C) => ({
    container: { flex: 1, backgroundColor: C.background },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: C.primary, paddingTop: 10, paddingBottom: 14, paddingHorizontal: 16,
    },
    navBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.white },

    // Month nav
    monthNav: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 16,
    },
    monthBtn: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: C.primarySoft,
        justifyContent: 'center', alignItems: 'center',
    },
    monthCenter: { alignItems: 'center' },
    monthGregorian: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary },
    monthHijri: { fontSize: SIZES.small, color: C.primary, fontWeight: '500', marginTop: 2 },

    loadingBox: { paddingVertical: 60, alignItems: 'center' },

    // Weekday row
    weekRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
    weekCell: { flex: 1, alignItems: 'center', paddingVertical: 8 },
    weekText: { fontSize: SIZES.caption, color: C.textMuted, fontWeight: '600' },

    // Calendar grid
    calGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
    dayCell: {
        width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 8, borderRadius: 10,
    },
    dayCellToday: { backgroundColor: C.primarySoft },
    dayCellSelected: { backgroundColor: C.primary },
    dayGreg: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    dayGregToday: { color: C.primary, fontWeight: '700' },
    dayGregSelected: { color: C.white },
    dayHijri: { fontSize: 9, color: C.textMuted, marginTop: 1 },
    dayHijriToday: { color: C.primary },
    dayHijriSelected: { color: 'rgba(255,255,255,0.7)' },
    holidayDot: {
        width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent, marginTop: 2,
    },

    // Info card
    infoCard: {
        backgroundColor: C.surface, marginHorizontal: 16, marginTop: 16, borderRadius: SIZES.radius,
        padding: 16, borderWidth: 1, borderColor: C.divider,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoDateBox: { alignItems: 'center', flex: 1 },
    infoDateBig: { fontSize: 32, fontWeight: '700', color: C.textPrimary },
    infoDateSub: { fontSize: SIZES.small, color: C.textMuted, marginTop: 2 },
    infoDivider: { width: 1, height: 40, backgroundColor: C.divider, marginHorizontal: 16 },
    infoHijriBox: { alignItems: 'center', flex: 1 },
    infoHijriDay: { fontSize: 32, fontWeight: '700', color: C.primary },
    infoHijriMonth: { fontSize: SIZES.small, color: C.primary, fontWeight: '600', marginTop: 2 },
    infoHijriYear: { fontSize: SIZES.caption, color: C.textMuted },
    infoWeekday: { fontSize: SIZES.font, color: C.textMuted, textAlign: 'center', marginTop: 10 },
    holidayBanner: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.accentLight,
        padding: 10, borderRadius: 10, marginTop: 12,
    },
    holidayText: { fontSize: SIZES.small, color: C.accent, fontWeight: '600', marginLeft: 8, flex: 1 },

    // Legend
    // Agenda
    agendaSection: { marginHorizontal: 16, marginTop: 20 },
    agendaTitle: { fontSize: SIZES.large, fontWeight: '700', color: C.textPrimary, marginBottom: 12 },
    agendaCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
        borderRadius: SIZES.radius, padding: 14, marginBottom: 8,
        borderWidth: 1, borderColor: C.divider,
    },
    agendaCardPast: { opacity: 0.5 },
    agendaDateBox: {
        width: 48, height: 48, borderRadius: 12, backgroundColor: C.accentLight,
        justifyContent: 'center', alignItems: 'center', marginRight: 14,
    },
    agendaDateBoxPast: { backgroundColor: C.surfaceAlt },
    agendaDateDay: { fontSize: SIZES.large, fontWeight: '700', color: C.accent },
    agendaDateMonth: { fontSize: 9, fontWeight: '600', color: C.accent },
    agendaInfo: { flex: 1 },
    agendaEventName: { fontSize: SIZES.font, fontWeight: '600', color: C.textPrimary },
    agendaHijriDate: { fontSize: SIZES.caption, color: C.textMuted, marginTop: 2 },

    // Legend
    legend: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    legendText: { fontSize: SIZES.caption, color: C.textMuted },
});

export default HijriCalendarScreen;
