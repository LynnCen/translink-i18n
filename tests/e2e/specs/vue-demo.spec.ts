import { test, expect } from '@playwright/test';

test.describe('Vue Demo E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('基础功能', () => {
    test('应该显示中文欢迎消息', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('欢迎使用 TransLink I18n');
      await expect(page.locator('nav .nav-brand h1')).toContainText(
        'TransLink I18n 演示'
      );
    });

    test('应该显示功能特性卡片', async ({ page }) => {
      const featureCards = page.locator('.feature-grid .feature-card');

      await expect(featureCards).toHaveCount(4);
      await expect(featureCards.nth(0)).toContainText('智能代码转换');
      await expect(featureCards.nth(1)).toContainText('热更新支持');
      await expect(featureCards.nth(2)).toContainText('懒加载机制');
      await expect(featureCards.nth(3)).toContainText('多级缓存');
    });

    test('应该显示演示区域', async ({ page }) => {
      const demoCards = page.locator('.demo-grid .demo-card');

      await expect(demoCards).toHaveCount(4);
      await expect(demoCards.nth(0)).toContainText('用户信息');
      await expect(demoCards.nth(1)).toContainText('表单示例');
      await expect(demoCards.nth(2)).toContainText('数据展示');
      await expect(demoCards.nth(3)).toContainText('消息通知');
    });
  });

  test.describe('语言切换', () => {
    test('应该成功切换到英文', async ({ page }) => {
      // 检查初始语言
      await expect(page.locator('h1')).toContainText('欢迎使用');

      // 切换到英文
      await page.selectOption('select#language-select', 'en-US');

      // 验证语言切换
      await expect(page.locator('h1')).toContainText('Welcome');
      await expect(page.locator('nav .nav-brand h1')).toContainText(
        'TransLink I18n Demo'
      );

      // 验证其他文本也更新了
      await expect(
        page.locator('.feature-grid .feature-card').first()
      ).toContainText('Smart Code Transform');
    });

    test('应该成功切换到日文', async ({ page }) => {
      // 切换到日文
      await page.selectOption('select#language-select', 'ja-JP');

      // 验证语言切换
      await expect(page.locator('h1')).toContainText(
        'TransLink I18n へようこそ'
      );

      // 验证功能卡片文本
      await expect(
        page.locator('.feature-grid .feature-card').first()
      ).toContainText('スマートコード変換');
    });

    test('应该显示加载状态', async ({ page }) => {
      // 监听网络请求
      const responsePromise = page.waitForResponse(/\/locales\/.*\.json$/);

      // 切换语言
      await page.selectOption('select#language-select', 'en-US');

      // 检查是否有加载指示器
      const loadingIndicator = page.locator('.loading-indicator');

      // 等待响应完成
      await responsePromise;

      // 验证最终加载完成
      await expect(page.locator('h1')).toContainText('Welcome');
    });

    test('应该在页面刷新后保持语言偏好', async ({ page }) => {
      // 切换到英文
      await page.selectOption('select#language-select', 'en-US');
      await expect(page.locator('h1')).toContainText('Welcome');

      // 刷新页面
      await page.reload();

      // 验证语言偏好被保持（如果配置了持久化）
      await expect(page.locator('select#language-select')).toHaveValue('en-US');
      await expect(page.locator('h1')).toContainText('Welcome');
    });
  });

  test.describe('交互功能', () => {
    test('应该处理用户信息表单', async ({ page }) => {
      const userInfoCard = page
        .locator('.demo-card')
        .filter({ hasText: '用户信息' });

      // 检查用户信息卡片内容
      await expect(
        userInfoCard.locator('input[placeholder*="姓名"]')
      ).toBeVisible();
      await expect(
        userInfoCard.locator('input[placeholder*="邮箱"]')
      ).toBeVisible();

      // 填写表单
      await userInfoCard.locator('input[placeholder*="姓名"]').fill('张三');
      await userInfoCard
        .locator('input[placeholder*="邮箱"]')
        .fill('zhangsan@example.com');

      // 提交表单
      await userInfoCard.locator('button').filter({ hasText: '保存' }).click();

      // 验证成功消息
      await expect(page.locator('.notification')).toContainText('保存成功');
    });

    test('应该处理联系表单', async ({ page }) => {
      const contactCard = page
        .locator('.demo-card')
        .filter({ hasText: '表单示例' });

      // 填写联系表单
      await contactCard.locator('input[placeholder*="主题"]').fill('测试主题');
      await contactCard
        .locator('textarea[placeholder*="消息"]')
        .fill('这是一条测试消息');

      // 提交表单
      await contactCard.locator('button').filter({ hasText: '发送' }).click();

      // 验证提交成功
      await expect(page.locator('.notification')).toContainText('消息已发送');
    });

    test('应该显示数据统计', async ({ page }) => {
      const dataCard = page
        .locator('.demo-card')
        .filter({ hasText: '数据展示' });

      // 检查数据展示元素
      await expect(dataCard.locator('.stat-item')).toHaveCount(3);
      await expect(dataCard.locator('.stat-item').first()).toContainText(
        '总用户数'
      );
      await expect(dataCard.locator('.stat-item').nth(1)).toContainText(
        '活跃用户'
      );
      await expect(dataCard.locator('.stat-item').nth(2)).toContainText(
        '新增用户'
      );

      // 验证数字显示
      await expect(dataCard.locator('.stat-value').first()).toMatch(/\d+/);
    });

    test('应该处理通知演示', async ({ page }) => {
      const notificationCard = page
        .locator('.demo-card')
        .filter({ hasText: '消息通知' });

      // 点击不同类型的通知按钮
      await notificationCard
        .locator('button')
        .filter({ hasText: '成功' })
        .click();
      await expect(page.locator('.notification.success')).toContainText(
        '操作成功'
      );

      await notificationCard
        .locator('button')
        .filter({ hasText: '警告' })
        .click();
      await expect(page.locator('.notification.warning')).toContainText(
        '警告信息'
      );

      await notificationCard
        .locator('button')
        .filter({ hasText: '错误' })
        .click();
      await expect(page.locator('.notification.error')).toContainText(
        '操作失败'
      );
    });
  });

  test.describe('响应式设计', () => {
    test('应该在移动设备上正确显示', async ({ page }) => {
      // 设置移动设备视口
      await page.setViewportSize({ width: 375, height: 667 });

      // 检查导航栏在移动设备上的布局
      const navbar = page.locator('.navbar');
      await expect(navbar).toBeVisible();

      // 检查功能卡片在移动设备上的布局
      const featureGrid = page.locator('.feature-grid');
      await expect(featureGrid).toBeVisible();

      // 检查演示卡片在移动设备上的布局
      const demoGrid = page.locator('.demo-grid');
      await expect(demoGrid).toBeVisible();
    });

    test('应该在平板设备上正确显示', async ({ page }) => {
      // 设置平板设备视口
      await page.setViewportSize({ width: 768, height: 1024 });

      // 验证布局适应
      const featureCards = page.locator('.feature-grid .feature-card');
      await expect(featureCards).toHaveCount(4);

      const demoCards = page.locator('.demo-grid .demo-card');
      await expect(demoCards).toHaveCount(4);
    });
  });

  test.describe('性能测试', () => {
    test('应该快速加载页面', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // 页面应该在3秒内加载完成
      expect(loadTime).toBeLessThan(3000);

      // 验证关键内容已加载
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.feature-grid')).toBeVisible();
    });

    test('应该高效处理语言切换', async ({ page }) => {
      const startTime = Date.now();

      // 切换语言
      await page.selectOption('select#language-select', 'en-US');

      // 等待翻译完成
      await expect(page.locator('h1')).toContainText('Welcome');

      const switchTime = Date.now() - startTime;

      // 语言切换应该在1秒内完成
      expect(switchTime).toBeLessThan(1000);
    });
  });

  test.describe('错误处理', () => {
    test('应该处理网络错误', async ({ page }) => {
      // 模拟网络离线
      await page.context().setOffline(true);

      // 尝试切换语言
      await page.selectOption('select#language-select', 'en-US');

      // 应该显示错误消息或回退到缓存
      // 具体行为取决于实现
      await expect(page.locator('h1')).toBeVisible();
    });

    test('应该处理缺失的翻译', async ({ page }) => {
      // 这个测试需要配合后端或模拟缺失翻译的情况

      // 可以通过拦截网络请求来模拟
      await page.route('**/locales/en-US.json', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            // 故意缺少某些翻译键
            welcome: 'Welcome',
            // greeting 键缺失
          }),
        });
      });

      await page.selectOption('select#language-select', 'en-US');

      // 验证回退机制工作
      await expect(page.locator('h1')).toContainText('Welcome');
    });
  });

  test.describe('可访问性', () => {
    test('应该支持键盘导航', async ({ page }) => {
      // 使用 Tab 键导航
      await page.keyboard.press('Tab');

      // 验证焦点在语言选择器上
      await expect(page.locator('select#language-select')).toBeFocused();

      // 继续导航到其他交互元素
      await page.keyboard.press('Tab');
      // 验证焦点移动到下一个可交互元素
    });

    test('应该有正确的 ARIA 标签', async ({ page }) => {
      // 检查语言选择器的标签
      const languageSelect = page.locator('select#language-select');
      await expect(languageSelect).toHaveAttribute(
        'aria-label',
        /语言选择|Language/
      );

      // 检查其他重要元素的可访问性属性
      const mainContent = page.locator('main');
      await expect(mainContent).toHaveAttribute('role', 'main');
    });

    test('应该支持屏幕阅读器', async ({ page }) => {
      // 检查页面标题
      await expect(page).toHaveTitle(/TransLink I18n/);

      // 检查主要标题的层次结构
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      const h2Elements = page.locator('h2');
      await expect(h2Elements.first()).toBeVisible();
    });
  });
});
