# PRD — CaliSheet: App de Seguimiento de Calistenia
**Versión:** 1.0
**Fecha:** 2026-02-18
**Estado:** En desarrollo (conversión Web → React Native)

---

## 1. Resumen del Producto

CaliSheet es una aplicación móvil de seguimiento de entrenamiento enfocada en **calistenia**, diseñada para atletas que combinan ejercicios de peso corporal con lastre, mancuernas y anillas. La app permite registrar rutinas, ejecutar sesiones de entrenamiento en tiempo real y analizar el progreso histórico por ejercicio.

**Propósito:** Ser la herramienta de referencia para atletas de calistenia que quieren gestionar y medir su progreso de forma estructurada, desde ejercicios básicos hasta habilidades avanzadas y trabajo con peso añadido.

**Plataforma objetivo:** iOS y Android mediante **React Native + Expo Go**.

---

## 2. Estado Actual

### 2.1 Tecnología existente (Web)
| Elemento | Tecnología actual |
|---|---|
| Framework | React 19 + TypeScript |
| Build tool | Vite 6 |
| Estilos | Tailwind CSS (CDN) |
| Iconos | Lucide React |
| Gráficos | Recharts |
| Navegación | Estado personalizado (enum `View`) |
| Backend | Ninguno (datos mock en componentes) |
| Persistencia | Ninguna |

### 2.2 Vistas actuales
1. **LoginView** — Autenticación (email/password, SSO Google/Apple)
2. **DashboardView** — Listado de rutinas con búsqueda y filtros
3. **RoutineDetailView** — Creación y edición de rutinas
4. **ActiveWorkoutView** — Sesión de entrenamiento en vivo
5. **ExerciseHistoryView** — Historial y analíticas por ejercicio

### 2.3 Datos mock actuales
- 4 rutinas de ejemplo: Empuje Avanzado, Tirón con Lastre, Skill Front Lever, Legs & Mobility
- 3 entradas históricas de ejercicio
- 6 meses de datos de progresión de volumen (gráfico)

---

## 3. Propuesta de Conversión a React Native

### 3.1 Stack tecnológico objetivo

| Elemento | Tecnología propuesta | Justificación |
|---|---|---|
| Framework | React Native + Expo SDK 52+ | Multiplataforma, iteración rápida con Expo Go |
| Navegación | React Navigation v7 (Stack + Bottom Tabs) | Estándar de la industria en RN |
| Estilos | NativeWind v4 (Tailwind para RN) o StyleSheet nativo | Mantener familiaridad con Tailwind |
| Iconos | `@expo/vector-icons` (Ionicons/MaterialIcons) | Paquete nativo incluido con Expo |
| Gráficos | `react-native-gifted-charts` o `victory-native` | Alternativa nativa a Recharts |
| Estado local | Zustand o React Context + useReducer | Ligero, sin overhead de Redux |
| Persistencia | AsyncStorage + MMKV | MMKV para datos frecuentes; AsyncStorage para configuración |
| Formularios | React Hook Form | Gestión eficiente de inputs en tiempo real |
| Tipado | TypeScript (igual que actualmente) | Mantener types.ts existente |

### 3.2 Estructura de directorios objetivo

```
app_calisheet_rn/
├── app/                          (Expo Router o navegación custom)
│   ├── (auth)/
│   │   └── login.tsx
│   └── (main)/
│       ├── _layout.tsx           (Bottom tab navigator)
│       ├── dashboard.tsx
│       ├── routine/
│       │   ├── [id].tsx          (Detalle de rutina)
│       │   └── new.tsx
│       ├── workout/
│       │   └── [routineId].tsx   (Sesión activa)
│       └── history/
│           └── [exerciseId].tsx
├── components/
│   ├── ui/                       (Componentes base reutilizables)
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   └── Timer.tsx
│   ├── routine/
│   │   ├── RoutineCard.tsx
│   │   └── ExerciseRow.tsx
│   ├── workout/
│   │   ├── SetRow.tsx
│   │   ├── RestTimer.tsx
│   │   └── ExerciseNavigator.tsx
│   └── history/
│       ├── VolumeChart.tsx
│       └── SessionRow.tsx
├── store/
│   ├── routinesStore.ts
│   ├── workoutStore.ts
│   └── historyStore.ts
├── types.ts                      (Migrar y ampliar desde versión web)
├── constants/
│   ├── colors.ts                 (Design tokens)
│   └── exercises.ts              (Base de datos de ejercicios)
└── utils/
    ├── calculations.ts           (1RM, volumen, etc.)
    └── dateHelpers.ts
```

