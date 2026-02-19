import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useAuth as useClerkAuth } from '@clerk/clerk-expo';
import { RootStackParamList } from '../App';
import { getRoutineWithExercises, saveRoutine, deleteRoutine } from '../services/api';
import { Colors } from '../constants/colors';
import { EQUIPMENT_TYPES, equipmentHasWeight, weightColumnLabel, getExtraField, equipmentHasDuration } from '../constants/equipment';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RoutineDetail'>;
  route: RouteProp<RootStackParamList, 'RoutineDetail'>;
};

interface SetRow { id: number; sets: string; reps: string; weight: string; nivel: string; }
interface LocalExercise {
  id: number;
  name: string;
  muscle: string;
  equipment: string[];
  restSeconds: number;
  rows: SetRow[];
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function RoutineDetailScreen({ navigation, route }: Props) {
  const { getToken } = useClerkAuth();
  const routineId = route.params?.routineId;
  const isNew = !routineId;

  const [loading, setLoading] = useState(!isNew);
  const [title, setTitle] = useState('');
  const [schedule, setSchedule] = useState<string[]>(['Lun', 'Mié', 'Vie']);
  const [exercises, setExercises] = useState<LocalExercise[]>([]);

  useEffect(() => {
    if (!routineId) return;
    (async () => {
      const token = await getToken();
      if (!token) return;
      const { routine, exercises: exs } = await getRoutineWithExercises(token, routineId);
      if (routine) {
        setTitle(routine.title);
        const days: string[] = JSON.parse(routine.schedule_days ?? '[]');
        setSchedule(days);
      }
      setExercises(
        exs.map((ex, i) => ({
          id: i + 1,
          name: ex.name,
          muscle: ex.muscle,
          equipment: JSON.parse(ex.equipment ?? '[]'),
          restSeconds: ex.rest_seconds ?? 90,
          rows: ex.rows.map((r, j) => ({ id: j + 1, sets: r.sets, reps: r.reps, weight: r.weight, nivel: r.nivel_anillas ?? '' })),
        }))
      );
      setLoading(false);
    })();
  }, [routineId]);

  const toggleDay = (day: string) =>
    setSchedule((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const addExercise = () =>
    setExercises((prev) => [
      ...prev,
      { id: Date.now(), name: '', muscle: '', equipment: [], restSeconds: 90, rows: [{ id: Date.now() + 1, sets: '3', reps: '10', weight: '0', nivel: '' }] },
    ]);

  const removeExercise = (id: number) =>
    Alert.alert('Eliminar ejercicio', '¿Eliminar este ejercicio?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setExercises((p) => p.filter((e) => e.id !== id)) },
    ]);

  const updateName = (id: number, name: string) =>
    setExercises((p) => p.map((e) => (e.id === id ? { ...e, name } : e)));

  const updateRest = (id: number, restSeconds: number) =>
    setExercises((p) => p.map((e) => (e.id === id ? { ...e, restSeconds } : e)));

  const toggleEquipment = (exerciseId: number, key: string) =>
    setExercises((p) =>
      p.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const has = ex.equipment.includes(key);
        return { ...ex, equipment: has ? ex.equipment.filter((e) => e !== key) : [...ex.equipment, key] };
      })
    );

