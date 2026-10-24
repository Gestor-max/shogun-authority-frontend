import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from './i18n/types';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'public' | 'sidebar';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'public' }) => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (langCode: SupportedLanguage) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  const isSidebar = variant === 'sidebar';

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Select language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: isSidebar ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.08)',
          color: isSidebar ? '#cbd5e1' : '#f8fafc',
          border: isSidebar ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.15)',
          padding: isSidebar ? '0.35rem 0.65rem' : '0.45rem 0.75rem',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
      >
        <Globe size={14} style={{ opacity: 0.85 }} />
        <span>{currentLang.flag}</span>
        <span style={{ letterSpacing: '0.04em' }}>{currentLang.code.toUpperCase()}</span>
        <ChevronDown size={13} style={{ opacity: 0.7, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: isSidebar ? '100%' : 'auto',
            top: isSidebar ? 'auto' : 'calc(100% + 6px)',
            right: 0,
            marginBottom: isSidebar ? '6px' : 0,
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            minWidth: '140px',
            zIndex: 9999,
            overflow: 'hidden',
            padding: '4px',
          }}
        >
          {SUPPORTED_LANGUAGES.map(item => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                type="button"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  color: isSelected ? '#38bdf8' : '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{item.flag}</span>
                  <span>{item.label}</span>
                </span>
                {isSelected && <Check size={14} style={{ color: '#38bdf8' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
