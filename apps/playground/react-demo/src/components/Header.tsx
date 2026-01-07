import React from 'react';
import { useI18n } from '@translink/i18n-runtime/react';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useI18n();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <h1>{$tsl('TransLink I18n React 演示')}</h1>
          <p className="brand-subtitle">
            {$tsl('现代化 React 国际化解决方案')}
          </p>
        </div>

        <nav className="header-nav">
          <a href="#features" className="nav-link">
            {$tsl('功能特性')}
          </a>
          <a href="#demo" className="nav-link">
            {$tsl('在线演示')}
          </a>
          <a href="#docs" className="nav-link">
            {$tsl('文档')}
          </a>
          <a href="#github" className="nav-link">
            {$tsl('GitHub')}
          </a>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;
