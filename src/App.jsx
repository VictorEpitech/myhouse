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
import { getStoredResults, syncStudentResultFromDB } from './utils/storage';

function MainContent() {
  const [currentView, setCurrentView] = useState('home'); // 'home' | 'quiz' | 'houses' | 'admin'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [revealResult, setRevealResult] = useState(null);
  const [selectedHouseId, setSelectedHouseId] = useState(1);
  const [userRevealedHouse, setUserRevealedHouse] = useState(null);
  const [userQuizResult, setUserQuizResult] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  // Authoritative server DB synchronization for current user
  useEffect(() => {
    let active = true;
    if (currentUser?.email) {
      syncStudentResultFromDB(currentUser.email).then(res => {
        if (!active) return;
        setUserQuizResult(res || null);
      }).catch(() => {});
    } else {
      setUserQuizResult(null);
    }
    return () => { active = false; };
  }, [currentUser?.email]);

  // Listen for admin/self reset events to immediately update entire UI
  useEffect(() => {
    const handleReset = (e) => {
      const email = e.detail?.email;
      if (currentUser?.email) {
        const clean = currentUser.email.toLowerCase().trim();
        const resetEmail = (email || '').toLowerCase().trim();
        if (!resetEmail || resetEmail === clean || resetEmail === clean.replace('1.', '.') || resetEmail === clean.replace('.', '1.')) {
          setUserQuizResult(null);
          setUserRevealedHouse(null);
          setRevealResult(null);
        }
      }
    };
    window.addEventListener('codex_result_reset', handleReset);
    return () => window.removeEventListener('codex_result_reset', handleReset);
  }, [currentUser?.email]);

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
    setRevealResult({
      officialHouse: house,
      scores: userQuizResult?.scores || null,
      correctCount: userQuizResult?.correctCount,
      totalTechnicalQuestions: userQuizResult?.totalTechnicalQuestions
    });
  };

  const handleQuizComplete = (result) => {
    setUserRevealedHouse(result.officialHouse);
    setUserQuizResult(result);
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
        hasCompletedQuiz={!!userQuizResult}
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
              hasCompletedQuiz={!!userQuizResult}
              quizResult={userQuizResult}
            />
            <CodexLinkSection />
          </>
        )}

        {currentView === 'quiz' && (
          <TechQuiz 
            onComplete={handleQuizComplete} 
            existingResult={userQuizResult}
            onReset={() => {
              setUserQuizResult(null);
              setUserRevealedHouse(null);
              setRevealResult(null);
            }}
          />
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
