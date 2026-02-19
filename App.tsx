import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import DashboardScreen from './screens/DashboardScreen';
import RoutineDetailScreen from './screens/RoutineDetailScreen';
import ActiveWorkoutScreen from './screens/ActiveWorkoutScreen';
import ExerciseHistoryScreen from './screens/ExerciseHistoryScreen';
import { Colors } from './constants/colors';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  EmailVerification: undefined;
  Main: undefined;
  RoutineDetail: { routineId?: number };
  ActiveWorkout: { routineId: number };
};

export type TabParamList = {
  Dashboard: undefined;
  History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background.card,
          borderTopColor: Colors.background.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.secondary,
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Dashboard' ? 'home-outline' : 'stats-chart-outline';
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Rutinas' }} />
      <Tab.Screen name="History" component={ExerciseHistoryScreen} options={{ tabBarLabel: 'Historial' }} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background.dark }}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}

function RootNavigator() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <LoadingScreen />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background.dark },
        animation: 'slide_from_right',
      }}
    >
      {isSignedIn ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="RoutineDetail" component={RoutineDetailScreen} />
          <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
