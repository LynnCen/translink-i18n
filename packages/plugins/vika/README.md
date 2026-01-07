# @translink/plugin-vika

Vika 集成插件，用于 TransLink I18n CLI。

## 安装

```bash
npm install @translink/plugin-vika
# 或
pnpm add @translink/plugin-vika
```

## 配置

在 `translink.config.ts` 中配置插件：

```typescript
import type { I18nConfig } from '@translink/i18n-cli';

export default {
  // ... 其他配置
  plugins: [
    [
      '@translink/plugin-vika',
      {
        apiKey: process.env.VIKA_API_KEY,
        datasheetId: process.env.VIKA_DATASHEET_ID,
      },
    ],
  ],
} satisfies I18nConfig;
```

或者使用环境变量：

```bash
export VIKA_API_KEY="your_api_key"
export VIKA_DATASHEET_ID="your_datasheet_id"
```

## 使用

配置完成后，插件会自动注册 `push` 和 `pull` 命令：

```bash
# 推送翻译到 Vika
translink push

# 从 Vika 拉取翻译
translink pull --language en-US
```

## 功能

- ✅ 推送翻译到 Vika 云端
- ✅ 从 Vika 拉取翻译
- ✅ 获取翻译统计信息
- ✅ 测试连接状态

## 许可证

MIT

