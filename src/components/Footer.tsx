import { Twitter, Youtube, Twitch, Instagram } from 'lucide-react';

interface FooterProps {
  onNavigate?: (section: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-black border-t border-cyan-500/20 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <img
                src="/NewFSELogo.png"
                alt="FireStar Gaming Entertainment"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              Your ultimate destination for gaming news, reviews, videos, and community content.
              Stay up-to-date with the latest in the gaming world.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <Twitch className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-slate-800 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-full flex items-center justify-center transition-all hover:shadow-lg hover:shadow-cyan-500/50"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Content</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">News</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Reviews</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Videos</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Gallery</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">About</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Advertise</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cyan-500/20 mt-8 pt-8 text-center text-gray-400 text-sm">
          <div className="flex items-center justify-center gap-4">
            <p>&copy; {new Date().getFullYear()} FireStar Gaming Network. All rights reserved.</p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-3 py-1 text-xs bg-slate-800 hover:bg-cyan-500 text-gray-300 hover:text-white rounded transition-colors"
                title="Admin Panel (Ctrl+Shift+A)"
              >
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