---

## 4. Pantallas y Requisitos Funcionales

### 4.1 Pantalla de Login

**Objetivo:** Autenticar al usuario antes de acceder a la app.

**Elementos UI:**
- Campo de email y contraseña
- Botón "Iniciar sesión"
- Acceso con Google y Apple (OAuth)
- Links: "¿No tienes cuenta? Regístrate" / "Olvidé mi contraseña"

**Comportamiento:**
- Validación de campos en tiempo real
- Mensaje de error en credenciales inválidas
- Navegación al Dashboard tras login exitoso
- Persistencia de sesión con token en AsyncStorage

**Notas RN:**
- Usar `KeyboardAvoidingView` para no tapar inputs con teclado
- `SecureTextEntry` para campo de contraseña

---

### 4.2 Dashboard — Mis Rutinas

**Objetivo:** Vista principal de acceso rápido a rutinas.

**Elementos UI:**
- Header con logo y avatar de usuario
- Barra de búsqueda con filtros de equipamiento:
  - Anillas | Barra | Paralelas | Lastre | Todos
- Lista de tarjetas de rutinas (FlatList)
- FAB (Floating Action Button) para crear nueva rutina
- Cada tarjeta muestra:
  - Imagen/thumbnail de la rutina
  - Nombre y subtítulo
  - Tags de equipamiento (chips de colores)
  - Nº de ejercicios
  - Última sesión / racha / % completado
  - Botones: "Iniciar" y "Ver detalles"

**Comportamiento:**
- Filtro multi-selección por tipo de equipamiento
- Búsqueda en tiempo real por nombre de rutina
- Navegar a RoutineDetail al pulsar "Ver detalles"
- Navegar a ActiveWorkout al pulsar "Iniciar"
- Pull-to-refresh para actualizar datos

**Filtros de equipamiento:**
- `Anillas` — ejercicios en rings
- `Barra` — pull-up bar, barra fija
- `Paralelas` — dips en paralelas, handstand
- `Lastre` — weight belt, chaleco, mancuernas
- `Corporal` — bodyweight puro

---

### 4.3 Detalle de Rutina (Crear / Editar)

**Objetivo:** Configurar una rutina con sus ejercicios, series y parámetros.

**Elementos UI:**
- Nombre de rutina editable (tap-to-edit inline)
- Selector de días de la semana (Lun–Dom, multi-selección)
- Lista de ejercicios con:
  - Nombre del ejercicio (dropdown/búsqueda)
  - Tabla de series: Tipo (calentamiento/trabajo/drop) | Reps | Peso | RPE
  - Botón para agregar serie
  - Botón para agregar variación / drop set
  - Swipe-to-delete en filas de series
- Tags de equipamiento y grupo muscular (auto-generados del ejercicio)
- Botones: Guardar | Eliminar rutina

**Comportamiento:**
- Crear nueva rutina desde cero
- Editar rutina existente (cargar datos previos)
- Agregar ejercicios desde catálogo o buscando por nombre
- Reordenar ejercicios con drag-and-drop (`DraggableFlatList`)
- Confirmación antes de eliminar rutina
- Auto-guardar borrador en AsyncStorage

**Tipos de series soportadas:**
| Tipo | Abreviatura | Color |
|---|---|---|
| Calentamiento | W | Amarillo |
| Serie de trabajo | S | Azul |
| Drop Set | D | Naranja |
| AMRAP | A | Verde |

---

### 4.4 Sesión de Entrenamiento Activa

**Objetivo:** Registrar el entrenamiento en tiempo real, serie a serie.

**Elementos UI:**
- Barra de progreso superior (ejercicio X de N)
- Nombre del ejercicio actual + tags (músculo, movimiento, equipo)
- Imagen referencial del ejercicio
- Panel de datos del ejercicio:
  - RM Personal
  - Último peso/reps (sesión anterior)
  - Tip de técnica (expandible)
- Tabla de series activas:
  - Columnas: # | Peso (kg) | Reps | RPE | Estado
  - Serie activa: inputs editables con teclado numérico
  - Serie completada: fila verde con check
  - Serie pendiente: fila gris, sin input
- Timer de descanso:
  - Se activa al completar una serie
  - Configurable (default 90 seg)
  - Vibración al llegar a 0
  - Skip disponible
- Botones de navegación: Anterior | Siguiente ejercicio
- Botón "Finalizar Entrenamiento"

