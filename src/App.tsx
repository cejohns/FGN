import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import NewsPage from './components/NewsPage';
import ReviewsPage from './components/ReviewsPage';
import VideosPage from './components/VideosPage';
import GalleryPage from './components/GalleryPage';
import BlogPage from './components/BlogPage';
import GuidesPage from './components/GuidesPage';
import ReleaseCalendarPage from './components/ReleaseCalendarPage';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';

function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });

  const handleNavigate = (section: string, itemId?: string) => {
    setCurrentSection(section);
    setSelectedItemId(itemId);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setSelectedItemId(undefined);
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <Header currentSection={currentSection} onNavigate={handleNavigate} />

      <main className="flex-grow container mx-auto px-4 py-8">
        {currentSection === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentSection === 'news' && <NewsPage selectedArticleId={selectedItemId} onBack={handleBack} />}
        {currentSection === 'reviews' && <ReviewsPage selectedReviewId={selectedItemId} onBack={handleBack} />}
        {currentSection === 'releases' && <ReleaseCalendarPage selectedGameId={selectedItemId} onBack={handleBack} />}
        {currentSection === 'videos' && <VideosPage selectedVideoId={selectedItemId} onBack={handleBack} />}
        {currentSection === 'gallery' && <GalleryPage />}
        {currentSection === 'blog' && <BlogPage selectedPostId={selectedItemId} onBack={handleBack} />}
        {currentSection === 'guides' && <GuidesPage />}
        {currentSection === 'admin' && (
          isAdminAuthenticated ? <AdminPanel /> : <AdminLogin onLogin={handleAdminLogin} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
