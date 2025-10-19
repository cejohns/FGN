import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import NewsPage from './components/NewsPage';
import ReviewsPage from './components/ReviewsPage';
import VideosPage from './components/VideosPage';
import GalleryPage from './components/GalleryPage';
import BlogPage from './components/BlogPage';
import GuidesPage from './components/GuidesPage';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAdminAuthenticated(true);
    }

    let keySequence = '';
    const secretCode = 'admin';
    let timeout: NodeJS.Timeout;

    const handleKeyPress = (e: KeyboardEvent) => {
      clearTimeout(timeout);
      keySequence += e.key.toLowerCase();

      timeout = setTimeout(() => {
        keySequence = '';
      }, 1000);

      if (keySequence.includes(secretCode)) {
        keySequence = '';
        setShowAdmin(true);
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(timeout);
    };
  }, []);

  const handleNavigate = (section: string, itemId?: string) => {
    setCurrentSection(section);
    setSelectedItemId(itemId);
    setShowAdmin(false);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedItemId(undefined);
  };

  const toggleAdmin = () => {
    if (showAdmin) {
      setShowAdmin(false);
    } else {
      if (!isAdminAuthenticated) {
        setIsAdminAuthenticated(false);
      }
      setShowAdmin(true);
    }
    setCurrentSection('home');
    setSelectedItemId(undefined);
    window.scrollTo(0, 0);
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('adminAuth');
    setIsAdminAuthenticated(false);
    setShowAdmin(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Header currentSection={currentSection} onNavigate={handleNavigate} />

      {isAdminAuthenticated && (
        <button
          onClick={toggleAdmin}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-4 rounded-full shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/60 transition-all z-40 text-sm"
        >
          {showAdmin ? 'Exit Admin' : 'Admin'}
        </button>
      )}

      <main className="flex-grow container mx-auto px-4 py-8">
        {showAdmin ? (
          isAdminAuthenticated ? (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={handleAdminLogout}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </div>
              <AdminPanel />
            </div>
          ) : (
            <AdminLogin onLogin={handleAdminLogin} />
          )
        ) : (
          <>
            {currentSection === 'home' && <HomePage onNavigate={handleNavigate} />}
            {currentSection === 'news' && <NewsPage selectedArticleId={selectedItemId} onBack={handleBack} />}
            {currentSection === 'reviews' && <ReviewsPage selectedReviewId={selectedItemId} onBack={handleBack} />}
            {currentSection === 'videos' && <VideosPage selectedVideoId={selectedItemId} onBack={handleBack} />}
            {currentSection === 'gallery' && <GalleryPage />}
            {currentSection === 'blog' && <BlogPage selectedPostId={selectedItemId} onBack={handleBack} />}
            {currentSection === 'guides' && <GuidesPage />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
