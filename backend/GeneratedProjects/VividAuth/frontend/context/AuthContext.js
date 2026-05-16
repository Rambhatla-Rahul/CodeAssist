'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiClient } from '../lib/api-client';

// Initial state for authentication context
const initialState = {
  isAuthenticated: false,
  userProfile: null,
  loading: true
};

// Action types
const ACTIONS = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function to handle state changes
function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.LOGIN:
      return {
        ...state,
        isAuthenticated: true,
        userProfile: action.payload.userProfile,
        loading: false
      };
    case ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        userProfile: null,
        loading: false
      };
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload.loading
      };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Auth Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on initial load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { loading: true } });
      const response = await apiClient.get('/auth/status');
      
      if (response.data.authenticated) {
        dispatch({ 
          type: ACTIONS.LOGIN, 
          payload: { userProfile: response.data.user } 
        });
      } else {
        dispatch({ type: ACTIONS.LOGOUT });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      dispatch({ type: ACTIONS.LOGOUT });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { loading: false } });
    }
  };

  const login = (userProfile) => {
    dispatch({ 
      type: ACTIONS.LOGIN, 
      payload: { userProfile } 
    });
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
      dispatch({ type: ACTIONS.LOGOUT });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if server request fails, clear client state
      dispatch({ type: ACTIONS.LOGOUT });
    }
  };

  const value = {
    ...state,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}