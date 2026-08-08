import React, { useState } from 'react';
import { AuthProvider, useAuth } from './lib/firebase/authContext';
import { EmergencyProvider } from './context/EmergencyContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { VisualCoreSection } from './components/VisualCoreSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { Footer } from './components/Footer';
import { SystemModal } from './components/SystemModal';
import { LoginPage } from './app/auth/LoginPage';
import { SignupPage } from './app/auth/SignupPage';
import { DashboardPage } from './app/dashboard/DashboardPage';

function MainApp() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const { isAuthenticated, isDevAuth, loading } = useAuth();

  const handleEnterSystem = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  };


  // If user navigated to dashboard while logged out, show login
  if (currentView === 'dashboard' && !loading && !isAuthenticated) {
    return (
      <LoginPage
        onNavigateToSignup={() => setCurrentView('signup')}
        onNavigateToLanding={() => setCurrentView('landing')}
        onLoginSuccess={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onNavigateToSignup={() => setCurrentView('signup')}
        onNavigateToLanding={() => setCurrentView('landing')}
        onLoginSuccess={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={() => setCurrentView('login')}
        onNavigateToLanding={() => setCurrentView('landing')}
        onSignupSuccess={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'dashboard') {
    return <DashboardPage onNavigateToLanding={() => setCurrentView('landing')} />;
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] flex flex-col font-sans selection:bg-[#423F4F] selection:text-[#F3F3F3]">
      {/* Top Navbar */}
      <Navbar
        onOpenSystemModal={handleEnterSystem}
        onNavigateToLogin={() => {
          if (isAuthenticated) setCurrentView('dashboard');
          else setCurrentView('login');
        }}
        onNavigateToSignup={() => {
          if (isAuthenticated) setCurrentView('dashboard');
          else setCurrentView('signup');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        {/* SECTION 1: HERO */}
        <HeroSection onOpenSystemModal={handleEnterSystem} />

        {/* SECTION 2: VISUAL CORE */}
        <VisualCoreSection />

        {/* SECTION 3: HOW LATTICE WORKS */}
        <HowItWorksSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* System Modal */}
      <SystemModal
        isOpen={isSystemModalOpen}
        onClose={() => setIsSystemModalOpen(false)}
        onEnterSystem={handleEnterSystem}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <MainApp />
      </EmergencyProvider>
    </AuthProvider>
  );
}