**Comportamiento:**
- Al completar serie: marcar como completa + iniciar timer
- Timer con alerta en background (usando `expo-notifications`)
- Permite editar peso/reps de series ya completadas
- Al completar todos los ejercicios: pantalla de resumen
- Si se abandona la sesión: guardar progreso parcial con confirmación
- Guardar sesión en historial al finalizar

**Pantalla de Resumen Post-Entrenamiento:**
- Duración total de la sesión
- Volumen total levantado (kg)
- Ejercicios completados vs omitidos
- Nuevos PBs alcanzados (destacados)
- Botón: "Volver al Dashboard"

---

### 4.5 Historial y Analíticas de Ejercicios

**Objetivo:** Revisar el progreso histórico por ejercicio con métricas y gráficos.

**Elementos UI:**
- Panel lateral (tab) con lista de ejercicios agrupados:
  - "Movimientos de Tirón" (Pull-up, Muscle-up, etc.)
  - "Movimientos de Empuje" (Dips, HSPush-up, etc.)
  - "Habilidades" (Front Lever, Planche, etc.)
- Vista principal del ejercicio seleccionado:
  - Nombre + badge de tipo (Tirón / Empuje / Habilidad)
  - Descripción del movimiento
  - 4 tarjetas de métricas:
    - Máx. Reps
    - Máx. Lastre (peso añadido)
    - Total Sesiones
    - RM Estimado
  - Gráfico de progresión de volumen (últimos 3–12 meses)
  - Tabla de historial:
    - Columnas: Fecha | Rutina | Series×Reps | Lastre | Equipo | Notas
    - Ordenación: Más reciente / Más antiguo / Mayor peso

**Comportamiento:**
- Filtrar ejercicios por búsqueda de texto
- Cambiar rango del gráfico: 1M | 3M | 6M | 1A
- Añadir nota a una sesión histórica
- Ver detalles completos de una sesión pasada
- Exportar datos del ejercicio (CSV / compartir)

---

### 4.6 Pantalla de Perfil / Configuración (Nueva — no existe en web)

**Objetivo:** Gestionar la cuenta del usuario y preferencias de la app.

**Elementos UI:**
- Avatar + nombre + email del usuario
- Estadísticas globales:
  - Total sesiones | Racha actual | Volumen total histórico
- Secciones de configuración:
  - Unidades de peso: kg / lb
  - Timer de descanso por defecto
  - Notificaciones
  - Tema: Oscuro / Claro / Sistema
- Links: Términos de uso, Política de privacidad
- Botón "Cerrar sesión"

---

## 5. Navegación

### 5.1 Estructura de navegación

```
Stack Principal
├── Login (pantalla sin tabs)
└── App (con Bottom Tabs)
    ├── Tab 1: Dashboard (ícono: home)
    ├── Tab 2: Historial (ícono: chart)
    └── Tab 3: Perfil (ícono: person)

    Modales / Stacks anidados:
    ├── Nuevo/Editar Rutina (modal desde Dashboard)
    └── Sesión Activa (modal fullscreen desde Dashboard)
```

### 5.2 Flujo de navegación principal

```
Login
  └─→ Dashboard
        ├─→ RoutineDetail (tap "Ver detalles")
        │     └─→ Dashboard (guardar/cancelar)
        └─→ ActiveWorkout (tap "Iniciar")
              └─→ WorkoutSummary
                    └─→ Dashboard

Dashboard (tab)
Historial (tab) → ExerciseHistory
Perfil (tab) → ProfileSettings
```

---

## 6. Modelo de Datos

### 6.1 Tipos TypeScript (evolución de types.ts)

