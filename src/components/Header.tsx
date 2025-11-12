import { Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  currentSection: string;
  onNavigate: (section: string) => void;
}

export default function Header({ currentSection, onNavigate }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'news', label: 'News' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'releases', label: 'Releases' },
    { id: 'guides', label: 'Guides' },
    { id: 'blog', label: 'Blog' },
    { id: 'videos', label: 'Videos' },
    { id: 'gallery', label: 'Gallery' },
  ];

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50 border-b border-cyan-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center space-x-2 group"
          >
            <img
              src="/NewFSELogo.png"
              alt="FireStar Gaming Entertainment"
              className="h-12 w-auto group-hover:scale-105 transition-transform"
            />
          </button>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-cyan-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-cyan-500/20">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                  currentSection === item.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-cyan-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
