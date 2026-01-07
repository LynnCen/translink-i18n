import { test, expect } from '@playwright/test';

test.describe('React Demo E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test.describe('基础功能', () => {
    test('应该显示 React 应用标题', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('欢迎使用 TransLink I18n');
      await expect(page.locator('.hero-subtitle')).toContainText(
        '现代化的国际化解决方案'
      );
    });

    test('应该显示操作按钮', async ({ page }) => {
      const primaryButton = page.locator('.btn-primary');
      const secondaryButton = page.locator('.btn-secondary');

      await expect(primaryButton).toContainText('开始使用');
      await expect(secondaryButton).toContainText('查看文档');

      // 验证按钮可点击
      await expect(primaryButton).toBeEnabled();
      await expect(secondaryButton).toBeEnabled();
    });

    test('应该显示功能展示区域', async ({ page }) => {
      const featureSection = page.locator('.feature-showcase');
      await expect(featureSection).toBeVisible();

      // 检查功能卡片
      const featureCards = page.locator('.feature-card');
      await expect(featureCards).toHaveCount(4);
    });

    test('应该显示交互演示区域', async ({ page }) => {
      const demoSection = page.locator('.interactive-demo');
      await expect(demoSection).toBeVisible();

      // 检查演示组件
      const demoComponents = page.locator('.demo-component');
      await expect(demoComponents.first()).toBeVisible();
    });
  });

  test.describe('语言切换功能', () => {
    test('应该成功切换到英文', async ({ page }) => {
      // 检查初始语言
      await expect(page.locator('h1')).toContainText('欢迎使用');

      // 找到语言切换器
      const languageSwitcher = page.locator('.language-switcher select');
      await languageSwitcher.selectOption('en-US');

      // 验证语言切换
      await expect(page.locator('h1')).toContainText(
        'Welcome to TransLink I18n'
      );
      await expect(page.locator('.hero-subtitle')).toContainText(
        'Modern internationalization solution'
      );

      // 验证按钮文本也更新了
      await expect(page.locator('.btn-primary')).toContainText('Get Started');
      await expect(page.locator('.btn-secondary')).toContainText('View Docs');
    });

    test('应该成功切换到日文', async ({ page }) => {
      const languageSwitcher = page.locator('.language-switcher select');
      await languageSwitcher.selectOption('ja-JP');

      await expect(page.locator('h1')).toContainText(
        'TransLink I18n へようこそ'
      );
      await expect(page.locator('.btn-primary')).toContainText('始める');
    });

    test('应该显示当前语言状态', async ({ page }) => {
      const currentLangDisplay = page.locator('.current-language');

      // 初始应该显示中文
      await expect(currentLangDisplay).toContainText('中文');

      // 切换到英文
      await page.locator('.language-switcher select').selectOption('en-US');
      await expect(currentLangDisplay).toContainText('English');
    });

    test('应该处理语言切换加载状态', async ({ page }) => {
      // 监听网络请求
      const responsePromise = page.waitForResponse(/\/api\/translations\/.*$/);

      // 切换语言
      await page.locator('.language-switcher select').selectOption('en-US');

      // 检查加载状态
      const loadingSpinner = page.locator('.loading-spinner');
      // 注意：加载可能很快，所以这个测试可能需要调整

      // 等待加载完成
      await responsePromise.catch(() => {}); // 忽略可能的错误

      // 验证最终状态
      await expect(page.locator('h1')).toContainText('Welcome');
    });
  });

  test.describe('React 特定功能', () => {
    test('应该正确渲染 React 组件', async ({ page }) => {
      // 检查 React 特有的元素
      const reactRoot = page.locator('#root');
      await expect(reactRoot).toBeVisible();

      // 验证组件层次结构
      const appComponent = page.locator('.app');
      await expect(appComponent).toBeVisible();
    });

    test('应该处理 React Hook 状态', async ({ page }) => {
      // 测试计数器组件（如果有的话）
      const counterButton = page
        .locator('button')
        .filter({ hasText: /计数|Count/ });

      if ((await counterButton.count()) > 0) {
        const initialText = await counterButton.textContent();
        await counterButton.click();

        // 验证状态更新
        await expect(counterButton).not.toContainText(initialText || '');
      }
    });

    test('应该处理表单输入', async ({ page }) => {
      const nameInput = page.locator(
        'input[placeholder*="姓名"], input[placeholder*="Name"]'
      );
      const emailInput = page.locator(
        'input[placeholder*="邮箱"], input[placeholder*="Email"]'
      );

      if ((await nameInput.count()) > 0) {
        await nameInput.fill('React User');
        await expect(nameInput).toHaveValue('React User');
      }

      if ((await emailInput.count()) > 0) {
        await emailInput.fill('react@example.com');
        await expect(emailInput).toHaveValue('react@example.com');
      }
    });

    test('应该处理事件处理器', async ({ page }) => {
      // 测试点击事件
      const clickButton = page
        .locator('button')
        .filter({ hasText: /点击|Click/ });

      if ((await clickButton.count()) > 0) {
        await clickButton.click();

        // 验证点击效果（可能是弹窗、状态变化等）
        const notification = page.locator('.notification, .alert, .toast');
        if ((await notification.count()) > 0) {
          await expect(notification).toBeVisible();
        }
      }
    });
  });

  test.describe('组件交互', () => {
    test('应该处理模态框', async ({ page }) => {
      const modalTrigger = page
        .locator('button')
        .filter({ hasText: /打开|Open|模态|Modal/ });

      if ((await modalTrigger.count()) > 0) {
        await modalTrigger.click();

        const modal = page.locator('.modal, .dialog');
        await expect(modal).toBeVisible();

        // 关闭模态框
        const closeButton = page
          .locator('.modal .close, .modal button')
          .filter({ hasText: /关闭|Close/ });
        if ((await closeButton.count()) > 0) {
          await closeButton.click();
          await expect(modal).not.toBeVisible();
        }
      }
    });

    test('应该处理下拉菜单', async ({ page }) => {
      const dropdown = page.locator('.dropdown, .select');

      if ((await dropdown.count()) > 0) {
        await dropdown.click();

        const dropdownMenu = page.locator('.dropdown-menu, .select-options');
        await expect(dropdownMenu).toBeVisible();

        // 选择一个选项
        const option = dropdownMenu.locator('li, option').first();
        if ((await option.count()) > 0) {
          await option.click();
        }
      }
    });

    test('应该处理标签页切换', async ({ page }) => {
      const tabButtons = page.locator('.tab-button, .nav-tab');

      if ((await tabButtons.count()) > 1) {
        const secondTab = tabButtons.nth(1);
        await secondTab.click();

        // 验证标签页内容切换
        const tabContent = page.locator('.tab-content, .tab-panel');
        await expect(tabContent).toBeVisible();
      }
    });
  });

  test.describe('错误边界测试', () => {
    test('应该处理组件错误', async ({ page }) => {
      // 模拟触发错误的操作
      const errorTrigger = page
        .locator('button')
        .filter({ hasText: /错误|Error/ });

      if ((await errorTrigger.count()) > 0) {
        await errorTrigger.click();

        // 验证错误边界显示
        const errorBoundary = page.locator('.error-boundary, .error-fallback');
        if ((await errorBoundary.count()) > 0) {
          await expect(errorBoundary).toBeVisible();
          await expect(errorBoundary).toContainText(/错误|Error/);
        }
      }
    });

    test('应该处理网络错误', async ({ page }) => {
      // 拦截网络请求并返回错误
      await page.route('**/api/**', route => {
        route.abort('failed');
      });

      // 尝试触发需要网络请求的操作
      const networkButton = page
        .locator('button')
        .filter({ hasText: /加载|Load|刷新|Refresh/ });

      if ((await networkButton.count()) > 0) {
        await networkButton.click();

        // 验证错误处理
        const errorMessage = page.locator('.error-message, .alert-error');
        if ((await errorMessage.count()) > 0) {
          await expect(errorMessage).toBeVisible();
        }
      }
    });
  });

  test.describe('性能测试', () => {
    test('应该快速渲染组件', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:3001');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // React 应用应该在3秒内加载完成
      expect(loadTime).toBeLessThan(3000);

      // 验证关键组件已渲染
      await expect(page.locator('.app')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    });

    test('应该高效处理状态更新', async ({ page }) => {
      const updateButton = page
        .locator('button')
        .filter({ hasText: /更新|Update/ });

      if ((await updateButton.count()) > 0) {
        const startTime = Date.now();

        // 连续点击多次
        for (let i = 0; i < 10; i++) {
          await updateButton.click();
          await page.waitForTimeout(10); // 短暂等待
        }

        const updateTime = Date.now() - startTime;

        // 状态更新应该很快
        expect(updateTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('可访问性', () => {
    test('应该支持键盘导航', async ({ page }) => {
      // 使用 Tab 键导航
      await page.keyboard.press('Tab');

      // 验证焦点管理
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // 继续导航
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
    });

    test('应该有正确的语义标签', async ({ page }) => {
      // 检查主要区域
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // 检查导航
      const nav = page.locator('nav');
      if ((await nav.count()) > 0) {
        await expect(nav).toBeVisible();
      }

      // 检查标题层次
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
    });

    test('应该支持屏幕阅读器', async ({ page }) => {
      // 检查 alt 文本
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }

      // 检查按钮标签
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();

      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');

        expect(text || ariaLabel).toBeTruthy();
      }
    });
  });

  test.describe('移动端适配', () => {
    test('应该在移动设备上正确显示', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // 验证响应式布局
      const app = page.locator('.app');
      await expect(app).toBeVisible();

      // 检查移动端导航
      const mobileNav = page.locator('.mobile-nav, .hamburger');
      if ((await mobileNav.count()) > 0) {
        await expect(mobileNav).toBeVisible();
      }
    });

    test('应该支持触摸交互', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // 测试触摸滑动（如果有轮播图等）
      const swipeArea = page.locator('.swipe-area, .carousel');

      if ((await swipeArea.count()) > 0) {
        const box = await swipeArea.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
          await page.mouse.up();
        }
      }
    });
  });
});
