'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface HeaderProps {
  currentPage?: string;
}

export default function Header({ currentPage = 'home' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'news', label: 'News', href: '/news' },
    { id: 'reviews', label: 'Reviews', href: '/reviews' },
    { id: 'releases', label: 'Releases', href: '/releases' },
    { id: 'guides', label: 'Guides', href: '/guides' },
    { id: 'blog', label: 'Blog', href: '/blog' },
    { id: 'videos', label: 'Videos', href: '/videos' },
    { id: 'gallery', label: 'Gallery', href: '/gallery' },
  ];

  return (
    <header className="bg-fs-dark border-b border-fs-panel sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <Image src="/FGNLogo.png" alt="FireStar Gaming Network" width={48} height={48} className="h-12 w-auto" />
          <div className="leading-tight hidden lg:block">
            <div className="text-lg font-semibold tracking-wide bg-gradient-to-b from-fs-silverLight via-fs-silverMid to-fs-silverDark bg-clip-text text-transparent">
              FireStar Gaming Network
            </div>
            <div className="text-xs uppercase text-fs-blue tracking-wider">
              Gaming • News • Reviews • Tutorials • Playthroughs
            </div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`fgn-nav-link transition-colors whitespace-nowrap ${
                currentPage === item.id
                  ? 'text-fs-blue font-medium fs-glow-blue'
                  : 'text-fs-muted hover:text-fs-blue'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-fs-muted hover:text-fs-blue"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div
        className={`mobile-nav lg:hidden bg-fs-panel px-4 border-t border-fs-dark ${
          mobileMenuOpen ? 'mobile-nav-open' : ''
        }`}
      >
        <nav className="flex flex-col gap-3 text-sm py-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`text-left transition-colors ${
                currentPage === item.id
                  ? 'text-fs-blue font-medium fs-glow-blue'
                  : 'text-fs-muted hover:text-fs-blue'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
