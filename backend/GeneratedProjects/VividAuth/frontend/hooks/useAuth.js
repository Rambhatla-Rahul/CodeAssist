'use client';

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../lib/api-client';
import { AUTH_ENDPOINTS } from '../../constants/api_endpoints';

export const useAuth = () => {
  const { isAuthenticated, userProfile, loading, error, dispatch } = useContext(AuthContext);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.LOGIN, credentials);
      const { user } = response.data;
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'SIGNUP_REQUEST' });
    try {
      const response = await apiClient.post(AUTH_ENDPOINTS.SIGNUP, userData);
      const { user } = response.data;
      dispatch({ type: 'SIGNUP_SUCCESS', payload: { user } });
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Signup failed';
      dispatch({ type: 'SIGNUP_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
      dispatch({ type: 'LOGOUT' });
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Logout failed';
      return { success: false, error: errorMessage };
    }
  };

  return {
    isAuthenticated,
    userProfile,
    loading,
    error,
    login,
    signup,
    logout
  };
};