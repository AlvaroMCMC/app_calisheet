import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { RootStackParamList } from '../App';
import { RoutineRow, getRoutines } from '../services/api';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIMARY_TAGS = ['Anillas', 'Barra'];
const ALL_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const TODAY = ALL_DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

function RoutineCard({ routine, onStart, onDetail }: {
  routine: RoutineRow;
  onStart: () => void;
  onDetail: () => void;
}) {
  const tags: string[] = JSON.parse(routine.tags ?? '[]');
  const scheduleDays: string[] = JSON.parse(routine.schedule_days ?? '[]');
  const isToday = scheduleDays.includes(TODAY);
  const progressValue = routine.completion_rate ?? (routine.streak ? 90 : null);
  const progressColor = routine.completion_rate
    ? Colors.primary
    : routine.streak
    ? Colors.status.success
    : Colors.status.warning;
  const progressLabel = routine.completion_rate
    ? `${routine.completion_rate}% completado`
    : routine.streak
    ? `Racha: ${routine.streak}`
    : null;

  return (
    <View style={[styles.card, isToday && styles.cardToday]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{routine.title}</Text>
          {routine.subtitle ? <Text style={styles.cardSubtitle}>{routine.subtitle}</Text> : null}
        </View>
        <TouchableOpacity onPress={onDetail} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={[styles.tag, PRIMARY_TAGS.includes(tag) && styles.tagPrimary]}>
            <Text style={[styles.tagText, PRIMARY_TAGS.includes(tag) && styles.tagTextPrimary]}>
              {tag}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          <Ionicons name="barbell-outline" size={13} color={Colors.text.secondary} />
          {'  '}{routine.exercises_count} ejercicios
        </Text>
        <View style={styles.metaRight}>
          <Ionicons name="time-outline" size={13} color={Colors.text.secondary} />
          <Text style={styles.metaText}>  {routine.last_performed}</Text>
        </View>
      </View>

      {scheduleDays.length > 0 && (
        <View style={styles.daysRow}>
          {ALL_DAYS.map((day) => {
            const active = scheduleDays.includes(day);
            const isCurrentDay = day === TODAY;
            return (
              <View
                key={day}
                style={[
                  styles.dayBadge,
                  active && styles.dayBadgeActive,
                  isCurrentDay && active && styles.dayBadgeToday,
                ]}
              >
                <Text style={[
                  styles.dayBadgeText,
                  active && styles.dayBadgeTextActive,
                  isCurrentDay && active && styles.dayBadgeTextToday,
                ]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      )}

      {progressValue !== null && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressValue}%` as any, backgroundColor: progressColor }]} />
          </View>
          {progressLabel && <Text style={styles.progressLabel}>{progressLabel}</Text>}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.85}>
          <Ionicons name="play" size={15} color="#fff" />
          <Text style={styles.startButtonText}>Iniciar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.detailButton} onPress={onDetail} activeOpacity={0.8}>
          <Text style={styles.detailButtonText}>Ver Detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { userId, displayName, email, signOut } = useAuth();
  const { getToken } = useClerkAuth();
  const [routines, setRoutines] = useState<RoutineRow[]>([]);
  const [search, setSearch] = useState('');

  const loadRoutines = useCallback(async () => {
    if (!userId) return;
    const token = await getToken();
    if (!token) return;
    const rows = await getRoutines(token);
    setRoutines(rows);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useFocusEffect(useCallback(() => { loadRoutines(); }, [loadRoutines]));

  const filtered = routines.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Mis Rutinas</Text>
          <Text style={styles.headerSubtitle}>
            {displayName ?? email ?? 'Usuario'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => signOut()}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.push('RoutineDetail', {})}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar rutinas..."
          placeholderTextColor={Colors.text.secondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RoutineCard
            routine={item}
            onStart={() => navigation.push('ActiveWorkout', { routineId: item.id })}
            onDetail={() => navigation.push('RoutineDetail', { routineId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="barbell-outline" size={48} color={Colors.background.border} />
            <Text style={styles.emptyText}>No hay rutinas. Crea la primera.</Text>
          </View>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.createCard}
            onPress={() => navigation.push('RoutineDetail', {})}
            activeOpacity={0.8}
          >
            <View style={styles.createIcon}>
              <Ionicons name="add" size={28} color={Colors.text.secondary} />
            </View>
            <Text style={styles.createTitle}>Crear Nueva Rutina</Text>
            <Text style={styles.createSubtitle}>Diseña un plan personalizado.</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.dark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.text.primary },
  headerSubtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoutButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.background.border },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.background.border, borderRadius: 10, marginHorizontal: 16, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  emptyContainer: { alignItems: 'center', paddingTop: 48, gap: 12 },
  emptyText: { color: Colors.text.secondary, fontSize: 14 },
  card: { backgroundColor: Colors.background.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.background.border, padding: 16, gap: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitleBlock: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 17, fontWeight: '800', color: Colors.text.primary },
  cardSubtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.background.border },
  tagPrimary: { backgroundColor: Colors.primary + '22' },
  tagText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase' },
  tagTextPrimary: { color: Colors.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRight: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12, color: Colors.text.secondary },
  progressContainer: { gap: 4 },
  progressTrack: { height: 4, backgroundColor: Colors.background.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  progressLabel: { fontSize: 11, color: Colors.text.secondary, textAlign: 'right' },
  cardActions: { flexDirection: 'row', gap: 10 },
  startButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: 8, height: 40 },
  startButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  detailButton: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background.border, borderRadius: 8, height: 40 },
  detailButtonText: { color: Colors.text.primary, fontWeight: '600', fontSize: 14 },
  createCard: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.background.border, padding: 32, marginTop: 4, gap: 8 },
  createIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.background.border, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  createTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  createSubtitle: { fontSize: 13, color: Colors.text.secondary, textAlign: 'center' },
  cardToday: { borderColor: Colors.primary, borderWidth: 1.5 },
  daysRow: { flexDirection: 'row', gap: 4 },
  dayBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.background.deep },
  dayBadgeActive: { backgroundColor: Colors.background.border },
  dayBadgeToday: { backgroundColor: Colors.primary },
  dayBadgeText: { fontSize: 10, fontWeight: '600', color: Colors.text.secondary + '55' },
  dayBadgeTextActive: { color: Colors.text.secondary },
  dayBadgeTextToday: { color: '#fff', fontWeight: '800' },
});
