# 🔧 问题排查

遇到问题？在这里找答案。

---

## 📖 目录

| 文档 | 说明 |
|-----|------|
| [常见问题 FAQ](./faq.md) | 最常见问题的解答 |
| [迁移指南](./migration.md) | 从 vue-i18n / react-i18next 迁移 |

---

## 🚨 常见问题快速定位

### 安装问题

```bash
# 检查 Node.js 版本
node -v  # 需要 >= 16

# 清除缓存重新安装
rm -rf node_modules
pnpm install
```

### 提取不到文本

1. 检查文件是否在 `include` 范围内
2. 确认使用的是 `$tsl()` 函数
3. 查看 `translink extract --verbose` 输出

### 翻译不更新

1. 检查翻译文件路径是否正确
2. 开发模式下，检查 HMR 是否正常
3. 尝试清除缓存：`translink build --clean`

---

## 🔗 获取帮助

- [GitHub Issues](https://github.com/lynncen/translink-i18n/issues) - 报告 Bug
- [GitHub Discussions](https://github.com/lynncen/translink-i18n/discussions) - 提问讨论
