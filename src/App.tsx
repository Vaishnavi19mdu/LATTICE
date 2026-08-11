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
import { AdministratorDashboard } from './components/dashboard/Administrator';
import { EntrySystemCloud } from './components/EntrySystemCloud';

type AppView = 'landing' | 'login' | 'signup' | 'dashboard' | 'admin-dashboard';

function MainApp() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [isSystemModalOpen, setIsSystemModalOpen] = useState(false);
  const { isAuthenticated, loading, logout, profile } = useAuth();

  const isAdmin = profile?.role === 'administrator';
  const destinationView: AppView = isAdmin ? 'admin-dashboard' : 'dashboard';

  const handleEnterSystem = () => {
    if (isAuthenticated) {
      setCurrentView(destinationView);
    } else {
      setCurrentView('login');
    }
  };

  // If user navigated to a protected view while logged out, show login
  if ((currentView === 'dashboard' || currentView === 'admin-dashboard') && !loading && !isAuthenticated) {
    return (
      <LoginPage
        onNavigateToSignup={() => setCurrentView('signup')}
        onNavigateToLanding={() => setCurrentView('landing')}
        onLoginSuccess={() => setCurrentView(destinationView)}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onNavigateToSignup={() => setCurrentView('signup')}
        onNavigateToLanding={() => setCurrentView('landing')}
        onLoginSuccess={() => setCurrentView(destinationView)}
      />
    );
  }

  if (currentView === 'signup') {
    return (
      <SignupPage
        onNavigateToLogin={() => setCurrentView('login')}
        onNavigateToLanding={() => setCurrentView('landing')}
        onSignupSuccess={() => setCurrentView(destinationView)}
      />
    );
  }

  if (currentView === 'dashboard') {
    return <DashboardPage onNavigateToLanding={() => setCurrentView('landing')} />;
  }

  if (currentView === 'admin-dashboard') {
    return (
      <AdministratorDashboard
        onNavigateToLanding={() => setCurrentView('landing')}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-[#423F4F] flex flex-col font-sans selection:bg-[#423F4F] selection:text-[#F3F3F3]">
      {/* TEMPORARY: remove this line + the import above once done demoing */}
      <EntrySystemCloud />

      {/* Top Navbar */}
      <Navbar
        onOpenSystemModal={handleEnterSystem}
        onNavigateToLogin={() => {
          if (isAuthenticated) setCurrentView(destinationView);
          else setCurrentView('login');
        }}
        onNavigateToSignup={() => {
          if (isAuthenticated) setCurrentView(destinationView);
          else setCurrentView('signup');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        <HeroSection onOpenSystemModal={handleEnterSystem} />
        <VisualCoreSection />
        <HowItWorksSection />
      </main>

      <Footer />

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