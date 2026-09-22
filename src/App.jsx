import React, { useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TechQuiz from './components/TechQuiz';
import HousesShowcase from './components/HousesShowcase';
import HouseRevealModal from './components/HouseRevealModal';
import AdminDashboard from './components/AdminDashboard';
import CodexLinkSection from './components/CodexLinkSection';
import Footer from './components/Footer';
import { getStoredResults } from './utils/storage';

function MainContent() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'quiz' | 'houses' | 'admin'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [revealResult, setRevealResult] = useState(null);
  const [selectedHouseId, setSelectedHouseId] = useState(1);
  const [userRevealedHouse, setUserRevealedHouse] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  const handleStartQuiz = () => {
    setCurrentView('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreHouses = (houseId = 1) => {
    setSelectedHouseId(houseId);
    setCurrentView('houses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDirectReveal = (user) => {
    const house = userRevealedHouse || user?.house;
    const stored = getStoredResults();
    const existing = user?.email ? stored[user.email.toLowerCase()] : null;

    setRevealResult({
      officialHouse: house,
      affinityHouse: house,
      scores: existing?.scores || null,
      correctCount: existing?.correctCount,
      totalTechnicalQuestions: existing?.totalTechnicalQuestions
    });
  };

  const handleQuizComplete = (result) => {
    setUserRevealedHouse(result.officialHouse);
    setRevealResult(result);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070a10] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        userRevealedHouse={userRevealedHouse}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection
              onStartQuiz={handleStartQuiz}
              onExploreHouses={handleExploreHouses}
              onDirectReveal={handleDirectReveal}
              userRevealedHouse={userRevealedHouse}
            />
            <CodexLinkSection />
          </>
        )}

        {currentView === 'quiz' && (
          <TechQuiz onComplete={handleQuizComplete} />
        )}

        {currentView === 'houses' && (
          <HousesShowcase initialHouseId={selectedHouseId} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(v) => { setCurrentView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />

      {/* Modals */}
      {revealResult && (
        <HouseRevealModal
          result={revealResult}
          onClose={() => setRevealResult(null)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