```typescript
// --- Enums ---
enum MovementType {
  PULL = 'pull',
  PUSH = 'push',
  SKILL = 'skill',
  LEGS = 'legs',
  CORE = 'core',
}

enum Equipment {
  RINGS = 'rings',
  BAR = 'bar',
  PARALLETTES = 'parallettes',
  WEIGHTED = 'weighted', // lastre/weight belt
  DUMBBELLS = 'dumbbells',
  BODYWEIGHT = 'bodyweight',
}

enum SetType {
  WARMUP = 'warmup',
  WORKING = 'working',
  DROP = 'drop',
  AMRAP = 'amrap',
}

enum SetStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

// --- Core Interfaces ---
interface ExerciseCatalog {
  id: string;
  name: string;
  nameEs: string;             // Nombre en español
  movementType: MovementType;
  equipment: Equipment[];
  muscleGroups: string[];
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  progression?: string[];     // Array de progresiones del ejercicio
}

interface ExerciseSet {
  id: string;
  type: SetType;
  weight: number;             // kg (0 = peso corporal)
  reps: number;
  rpe?: number;               // 1-10
  status: SetStatus;
  notes?: string;
  previous?: {
    weight: number;
    reps: number;
    date: string;
  };
}

interface RoutineExercise {
  id: string;
  catalogId: string;          // Referencia a ExerciseCatalog
  name: string;               // Copia local del nombre
  order: number;
  sets: ExerciseSet[];
  restSeconds: number;        // Tiempo de descanso configurado
  notes?: string;
}

interface Routine {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  scheduleDays: number[];     // 0=Lun ... 6=Dom
  exercises: RoutineExercise[];
  equipment: Equipment[];
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
}

interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  startedAt: string;
  finishedAt?: string;
  durationSeconds?: number;
  totalVolumeKg: number;
  exercises: CompletedExercise[];
  notes?: string;
  isPartial: boolean;         // Si se abandonó antes de completar
}

interface CompletedExercise {
  catalogId: string;
  name: string;
  sets: CompletedSet[];
}

interface CompletedSet {
  type: SetType;
  weight: number;
  reps: number;
  rpe?: number;
  completedAt: string;
}

interface PersonalRecord {
  exerciseId: string;
  maxReps: number;
  maxWeight: number;
  estimated1RM: number;
  lastUpdated: string;
}

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  weightUnit: 'kg' | 'lb';
  defaultRestSeconds: number;
  theme: 'dark' | 'light' | 'system';
  createdAt: string;
}
```

---

## 7. Catálogo de Ejercicios Inicial

El catálogo inicial incluirá los siguientes ejercicios, agrupados por tipo:

### Movimientos de Tirón (Pull)
| Ejercicio | Equipo | Músculos |
|---|---|---|
| Dominadas | Barra | Dorsal, Bíceps |
| Dominadas con Lastre | Barra + Lastre | Dorsal, Bíceps |
| Muscle-up | Barra | Dorsal, Tríceps |
| Remo Australiano | Barra | Dorsal, Bíceps |
| Front Lever Hold | Barra | Core, Dorsal |
| Dominadas en Anillas | Anillas | Dorsal, Bíceps |

### Movimientos de Empuje (Push)
| Ejercicio | Equipo | Músculos |
|---|---|---|
| Fondos en Paralelas | Paralelas | Pecho, Tríceps |
| Fondos en Anillas | Anillas | Pecho, Tríceps |
| Fondos con Lastre | Paralelas + Lastre | Pecho, Tríceps |
| Flexiones en Pino | Suelo | Hombros, Tríceps |
| Push-up | Suelo | Pecho, Tríceps |
| Planche Lean | Paralelas | Hombros, Core |

### Habilidades (Skills)
| Ejercicio | Equipo | Músculos |
|---|---|---|
| Front Lever | Barra | Core, Dorsal |
| Back Lever | Anillas | Dorsal, Bíceps |
| Planche | Suelo | Hombros, Core |
| Human Flag | Barra | Lateral, Core |
| L-Sit | Paralelas | Core, Tríceps |
| Iron Cross | Anillas | Pecho, Hombros |

### Piernas y Movilidad
| Ejercicio | Equipo | Músculos |
|---|---|---|
| Sentadilla Pistol | Corporal | Cuádriceps, Glúteos |
| Peso Muerto | Mancuernas | Isquios, Glúteos |
| Estiramiento de Palomas | Suelo | Caderas |
| Dislocaciones de Hombro | Banda | Hombros |

---

## 8. Requisitos No Funcionales

### 8.1 Rendimiento
- Tiempo de inicio de la app: < 3 segundos
- Navegación entre pantallas: < 300ms
- FlatList de rutinas: virtualización habilitada, sin jank en scroll
- Timer de descanso: precisión de ±1 segundo

### 8.2 Offline-First
- La app debe funcionar completamente sin conexión a internet
- Todos los datos se guardan localmente en el dispositivo (AsyncStorage / MMKV)
- Sincronización con backend en background cuando hay conexión (fase futura)

### 8.3 Experiencia de usuario
- Soporte completo de dark mode (por defecto)
- Haptic feedback en acciones importantes (completar serie, iniciar timer)
- Manejo correcto del teclado en formularios (KeyboardAvoidingView)
- Soporte para pantallas con notch y home indicator (SafeAreaView)
- Orientación: solo portrait

