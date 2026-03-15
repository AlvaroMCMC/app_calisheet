/**
 * Tests básicos para DashboardScreen.
 * Requiere: jest, @testing-library/react-native
 *   npx expo install -- --save-dev jest @testing-library/react-native @types/jest
 */
import React from 'react';
import { render, waitFor, screen } from '@testing-library/react-native';
import DashboardScreen from '../DashboardScreen';

// Mocks de dependencias externas
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ getToken: jest.fn().mockResolvedValue('test-token') }),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    userId: 'user_test',
    displayName: 'Test User',
    email: 'test@test.com',
    signOut: jest.fn(),
  }),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ push: jest.fn() }),
  useFocusEffect: (cb: () => void) => cb(),
}));

const mockRoutine = {
  id: 1,
  user_id: 'user_test',
  title: 'Rutina de Anillas',
  subtitle: '',
  tags: ['Anillas'],
  schedule_days: ['Lun', 'Mié'],
  last_performed: 'Nunca',
  completion_rate: null,
  streak: null,
  exercises_count: 5,
};

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra las rutinas cuando el fetch es exitoso', async () => {
    jest.mock('../../store/useRoutinesStore', () => ({
      useRoutinesStore: () => ({
        routines: [mockRoutine],
        loading: false,
        error: null,
        fetch: jest.fn(),
        invalidate: jest.fn(),
      }),
    }));

    render(<DashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText('Rutina de Anillas')).toBeTruthy();
    });
  });

  it('muestra mensaje de error cuando el fetch falla', async () => {
    jest.mock('../../store/useRoutinesStore', () => ({
      useRoutinesStore: () => ({
        routines: [],
        loading: false,
        error: 'Error de red',
        fetch: jest.fn(),
        invalidate: jest.fn(),
      }),
    }));

    render(<DashboardScreen />);
    await waitFor(() => {
      expect(screen.getByText(/Error de red/)).toBeTruthy();
    });
  });
});
