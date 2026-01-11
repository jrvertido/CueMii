import React from 'react';
import { APP_VERSION } from '../data/initialData';
import { getDaysUntilExpiration } from '../utils/licenseUtils';

/**
 * Application header with logo and manage players button
 * @param {Object} props
 * @param {Function} props.onOpenDatabase - Callback to open player database modal
 * @param {Function} props.onOpenHistory - Callback to open match history modal
 * @param {Function} props.onOpenAbout - Callback to open about modal
 * @param {Function} props.onResetData - Callback to reset all application data
 * @param {boolean} props.isDarkMode - Current theme mode
 * @param {Function} props.toggleTheme - Callback to toggle theme
 * @param {object} props.licenseInfo - Current license information
 */
const Header = ({ onOpenDatabase, onOpenHistory, onOpenAbout, onResetData, isDarkMode, toggleTheme, licenseInfo }) => {
  const daysLeft = licenseInfo?.expirationDate ? getDaysUntilExpiration(licenseInfo.expirationDate) : null;
  const showWarning = daysLeft !== null && daysLeft <= 30;
  const isExpired = daysLeft !== null && daysLeft < 0;

  return (
    <header className={`relative border-b backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 border-pink-500/20' 
        : 'bg-gradient-to-r from-slate-100 via-white to-slate-100 border-pink-400/40 shadow-sm'
    }`}>
      <div className="max-w-[1920px] mx-auto px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/banner.jpg" 
            alt="Baddixx" 
            className="h-10 w-auto object-contain"
          />
          <div className={`h-8 w-px ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`} />
          <div>
            <p className={`font-bold tracking-wide text-xl ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>CueMii App</p>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Created by Joseph Vertido (jrvertido@gmail.com) · v{APP_VERSION}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* About Button with License Status */}
          <button
            onClick={onOpenAbout}
            className={`p-2 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              isExpired
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 animate-pulse'
                : showWarning
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/50'
                  : isDarkMode 
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' 
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
            }`}
            title={isExpired ? 'License Expired!' : showWarning ? `License expires in ${daysLeft} days` : 'About & License'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {(isExpired || showWarning) && (
              <span className="text-xs">{isExpired ? '!' : daysLeft}</span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              isDarkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-600 border border-amber-300'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={onOpenHistory}
            className="bg-violet-600 hover:bg-violet-500 px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 text-white shadow-md shadow-violet-500/25"
            title="View match history"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </button>
          <button
            onClick={onResetData}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              isDarkMode 
                ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 border border-slate-300'
            }`}
            title="Reset all data"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
          <button
            onClick={onOpenDatabase}
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-pink-500/25 flex items-center gap-1.5 text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Manage Players
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