  const addSetRow = (exerciseId: number) =>
    setExercises((p) =>
      p.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, rows: [...ex.rows, { id: Date.now(), sets: '3', reps: '10', weight: '0', nivel: '' }] }
          : ex
      )
    );

  const removeSetRow = (exerciseId: number, rowId: number) =>
    setExercises((p) =>
      p.map((ex) =>
        ex.id === exerciseId ? { ...ex, rows: ex.rows.filter((r) => r.id !== rowId) } : ex
      )
    );

  const updateSetRow = (
    exerciseId: number, rowId: number,
    field: 'sets' | 'reps' | 'weight' | 'nivel', value: string
  ) =>
    setExercises((p) =>
      p.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, rows: ex.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)) }
          : ex
      )
    );

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Dashboard');
  };

  const handleDelete = () =>
    Alert.alert('Eliminar Rutina', '¿Eliminar esta rutina?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          const token = await getToken();
          if (routineId && token) await deleteRoutine(token, routineId);
          goBack();
        },
      },
    ]);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert('Nombre requerido', 'Por favor ingresa un nombre para la rutina.');
      return;
    }
    const token = await getToken();
    if (!token) return;
    await saveRoutine(token, {
      id: routineId,
      title: trimmed,
      subtitle: '',
      tags: [],
      scheduleDays: schedule,
      exercises: exercises.map((ex) => ({
        name: ex.name,
        muscle: ex.muscle,
        equipment: ex.equipment,
        rest_seconds: ex.restSeconds,
        rows: ex.rows.map((r) => ({ sets: r.sets, reps: r.reps, weight: r.weight, nivel: r.nivel })),
      })),
    });
    goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.topBarBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{isNew ? 'Nueva Rutina' : 'Editar Rutina'}</Text>
          {!isNew ? (
            <TouchableOpacity onPress={handleDelete} style={styles.topBarBtn}>
              <Ionicons name="trash-outline" size={22} color={Colors.status.danger} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 30 }} />
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Nombre de la Rutina</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Empuje Avanzado"
              placeholderTextColor={Colors.text.secondary}
              autoCorrect={false}
            />
          </View>

          {/* Schedule */}
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
              <Ionicons name="calendar-outline" size={16} color={Colors.text.secondary} />
              <Text style={styles.scheduleTitle}>Horario Semanal</Text>
            </View>
            <View style={styles.daysRow}>
              {DAYS.map((day) => {
                const active = schedule.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, active && styles.dayButtonActive]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Exercises */}
          <View style={styles.exercisesHeader}>
            <Text style={styles.exercisesTitle}>Ejercicios</Text>
            <Text style={styles.exercisesCount}>{exercises.length} ejercicios</Text>
          </View>

          {exercises.length === 0 && (
            <View style={styles.emptyExercises}>
              <Ionicons name="barbell-outline" size={32} color={Colors.background.border} />
              <Text style={styles.emptyText}>Sin ejercicios aún.</Text>
              <TouchableOpacity onPress={addExercise}>
                <Text style={styles.emptyLink}>Agregar el primero</Text>
              </TouchableOpacity>
            </View>
          )}

          {exercises.map((exercise) => {
            const isDuration = equipmentHasDuration(exercise.equipment);
            const showWeight = equipmentHasWeight(exercise.equipment);
            const weightLabel = weightColumnLabel(exercise.equipment);
            const extraField = !isDuration ? getExtraField(exercise.equipment) : null;
            return (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseIconBox}>
                    <Ionicons name="barbell-outline" size={18} color={Colors.primary} />
                  </View>
                  <View style={styles.exerciseNameBlock}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      value={exercise.name}
                      onChangeText={(v) => updateName(exercise.id, v)}
                      placeholder="Nombre del ejercicio"
                      placeholderTextColor={Colors.text.secondary}
                      autoCorrect={false}
                    />
                  </View>
                  <TouchableOpacity onPress={() => removeExercise(exercise.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="trash-outline" size={20} color={Colors.status.danger} />
                  </TouchableOpacity>
                </View>

                <View style={styles.equipmentSection}>
                  <Text style={styles.equipmentLabel}>Equipamiento</Text>
                  <View style={styles.equipmentChips}>
                    {EQUIPMENT_TYPES.map((eq) => {
                      const selected = exercise.equipment.includes(eq.key);
                      return (
                        <TouchableOpacity
                          key={eq.key}
                          style={[styles.equipChip, selected && styles.equipChipSelected]}
                          onPress={() => toggleEquipment(exercise.id, eq.key)}
                          activeOpacity={0.75}
                        >
                          <Ionicons name={eq.icon as any} size={13} color={selected ? '#fff' : Colors.text.secondary} />
                          <Text style={[styles.equipChipText, selected && styles.equipChipTextSelected]}>{eq.label}</Text>
                          {eq.hasWeight && selected && <View style={styles.weightDot} />}
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {(showWeight || extraField) && (
                    <View style={styles.indicatorRow}>
                      <Ionicons name="information-circle-outline" size={13} color={Colors.primary} />
                      <Text style={styles.indicatorText}>
                        {showWeight && (<>Indica <Text style={styles.indicatorBold}>{weightLabel}</Text></>)}
                        {showWeight && extraField ? ' + ' : ''}
                        {extraField && (
                          <><Text style={styles.indicatorBold}>{extraField.label}</Text>
                          <Text style={{ color: Colors.text.secondary }}> ({extraField.min}–{extraField.max})</Text></>
                        )}
                        <Text style={{ color: Colors.text.secondary }}> por serie</Text>
                      </Text>
                    </View>
                  )}
                </View>

                {/* Rest time picker */}
                <View style={styles.restRow}>
                  <Ionicons name="timer-outline" size={13} color={Colors.text.secondary} />
                  <Text style={styles.restLabel}>Descanso:</Text>
                  <TextInput
                    style={styles.restInput}
                    value={String(Math.floor(exercise.restSeconds / 60))}
                    onChangeText={(v) => {
                      const mins = Math.max(0, parseInt(v) || 0);
                      const secs = exercise.restSeconds % 60;
                      updateRest(exercise.id, mins * 60 + secs);
                    }}
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.restUnit}>min</Text>
                  <TextInput
                    style={styles.restInput}
                    value={String(exercise.restSeconds % 60).padStart(2, '0')}
                    onChangeText={(v) => {
                      const secs = Math.min(59, Math.max(0, parseInt(v) || 0));
                      const mins = Math.floor(exercise.restSeconds / 60);
                      updateRest(exercise.id, mins * 60 + secs);
                    }}
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <Text style={styles.restUnit}>seg</Text>
                </View>

                {exercise.rows.length > 0 && (
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.colSets]}>Series</Text>
                    {isDuration && <Text style={[styles.tableHeaderText, styles.colReps]}>Seg.</Text>}
                    {!isDuration && <Text style={[styles.tableHeaderText, styles.colReps]}>Reps</Text>}
                    {showWeight && <Text style={[styles.tableHeaderText, styles.colWeight]}>{weightLabel}</Text>}
                    {extraField && <Text style={[styles.tableHeaderText, styles.colNivel]}>{extraField.shortLabel}</Text>}
                    <View style={styles.colAction} />
                  </View>
                )}

                {exercise.rows.map((row) => (
                  <View key={row.id} style={styles.tableRow}>
                    <TextInput style={[styles.tableInput, styles.colSets]} value={row.sets} onChangeText={(v) => updateSetRow(exercise.id, row.id, 'sets', v)} keyboardType="numeric" selectTextOnFocus />
                    <TextInput style={[styles.tableInput, styles.colReps]} value={row.reps} onChangeText={(v) => updateSetRow(exercise.id, row.id, 'reps', v)} keyboardType="numeric" selectTextOnFocus placeholder={isDuration ? 'seg' : ''} placeholderTextColor={Colors.text.secondary} />
                    {showWeight && <TextInput style={[styles.tableInput, styles.colWeight]} value={row.weight} onChangeText={(v) => updateSetRow(exercise.id, row.id, 'weight', v)} keyboardType="numeric" selectTextOnFocus />}
                    {extraField && (
                      <View style={styles.colNivel}>
                        <TextInput style={[styles.tableInput, { flex: 1 }]} value={row.nivel} onChangeText={(v) => updateSetRow(exercise.id, row.id, 'nivel', v)} keyboardType="number-pad" placeholder={`${extraField.min}-${extraField.max}`} placeholderTextColor={Colors.text.secondary} selectTextOnFocus />
                      </View>
                    )}
                    <TouchableOpacity style={styles.colAction} onPress={() => removeSetRow(exercise.id, row.id)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Ionicons name="close" size={16} color={Colors.text.secondary} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addVariationButton} onPress={() => addSetRow(exercise.id)}>
                  <Ionicons name="add" size={14} color={Colors.primary} />
                  <Text style={styles.addVariationText}>Agregar variación / drop set</Text>
                </TouchableOpacity>
              </View>
            );
          })}

          <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise} activeOpacity={0.8}>
            <View style={styles.addExerciseIcon}>
              <Ionicons name="add" size={22} color={Colors.text.secondary} />
            </View>
            <Text style={styles.addExerciseText}>Agregar Ejercicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar Rutina</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.dark },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.background.border },
  topBarBtn: { padding: 4 },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  section: { gap: 6 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  titleInput: { fontSize: 24, fontWeight: '900', color: Colors.text.primary, borderBottomWidth: 2, borderBottomColor: Colors.background.border, paddingBottom: 8, paddingHorizontal: 0 },
  scheduleCard: { backgroundColor: Colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, padding: 14, gap: 12 },
  scheduleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scheduleTitle: { fontSize: 12, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  daysRow: { flexDirection: 'row', gap: 6 },
  dayButton: { flex: 1, height: 40, borderRadius: 8, backgroundColor: Colors.background.deep, alignItems: 'center', justifyContent: 'center' },
  dayButtonActive: { backgroundColor: Colors.primary },
  dayText: { fontSize: 11, fontWeight: '600', color: Colors.text.secondary },
  dayTextActive: { color: '#fff' },
  exercisesHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  exercisesTitle: { fontSize: 18, fontWeight: '800', color: Colors.text.primary },
  exercisesCount: { fontSize: 13, color: Colors.text.secondary },
  emptyExercises: { alignItems: 'center', padding: 32, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.background.border, gap: 8 },
  emptyText: { color: Colors.text.secondary, fontSize: 14 },
  emptyLink: { color: Colors.primary, fontWeight: '700', fontSize: 14 },
  exerciseCard: { backgroundColor: Colors.background.card, borderRadius: 12, borderWidth: 1, borderColor: Colors.background.border, overflow: 'hidden' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.background.deep, borderBottomWidth: 1, borderBottomColor: Colors.background.border },
  exerciseIconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.primary + '22', alignItems: 'center', justifyContent: 'center' },
  exerciseNameBlock: { flex: 1 },
  exerciseNameInput: { color: Colors.text.primary, fontWeight: '700', fontSize: 15, padding: 0 },
  equipmentSection: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, gap: 8 },
  equipmentLabel: { fontSize: 10, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  equipmentChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  equipChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.background.border, backgroundColor: Colors.background.deep },
  equipChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  equipChipText: { fontSize: 12, fontWeight: '600', color: Colors.text.secondary },
  equipChipTextSelected: { color: '#fff' },
  weightDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', opacity: 0.7 },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingBottom: 4 },
  indicatorText: { fontSize: 12, color: Colors.text.secondary },
  indicatorBold: { color: Colors.primary, fontWeight: '700' },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingBottom: 10 },
  restLabel: { fontSize: 11, fontWeight: '600', color: Colors.text.secondary, marginRight: 2 },
  restInput: { width: 44, height: 34, backgroundColor: Colors.background.deep, borderWidth: 1, borderColor: Colors.background.border, borderRadius: 8, textAlign: 'center', fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  restUnit: { fontSize: 11, fontWeight: '600', color: Colors.text.secondary },
  tableHeader: { flexDirection: 'row', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4, borderTopWidth: 1, borderTopColor: Colors.background.border },
  tableHeaderText: { fontSize: 10, fontWeight: '700', color: Colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  tableRow: { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 6, alignItems: 'center', gap: 8 },
  tableInput: { backgroundColor: Colors.background.deep, color: Colors.text.primary, borderWidth: 1, borderColor: Colors.background.border, borderRadius: 8, height: 40, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  colSets: { flex: 1 }, colReps: { flex: 1 }, colWeight: { flex: 1.2 }, colNivel: { flex: 1 },
  colAction: { width: 28, alignItems: 'center', justifyContent: 'center' },
  addVariationButton: { flexDirection: 'row', alignItems: 'center', gap: 4, margin: 14, marginTop: 8, alignSelf: 'flex-start' },
  addVariationText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  addExerciseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.background.border, paddingVertical: 16 },
  addExerciseIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.background.border, alignItems: 'center', justifyContent: 'center' },
  addExerciseText: { fontSize: 15, fontWeight: '700', color: Colors.text.secondary },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, borderRadius: 12, height: 52, marginTop: 8 },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
