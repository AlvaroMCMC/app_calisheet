import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { Audio } from 'expo-av';
import { RootStackParamList } from '../App';
import { getRoutineWithExercises, saveSession } from '../services/api';
import { Colors } from '../constants/colors';
import { equipmentHasWeight, weightColumnLabel, getExtraField, equipmentHasDuration, formatDuration } from '../constants/equipment';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ActiveWorkout'>;
  route: RouteProp<RootStackParamList, 'ActiveWorkout'>;
};

interface WorkoutSet {
  id: number;
  weight: string;
  reps: string;
  nivel: string;   // ring height 1-14, '' if not applicable
  status: 'completed' | 'active' | 'pending';
}

interface WorkoutExercise {
  name: string;
  muscle: string;
  equipment: string[];
  restSeconds: number;
  sets: WorkoutSet[];
}

function formatTime(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

function expandSets(rows: { sets: string; reps: string; weight: string; nivel_anillas: string }[]): WorkoutSet[] {
  const result: WorkoutSet[] = [];
  for (const row of rows) {
    const count = Math.max(1, parseInt(row.sets) || 1);
    for (let i = 0; i < count; i++) {
      result.push({ id: result.length + 1, weight: row.weight, reps: row.reps, nivel: row.nivel_anillas ?? '', status: 'pending' });
    }
  }
  if (result.length > 0) result[0].status = 'active';
  return result;
}

export default function ActiveWorkoutScreen({ navigation, route }: Props) {
  const { getToken } = useClerkAuth();
  const { routineId } = route.params;
  const startedAt = useRef(new Date().toISOString());
  const soundRef = useRef<Audio.Sound | null>(null);
  const soundEndRef = useRef<Audio.Sound | null>(null);

  const [routineName, setRoutineName] = useState('Entrenamiento');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerRunning, setTimerRunning] = useState(false);
  const restDefault = exercises[currentIdx]?.restSeconds ?? 90;

  // Load beep sounds once on mount
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    Audio.Sound.createAsync(require('../assets/sounds/beep.wav')).then(({ sound }) => {
      soundRef.current = sound;
    });
    Audio.Sound.createAsync(require('../assets/sounds/beep_end.wav')).then(({ sound }) => {
      soundEndRef.current = sound;
    });
    return () => {
      soundRef.current?.unloadAsync();
      soundEndRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) return;
      const { routine, exercises: exs } = await getRoutineWithExercises(token, routineId);
      setRoutineName(routine?.title ?? 'Entrenamiento');
      const mapped = exs.map((ex) => ({
        name: ex.name,
        muscle: ex.muscle,
        equipment: JSON.parse(ex.equipment ?? '[]'),
        restSeconds: ex.rest_seconds ?? 90,
        sets: expandSets(ex.rows),
      }));
      setExercises(mapped);
      setTimerSeconds(mapped[0]?.restSeconds ?? 90);
    })();
  }, [routineId]);

  // Sync timer when switching exercises (without timer running)
  useEffect(() => {
    if (!timerRunning) {
      setTimerSeconds(exercises[currentIdx]?.restSeconds ?? 90);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, exercises]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) { clearInterval(interval); setTimerRunning(false); soundEndRef.current?.replayAsync(); return restDefault; }
        if (prev <= 10) { soundRef.current?.replayAsync(); }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning]);

  const currentExercise = exercises[currentIdx];

  const completeSet = useCallback((setId: number) => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== currentIdx) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id === setId) return { ...s, status: 'completed' };
            if (s.id === setId + 1) return { ...s, status: 'active' };
            return s;
          }),
        };
      })
    );
    setTimerSeconds(exercises[currentIdx]?.restSeconds ?? 90);
    setTimerRunning(true);
  }, [currentIdx, exercises]);

  const updateSet = (setId: number, field: 'weight' | 'reps' | 'nivel', value: string) => {
    setExercises((prev) =>
      prev.map((ex, idx) =>
        idx !== currentIdx ? ex : { ...ex, sets: ex.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s) }
      )
    );
  };

  const addSet = () => {
    setExercises((prev) =>
      prev.map((ex, idx) => {
        if (idx !== currentIdx) return ex;
        const lastId = ex.sets[ex.sets.length - 1]?.id ?? 0;
        const allCompleted = ex.sets.every((s) => s.status === 'completed');
        return { ...ex, sets: [...ex.sets, { id: lastId + 1, weight: '0', reps: '8', nivel: '', status: allCompleted ? 'active' : 'pending' }] };
      })
    );
  };

  const handleFinish = async () => {
    Alert.alert('Finalizar Entrenamiento', '¿Guardar y finalizar la sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        onPress: async () => {
          const completedSets: { exerciseName: string; weight: number; reps: number; nivelAnillas?: number }[] = [];
          for (const ex of exercises) {
            for (const s of ex.sets) {
              if (s.status === 'completed') {
                const nivel = s.nivel ? parseInt(s.nivel) : undefined;
                completedSets.push({
                  exerciseName: ex.name,
                  weight: parseFloat(s.weight) || 0,
                  reps: parseInt(s.reps) || 0,
                  nivelAnillas: nivel && !isNaN(nivel) ? nivel : undefined,
                });
              }
            }
          }
          const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
          const token = await getToken();
          if (token) {
            await saveSession(token, {
              routineId, routineName,
              startedAt: startedAt.current,
              finishedAt: new Date().toISOString(),
              totalVolumeKg: totalVolume,
              sets: completedSets,
            });
          }
          navigation.goBack();
        },
      },
    ]);
  };

  const goNext = () => {
    if (currentIdx >= exercises.length - 1) { handleFinish(); return; }
    setTimerRunning(false);
    setCurrentIdx((p) => p + 1);
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setTimerRunning(false);
      setCurrentIdx((p) => p - 1);
    }
  };

  const progressPct = exercises.length > 0 ? (currentIdx / exercises.length) * 100 : 0;

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={22} color={Colors.text.primary} /></TouchableOpacity>
          <Text style={styles.topBarTitle}>Cargando...</Text>
          <View style={{ width: 22 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Ionicons name="close" size={22} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{routineName}</Text>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Progreso de sesión</Text>
          <Text style={styles.progressCounter}>Ejercicio {currentIdx + 1} de {exercises.length}</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Exercise mini-list */}
        <View style={styles.exerciseListCard}>
          {exercises.map((ex, idx) => (
            <View key={idx} style={[styles.exerciseListItem, idx === currentIdx && styles.exerciseListItemActive]}>
              <View style={[
                styles.exerciseListBadge,
                ex.sets.every((s) => s.status === 'completed') && styles.exerciseListBadgeDone,
                idx === currentIdx && styles.exerciseListBadgeCurrent,
              ]}>
                {ex.sets.every((s) => s.status === 'completed') ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={styles.exerciseListBadgeText}>{idx + 1}</Text>
                )}
              </View>
              <Text style={[styles.exerciseListName, idx === currentIdx && styles.exerciseListNameActive]} numberOfLines={1}>
                {ex.name || `Ejercicio ${idx + 1}`}
              </Text>
            </View>
          ))}
        </View>

        {/* Current exercise header */}
        {currentExercise && (
          <>
            <View style={styles.exerciseHeader}>
              {currentExercise.muscle ? (
                <View style={styles.badgesRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{currentExercise.muscle}</Text>
                  </View>
                </View>
              ) : null}
              <Text style={styles.exerciseName}>{currentExercise.name || 'Ejercicio'}</Text>
            </View>

            {/* Stats + Timer */}
            <View style={styles.statsTimerRow}>
              <View style={styles.timerCard}>
                <Text style={styles.timerLabel}>Descanso</Text>
                <Text style={[styles.timerValue, timerRunning && styles.timerValueRunning]}>
                  {formatTime(timerSeconds)}
                </Text>
                <TouchableOpacity
                  style={[styles.timerButton, timerRunning && styles.timerButtonActive]}
                  onPress={() => { if (timerRunning) { setTimerRunning(false); setTimerSeconds(restDefault); } else { setTimerRunning(true); } }}
                >
                  <Ionicons name={timerRunning ? 'stop' : 'play'} size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sets table */}
            {(() => {
              const isDuration = equipmentHasDuration(currentExercise.equipment);
              const showWeight = equipmentHasWeight(currentExercise.equipment);
              const wLabel = weightColumnLabel(currentExercise.equipment);
              const extraField = !isDuration ? getExtraField(currentExercise.equipment) : null;
              return (
            <View style={styles.setsCard}>
              <View style={styles.setsTableHeader}>
                <Text style={[styles.setHeaderText, styles.colSet]}>Set</Text>
                {showWeight && <Text style={[styles.setHeaderText, styles.colWeight]}>{wLabel}</Text>}
                {isDuration
                  ? <Text style={[styles.setHeaderText, showWeight ? styles.colReps : styles.colRepsWide]}>Seg.</Text>
                  : <Text style={[styles.setHeaderText, showWeight ? styles.colReps : styles.colRepsWide]}>Reps</Text>}
                {extraField && <Text style={[styles.setHeaderText, styles.colNivel]}>{extraField.shortLabel}</Text>}
                <Text style={[styles.setHeaderText, styles.colStatus]}>Estado</Text>
              </View>

              {currentExercise.sets.map((set) => {
                const isCompleted = set.status === 'completed';
                const isActive = set.status === 'active';
                return (
                  <View key={set.id} style={[styles.setRow, isCompleted && styles.setRowCompleted, isActive && styles.setRowActive, !isCompleted && !isActive && styles.setRowPending]}>
                    {isActive && <View style={styles.activeIndicator} />}
                    <View style={[styles.colSet, { alignItems: 'center' }]}>
                      <View style={[styles.setNumber, isCompleted && styles.setNumberCompleted, isActive && styles.setNumberActive]}>
                        <Text style={[styles.setNumberText, isCompleted && styles.setNumberTextCompleted, isActive && styles.setNumberTextActive]}>{set.id}</Text>
                      </View>
                    </View>
                    {showWeight && (
                      <View style={[styles.colWeight, { alignItems: 'center' }]}>
                        {isActive ? (
                          <TextInput style={styles.setInput} value={set.weight} onChangeText={(v) => updateSet(set.id, 'weight', v)} keyboardType="numeric" selectTextOnFocus />
                        ) : (
                          <Text style={[styles.setCellText, isCompleted && styles.setCellTextDone]}>
                            {Number(set.weight) > 0 ? `+${set.weight}` : set.weight} kg
                          </Text>
                        )}
                      </View>
                    )}
                    <View style={[showWeight ? styles.colReps : styles.colRepsWide, { alignItems: 'center' }]}>
                      {isActive ? (
                        <TextInput
                          style={styles.setInput}
                          value={set.reps}
                          onChangeText={(v) => updateSet(set.id, 'reps', v)}
                          keyboardType="numeric"
                          selectTextOnFocus
                          placeholder={isDuration ? 'seg' : ''}
                          placeholderTextColor={Colors.text.secondary}
                        />
                      ) : (
                        <Text style={[styles.setCellText, isCompleted && styles.setCellTextDone]}>
                          {isDuration ? formatDuration(parseInt(set.reps) || 0) : set.reps}
                        </Text>
                      )}
                    </View>
                    {extraField && (
                      <View style={[styles.colNivel, { alignItems: 'center' }]}>
                        {isActive ? (
                          <TextInput
                            style={[styles.setInput, { width: 44 }]}
                            value={set.nivel}
                            onChangeText={(v) => updateSet(set.id, 'nivel', v)}
                            keyboardType="number-pad"
                            placeholder={`${extraField.min}-${extraField.max}`}
                            placeholderTextColor={Colors.text.secondary}
                            selectTextOnFocus
                          />
                        ) : (
                          <Text style={styles.setCellText}>{set.nivel || '—'}</Text>
                        )}
                      </View>
                    )}
                    <View style={[styles.colStatus, { alignItems: 'center' }]}>
                      {isCompleted ? (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.status.success} />
                          <Text style={styles.completedText}>Listo</Text>
                        </View>
                      ) : isActive ? (
                        <TouchableOpacity style={styles.completeButton} onPress={() => completeSet(set.id)} activeOpacity={0.85}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.completeButtonText}>OK</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.pendingText}>Pendiente</Text>
                      )}
                    </View>
                  </View>
                );
              })}

              <View style={styles.setsFooter}>
                <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                  <Ionicons name="add-circle-outline" size={18} color={Colors.text.secondary} />
                  <Text style={styles.addSetText}>Agregar serie</Text>
                </TouchableOpacity>
              </View>
            </View>
            );
            })()}
          </>
        )}

        <View style={styles.navButtons}>
          <TouchableOpacity style={styles.navButtonSecondary} onPress={goPrev} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color={Colors.text.primary} />
            <Text style={styles.navButtonSecondaryText}>Anterior</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButtonPrimary} onPress={goNext} activeOpacity={0.85}>
            <Text style={styles.navButtonPrimaryText}>
              {currentIdx >= exercises.length - 1 ? 'Finalizar' : 'Siguiente Ejercicio'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.dark },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.background.border },
  topBarTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text.primary, textAlign: 'center', marginHorizontal: 8 },
  finishButton: { backgroundColor: Colors.status.danger + '22', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  finishButtonText: { fontSize: 13, fontWeight: '700', color: Colors.status.danger },
  progressSection: { paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, color: Colors.text.secondary },
  progressCounter: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  progressTrack: { height: 4, backgroundColor: Colors.background.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 2 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  exerciseListCard: { backgroundColor: Colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, overflow: 'hidden' },
  exerciseListItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 },
  exerciseListItemActive: { backgroundColor: Colors.primary + '11' },
  exerciseListBadge: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: Colors.background.border, alignItems: 'center', justifyContent: 'center' },
  exerciseListBadgeDone: { backgroundColor: Colors.status.success, borderColor: Colors.status.success },
  exerciseListBadgeCurrent: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  exerciseListBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary },
  exerciseListName: { fontSize: 13, color: Colors.text.secondary, flex: 1 },
  exerciseListNameActive: { color: Colors.primary, fontWeight: '700' },
  exerciseHeader: { gap: 6 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: Colors.background.border },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase' },
  exerciseName: { fontSize: 26, fontWeight: '900', color: Colors.text.primary, lineHeight: 30 },
  statsTimerRow: { flexDirection: 'row' },
  timerCard: { backgroundColor: Colors.background.card, borderRadius: 10, borderWidth: 1, borderColor: Colors.background.border, padding: 14, alignItems: 'center', gap: 6, flex: 1 },
  timerLabel: { fontSize: 11, color: Colors.text.secondary },
  timerValue: { fontSize: 28, fontWeight: '800', color: Colors.text.primary },
  timerValueRunning: { color: Colors.primary },
  timerButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.background.border, alignItems: 'center', justifyContent: 'center' },
  timerButtonActive: { backgroundColor: Colors.primary },
  setsCard: { backgroundColor: Colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, overflow: 'hidden' },
  setsTableHeader: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.background.border, backgroundColor: Colors.background.deep },
  setHeaderText: { fontSize: 10, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.background.border, position: 'relative' },
  setRowCompleted: { backgroundColor: Colors.status.success + '08' },
  setRowActive: { backgroundColor: Colors.primary + '0a' },
  setRowPending: { opacity: 0.6 },
  activeIndicator: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: Colors.primary },
  colSet: { flex: 0.7 }, colWeight: { flex: 1.3 }, colReps: { flex: 1 }, colRepsWide: { flex: 2.3 }, colNivel: { flex: 0.9 }, colStatus: { flex: 1.3 },
  setNumber: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.background.border, alignItems: 'center', justifyContent: 'center' },
  setNumberCompleted: { backgroundColor: Colors.status.success + '33', borderColor: Colors.status.success },
  setNumberActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  setNumberText: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary },
  setNumberTextCompleted: { color: Colors.status.success },
  setNumberTextActive: { color: '#fff' },
  setInput: { width: 56, backgroundColor: Colors.background.deep, borderWidth: 2, borderColor: Colors.primary, borderRadius: 8, textAlign: 'center', fontSize: 18, fontWeight: '700', color: Colors.text.primary, paddingVertical: 6 },
  setCellText: { fontSize: 15, fontWeight: '600', color: Colors.text.secondary, textAlign: 'center' },
  setCellTextDone: { textDecorationLine: 'line-through', opacity: 0.6 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: Colors.status.success + '22' },
  completedText: { fontSize: 12, fontWeight: '700', color: Colors.status.success },
  completeButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  completeButtonText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pendingText: { fontSize: 12, color: Colors.text.secondary, fontStyle: 'italic' },
  setsFooter: { paddingHorizontal: 14, paddingVertical: 12 },
  addSetButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addSetText: { fontSize: 13, color: Colors.text.secondary, fontWeight: '600' },
  navButtons: { flexDirection: 'row', gap: 12 },
  navButtonSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 50, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, backgroundColor: Colors.background.card },
  navButtonSecondaryText: { color: Colors.text.primary, fontWeight: '600', fontSize: 14 },
  navButtonPrimary: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 50, borderRadius: 12, backgroundColor: Colors.primary },
  navButtonPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
