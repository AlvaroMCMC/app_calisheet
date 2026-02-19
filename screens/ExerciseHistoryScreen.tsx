import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import {
  getExerciseNames, getExerciseStats, getExerciseHistory, getVolumeProgression,
  ExerciseStats, HistoryEntry, VolumePoint, SetDetail,
} from '../services/api';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';

type Period = 'week' | 'month';

function getPeriodStart(period: Period): string {
  const now = new Date();
  if (period === 'week') {
    const day = now.getDay();                    // 0=Dom … 6=Sáb
    const diff = day === 0 ? -6 : 1 - day;      // retroceder hasta el lunes
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function formatVolume(kg: number): string {
  return kg >= 1000
    ? `${(kg / 1000).toFixed(1)} t`
    : `${Math.round(kg)} kg`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PeriodToggle({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <View style={toggleStyles.row}>
      {(['week', 'month'] as Period[]).map((p) => (
        <TouchableOpacity
          key={p}
          style={[toggleStyles.pill, value === p && toggleStyles.pillActive]}
          onPress={() => onChange(p)}
          activeOpacity={0.8}
        >
          <Text style={[toggleStyles.pillText, value === p && toggleStyles.pillTextActive]}>
            {p === 'week' ? 'Esta semana' : 'Este mes'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, backgroundColor: Colors.background.deep, borderRadius: 10, padding: 4 },
  pill: { flex: 1, paddingVertical: 7, borderRadius: 7, alignItems: 'center' },
  pillActive: { backgroundColor: Colors.primary },
  pillText: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
  pillTextActive: { color: '#fff', fontWeight: '700' },
});

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statLabelRow}>
        <Ionicons name={icon as any} size={14} color={Colors.text.secondary} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function SetRow({ set, index }: { set: SetDetail; index: number }) {
  const hasWeight = set.weight > 0;
  return (
    <View style={setRowStyles.row}>
      <View style={setRowStyles.badge}>
        <Text style={setRowStyles.badgeText}>{index + 1}</Text>
      </View>
      <View style={setRowStyles.info}>
        <Text style={setRowStyles.reps}>
          {set.reps} <Text style={setRowStyles.unit}>reps</Text>
        </Text>
        {hasWeight && (
          <Text style={setRowStyles.weight}>+{set.weight} kg</Text>
        )}
        {set.nivelAnillas != null && (
          <View style={setRowStyles.nivelBadge}>
            <Text style={setRowStyles.nivelText}>Niv. {set.nivelAnillas}</Text>
          </View>
        )}
        {set.rpe != null && (
          <View style={setRowStyles.rpeBadge}>
            <Text style={setRowStyles.rpeText}>RPE {set.rpe}</Text>
          </View>
        )}
      </View>
      {hasWeight && (
        <Text style={setRowStyles.volume}>
          {Math.round(set.weight * set.reps)} kg
        </Text>
      )}
    </View>
  );
}

const setRowStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: Colors.background.deep + 'aa' },
  badge: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.background.border, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary },
  info: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  reps: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  unit: { fontSize: 12, fontWeight: '400', color: Colors.text.secondary },
  weight: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  nivelBadge: { backgroundColor: Colors.primary + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  nivelText: { fontSize: 11, fontWeight: '600', color: Colors.primary },
  rpeBadge: { backgroundColor: Colors.status.warning + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  rpeText: { fontSize: 11, fontWeight: '600', color: Colors.status.warning },
  volume: { fontSize: 12, color: Colors.text.secondary, fontWeight: '500' },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function ExerciseHistoryScreen() {
  const { userId } = useAuth();
  const { getToken } = useClerkAuth();
  const [search, setSearch] = useState('');
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('month');
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [volume, setVolume] = useState<VolumePoint[]>([]);

  // Load exercise names on focus
  const loadNames = useCallback(async () => {
    if (!userId) return;
    const token = await getToken();
    if (!token) return;
    const names = await getExerciseNames(token);
    setExerciseNames(names);
    if (names.length > 0 && !selectedName) setSelectedName(names[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useFocusEffect(useCallback(() => { loadNames(); }, [loadNames]));

  // Reload history + volume when selected exercise changes
  useEffect(() => {
    if (!selectedName || !userId) return;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const [h, v] = await Promise.all([
        getExerciseHistory(token, selectedName),
        getVolumeProgression(token, selectedName),
      ]);
      setHistory(h);
      setVolume(v);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedName, userId]);

  // Reload stats when exercise OR period changes
  useEffect(() => {
    if (!selectedName || !userId) return;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const s = await getExerciseStats(token, selectedName, getPeriodStart(period));
      setStats(s);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedName, period, userId]);

  const onSelectExercise = (name: string) => setSelectedName(name);

  const filtered = exerciseNames.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase())
  );

  const maxVolume = volume.length > 0 ? Math.max(...volume.map((v) => v.volume)) : 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSubtitle}>Progreso por ejercicio</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {exerciseNames.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="stats-chart-outline" size={56} color={Colors.background.border} />
            <Text style={styles.emptyTitle}>Sin historial todavía</Text>
            <Text style={styles.emptySubtitle}>
              Completa un entrenamiento para empezar a ver tu progreso aquí.
            </Text>
          </View>
        ) : (
          <>
            {/* Exercise selector */}
            <View style={styles.selectorSection}>
              <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={16} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar ejercicio..."
                  placeholderTextColor={Colors.text.secondary}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {filtered.map((name) => (
                <TouchableOpacity
                  key={name}
                  style={[styles.exerciseItem, selectedName === name && styles.exerciseItemActive]}
                  onPress={() => onSelectExercise(name)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="barbell-outline"
                    size={16}
                    color={selectedName === name ? Colors.primary : Colors.text.secondary}
                  />
                  <Text style={[styles.exerciseItemName, selectedName === name && styles.exerciseItemNameActive]}>
                    {name}
                  </Text>
                  {selectedName === name && (
                    <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {selectedName && stats && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>{selectedName}</Text>

                {/* Period toggle */}
                <PeriodToggle value={period} onChange={setPeriod} />

                {/* Stats cards */}
                <View style={styles.statsGrid}>
                  <StatCard
                    icon="barbell-outline"
                    label="Máx. Reps"
                    value={stats.maxReps > 0 ? `${stats.maxReps} reps` : '—'}
                  />
                  <StatCard
                    icon="scale-outline"
                    label="Máx. Lastre"
                    value={stats.maxWeight > 0 ? `+${stats.maxWeight} kg` : '—'}
                  />
                  <StatCard
                    icon="time-outline"
                    label="Sesiones"
                    value={stats.totalSessions > 0 ? `${stats.totalSessions}` : '—'}
                  />
                  <StatCard
                    icon="trending-up-outline"
                    label="Vol. total"
                    value={stats.totalVolume > 0 ? formatVolume(stats.totalVolume) : '—'}
                    sub="Σ reps × peso"
                  />
                </View>

                {/* Volume progression bars */}
                {volume.length > 0 && (
                  <View style={styles.chartCard}>
                    <Text style={styles.chartTitle}>Progresión mensual de volumen</Text>
                    <View style={styles.chartBars}>
                      {volume.map((point, i) => (
                        <View key={i} style={styles.barRow}>
                          <Text style={styles.barMonth}>{point.month}</Text>
                          <View style={styles.barTrack}>
                            <View style={[styles.barFill, { width: `${(point.volume / maxVolume) * 100}%` as any }]} />
                          </View>
                          <Text style={styles.barLabel}>{point.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Full session history */}
                <View style={styles.historySection}>
                  <Text style={styles.historyTitle}>Historial de Sesiones</Text>

                  {history.length === 0 ? (
                    <View style={styles.historyEmpty}>
                      <Text style={styles.historyEmptyText}>No hay sesiones registradas para este ejercicio.</Text>
                    </View>
                  ) : (
                    history.map((row) => (
                      <View key={row.sessionId} style={styles.historyCard}>
                        {/* Card header */}
                        <View style={styles.historyCardTop}>
                          <View style={styles.historyDateBlock}>
                            <Ionicons name="calendar-outline" size={13} color={Colors.text.secondary} />
                            <Text style={styles.historyDate}>{row.date}</Text>
                          </View>
                          <View style={styles.historyRoutineBadge}>
                            <Text style={styles.historyRoutineText} numberOfLines={1}>{row.routineName}</Text>
                          </View>
                        </View>

                        {/* Set column headers */}
                        <View style={styles.setsTableHeader}>
                          <Text style={[styles.setsHeaderText, { width: 22 }]}>#</Text>
                          <Text style={[styles.setsHeaderText, { flex: 1 }]}>Reps · Peso</Text>
                          <Text style={[styles.setsHeaderText, { width: 64, textAlign: 'right' }]}>Volumen</Text>
                        </View>

                        {/* Sets detail */}
                        {row.sets.map((s, i) => (
                          <SetRow key={i} set={s} index={i} />
                        ))}

                        {/* Session total */}
                        {row.totalVolume > 0 && (
                          <View style={styles.sessionTotal}>
                            <Text style={styles.sessionTotalLabel}>Volumen total sesión</Text>
                            <Text style={styles.sessionTotalValue}>{formatVolume(row.totalVolume)}</Text>
                          </View>
                        )}
                      </View>
                    ))
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.dark },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.background.border },
  headerTitle: { fontSize: 26, fontWeight: '900', color: Colors.text.primary },
  headerSubtitle: { fontSize: 13, color: Colors.text.secondary, marginTop: 2 },

  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  emptySubtitle: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center', lineHeight: 20 },

  selectorSection: { padding: 16, gap: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.background.border, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, color: Colors.text.primary, fontSize: 14 },
  exerciseItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.background.card, borderWidth: 1, borderColor: Colors.background.border },
  exerciseItemActive: { borderColor: Colors.primary + '66', backgroundColor: Colors.primary + '11' },
  exerciseItemName: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.text.secondary },
  exerciseItemNameActive: { color: Colors.text.primary },

  detailSection: { padding: 16, gap: 16, paddingBottom: 40 },
  detailTitle: { fontSize: 22, fontWeight: '900', color: Colors.text.primary },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: Colors.background.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.background.border, padding: 12, gap: 4 },
  statLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontSize: 20, fontWeight: '800', color: Colors.text.primary },
  statSub: { fontSize: 11, color: Colors.text.secondary },

  chartCard: { backgroundColor: Colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, padding: 16, gap: 14 },
  chartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  chartBars: { gap: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barMonth: { width: 28, fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  barTrack: { flex: 1, height: 10, backgroundColor: Colors.background.border, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 5 },
  barLabel: { width: 64, fontSize: 12, color: Colors.text.secondary, textAlign: 'right' },

  historySection: { gap: 10 },
  historyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  historyEmpty: { padding: 24, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, alignItems: 'center' },
  historyEmptyText: { color: Colors.text.secondary, fontSize: 13, textAlign: 'center' },

  historyCard: { backgroundColor: Colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, padding: 14, gap: 6 },
  historyCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  historyDateBlock: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  historyDate: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  historyRoutineBadge: { backgroundColor: Colors.primary + '22', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, maxWidth: 160 },
  historyRoutineText: { fontSize: 11, fontWeight: '700', color: Colors.primary },

  setsTableHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: Colors.background.border },
  setsHeaderText: { fontSize: 10, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5 },

  sessionTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.background.border },
  sessionTotalLabel: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' },
  sessionTotalValue: { fontSize: 14, fontWeight: '800', color: Colors.primary },
});
