"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from '../components/auth/AuthModal';
import { motion } from 'framer-motion';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated, isLoading]);

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {isAuthenticated ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Your Dashboard</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            You are successfully authenticated. This is where your application content would appear.
          </p>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Creative Authentication System</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            A high-fidelity authentication experience with smooth animations and seamless state transitions.
          </p>
          <button 
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-lg"
          >
            Open Authentication
          </button>
        </motion.div>
      )}
      
      <AuthModal isOpen={showAuthModal} onClose={handleCloseModal} />
    </main>
  );
}