import React from 'react';
import { useTranslation } from '@translink/i18n-runtime/react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  badge?: string;
}

const FeatureShowcase: React.FC = () => {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      icon: '🔄',
      title: $tsl('智能代码转换'),
      description: $tsl('自动将 $tsl 函数转换为哈希键，提升运行时性能。'),
      badge: $tsl('核心功能')
    },
    {
      icon: '⚡',
      title: $tsl('热更新支持'),
      description: $tsl('语言文件变更时实时更新界面，无需刷新页面。'),
      badge: $tsl('开发体验')
    },
    {
      icon: '📦',
      title: $tsl('懒加载机制'),
      description: $tsl('按需加载语言包，优化首屏加载性能。'),
      badge: $tsl('性能优化')
    },
    {
      icon: '💾',
      title: $tsl('多级缓存'),
      description: $tsl('内存、本地存储、网络三级缓存策略。'),
      badge: $tsl('高效缓存')
    },
    {
      icon: '🌐',
      title: $tsl('框架无关'),
      description: $tsl('支持 Vue 3、React 等主流前端框架。'),
      badge: $tsl('通用性')
    },
    {
      icon: '☁️',
      title: $tsl('云端协作'),
      description: $tsl('集成 Vika 平台，支持团队协作翻译。'),
      badge: $tsl('团队协作')
    }
  ];

  return (
    <section className="feature-showcase" id="features">
      <div className="container">
        <div className="section-header">
          <h2>{$tsl('功能特性')}</h2>
          <p className="section-subtitle">
            {$tsl('TransLink I18n 提供完整的国际化解决方案，让多语言开发变得简单高效。')}
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        <div className="feature-stats">
          <div className="stat-item">
            <span className="stat-number">3</span>
            <span className="stat-label">{$tsl('核心工具')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">10+</span>
            <span className="stat-label">{$tsl('支持语言')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">100%</span>
            <span className="stat-label">{$tsl('TypeScript 支持')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0</span>
            <span className="stat-label">{$tsl('运行时依赖')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps extends Feature {}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, badge }) => {
  return (
    <div className="feature-card">
      {badge && (
        <div className="feature-badge">
          <span className="badge">{badge}</span>
        </div>
      )}
      
      <div className="feature-icon">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
      
      <div className="feature-footer">
        <button className="learn-more-btn">
          {$tsl('了解更多')} →
        </button>
      </div>
    </div>
  );
};

export default FeatureShowcase;
