import React, { useState } from 'react';
import { useI18n } from '@translink/i18n-runtime/react';

const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, availableLocales, isLoading } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const languageNames: Record<string, { name: string; flag: string }> = {
    'zh-CN': { name: '中文', flag: '🇨🇳' },
    'en-US': { name: 'English', flag: '🇺🇸' },
    'ja-JP': { name: '日本語', flag: '🇯🇵' }
  };

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale !== locale) {
      try {
        await setLocale(newLocale);
        setIsOpen(false);
        
        // 显示切换成功提示
        showNotification($tsl('语言切换成功！'));
      } catch (error) {
        console.error('Language switch failed:', error);
        showNotification($tsl('语言切换失败，请重试。'), 'error');
      }
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // 简单的通知实现
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 20px',
      borderRadius: '6px',
      color: 'white',
      backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '9999',
      fontSize: '14px',
      fontWeight: '500',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const currentLanguage = languageNames[locale] || { name: locale, flag: '🌐' };

  return (
    <div className="language-switcher">
      <button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        aria-label={$tsl('选择语言')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="language-flag">{currentLanguage.flag}</span>
        <span className="language-name">{currentLanguage.name}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▼</span>
        {isLoading && <span className="loading-spinner"></span>}
      </button>

      {isOpen && (
        <div className="language-dropdown" role="listbox">
          {availableLocales.map((langCode) => {
            const lang = languageNames[langCode] || { name: langCode, flag: '🌐' };
            return (
              <button
                key={langCode}
                className={`language-option ${langCode === locale ? 'active' : ''}`}
                onClick={() => handleLanguageChange(langCode)}
                role="option"
                aria-selected={langCode === locale}
              >
                <span className="language-flag">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>
                {langCode === locale && <span className="check-mark">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {isOpen && (
        <div 
          className="language-overlay" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default LanguageSwitcher;