### 8.4 Accesibilidad
- Tamaños de texto escalables (respeta configuración del sistema)
- Labels de accesibilidad en botones e inputs
- Contraste mínimo WCAG AA

### 8.5 Compatibilidad
- iOS: 15+
- Android: API 31+ (Android 12+)
- Probado en Expo Go durante desarrollo
- Build de producción vía EAS Build

---

## 9. Diseño Visual

### 9.1 Design Tokens (mantener de versión web)

```typescript
// constants/colors.ts
export const Colors = {
  primary: '#137fec',
  background: {
    dark: '#101922',
    card: '#1c2127',
    border: '#283039',
  },
  text: {
    primary: '#ffffff',
    secondary: '#9dabb9',
  },
  status: {
    success: '#10b981',
    warning: '#eab308',
    danger: '#ef4444',
    info: '#137fec',
  },
  set: {
    warmup: '#eab308',
    working: '#137fec',
    drop: '#f97316',
    amrap: '#10b981',
  },
};
```

### 9.2 Tipografía
- Font: Inter (via `expo-font` o Google Fonts)
- Escala: 12 / 14 / 16 / 18 / 20 / 24 / 28 / 32px

### 9.3 Componentes de UI Base (a crear)
- `Button` — variantes: primary / secondary / ghost / danger
- `Card` — contenedor con fondo card y borde sutil
- `Input` — campo de texto con label y error
- `Badge` — chips de equipamiento y tipo de movimiento
- `ProgressBar` — barra de progreso de sesión
- `TimerRing` — display circular del timer de descanso

---

## 10. Plan de Implementación (Fases)

### Fase 1 — Scaffolding y Conversión Base
- [ ] Inicializar proyecto Expo con TypeScript
- [ ] Configurar React Navigation (Stack + Bottom Tabs)
- [ ] Migrar `types.ts` con ampliaciones
- [ ] Implementar design tokens y componentes UI base
- [ ] Convertir `LoginView` a RN (sin backend real aún)
- [ ] Convertir `DashboardView` a RN con datos mock

### Fase 2 — Gestión de Rutinas
- [ ] Convertir `RoutineDetailView` a RN
- [ ] Implementar store de rutinas (Zustand + AsyncStorage)
- [ ] Catálogo de ejercicios (datos locales)
- [ ] CRUD completo de rutinas con persistencia
- [ ] Drag-and-drop de ejercicios en rutina

### Fase 3 — Sesión de Entrenamiento
- [ ] Convertir `ActiveWorkoutView` a RN
- [ ] Timer de descanso con notificaciones locales (`expo-notifications`)
- [ ] Haptic feedback (`expo-haptics`)
- [ ] Store de sesión activa
- [ ] Pantalla de resumen post-entrenamiento
- [ ] Guardado de sesión en historial

### Fase 4 — Historial y Analíticas
- [ ] Convertir `ExerciseHistoryView` a RN
- [ ] Integrar librería de gráficos nativa
- [ ] Cálculo de RM estimado y métricas
- [ ] Filtros y ordenación de historial
- [ ] Pantalla de Perfil y Configuración

### Fase 5 — Pulido y Producción
- [ ] Tests de UI con Detox o Maestro
- [ ] Optimizaciones de rendimiento
- [ ] Soporte completo de accesibilidad
- [ ] Build de producción con EAS Build
- [ ] Publicación en App Store y Google Play

---

## 11. Fuera de Scope (por ahora)

- Backend / API REST o GraphQL
- Sincronización en la nube entre dispositivos
- Planes de entrenamiento generados por IA
- Feed social o compartir rutinas
- Modo landscape / tablet
- Apple Watch / Wear OS
- Planes de nutrición
- Videos incrustados de ejercicios
- Integración con HealthKit / Google Fit

---

## 12. Preguntas Abiertas

| # | Pregunta | Impacto |
|---|---|---|
| 1 | ¿Se usará backend (Supabase, Firebase) en alguna fase? | Arquitectura de datos |
| 2 | ¿El catálogo de ejercicios será fijo o editable por el usuario? | Modelo de datos |
| 3 | ¿Se desea soporte de autenticación real desde la Fase 1? | Alcance de la Fase 1 |
| 4 | ¿NativeWind o StyleSheet nativo para estilos? | DX y mantenibilidad |
| 5 | ¿Se publicará en stores o solo uso personal vía Expo Go? | Build y distribución |

---

*Documento generado para guiar la conversión de CaliSheet de React Web a React Native con Expo Go.*
