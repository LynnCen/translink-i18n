# TransLink I18n 项目基础架构搭建教程

> 本教程详细记录了如何从零搭建一个现代化的 TypeScript monorepo 项目，适用于开发国际化工具集。

## 📋 目标概述

我们将创建一个包含以下特性的 monorepo 项目：
- 🏗️ **pnpm + Turborepo** 高效包管理和构建
- 📦 **三个核心包**: CLI工具、运行时库、Vite插件
- 🔧 **TypeScript** 严格类型检查和项目引用
- ✨ **现代工具链**: ESLint、Prettier、Vitest
- 🚀 **自动化构建**: 统一的构建和发布流程

## 🎯 最终项目结构

```
translink-i18n/
├── packages/
│   ├── cli/                    # @translink/i18n-cli
│   ├── runtime/                # @translink/i18n-runtime
│   └── vite-plugin/            # @translink/vite-plugin
├── apps/
│   ├── docs/                   # 文档站点
│   └── playground/             # 示例应用
├── tools/
│   └── eslint-config/          # 共享 ESLint 配置
├── docs/                       # 项目文档
├── pnpm-workspace.yaml         # pnpm 工作区配置
├── turbo.json                  # Turborepo 构建配置
├── tsconfig.json               # TypeScript 根配置
├── vitest.config.ts            # 测试配置
├── .eslintrc.js                # ESLint 配置
├── .prettierrc                 # Prettier 配置
└── package.json                # 根 package.json
```

## 🚀 实施步骤

### 第一步：初始化项目根目录

```bash
# 创建项目目录
mkdir translink-i18n && cd translink-i18n

# 初始化 package.json
npm init -y
```

创建基础目录结构：

```bash
mkdir -p packages/cli packages/runtime packages/vite-plugin
mkdir -p apps/docs apps/playground
mkdir -p tools/eslint-config
mkdir -p docs/tutorials
```

### 第二步：配置根 package.json

将默认的 `package.json` 替换为以下内容：

```json
{
  "name": "translink-i18n",
  "version": "1.0.0",
  "description": "TransLink I18n - 现代化的国际化工具集，连接不同语言的智能桥梁",
  "private": true,
  "keywords": [
    "i18n",
    "internationalization", 
    "translation",
    "vue",
    "react",
    "vite",
    "cli",
    "monorepo"
  ],
  "author": "lynncen",
  "license": "MIT",
  "engines": {
    "node": ">=16.0.0",
    "pnpm": ">=8.0.0"
  },
  "packageManager": "pnpm@8.15.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev", 
    "lint": "turbo run lint",
    "test": "turbo run test",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "turbo": "^1.13.0"
  },
  "workspaces": [
    "packages/*",
    "apps/*", 
    "tools/*"
  ]
}
```

**关键配置说明：**
- `private: true`: 防止根包被意外发布
- `packageManager`: 指定 pnpm 版本，确保团队一致性
- `workspaces`: 定义工作区包含的目录
- `engines`: 限制 Node.js 和 pnpm 版本

### 第三步：配置 pnpm 工作区

创建 `pnpm-workspace.yaml`：

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tools/*'

# 目录排除配置
exclude:
  - '**/node_modules/**'
  - '**/dist/**'
  - '**/build/**'
  - '**/.turbo/**'

# 共享依赖配置
catalog:
  # 核心依赖
  typescript: ^5.3.0
  vite: ^5.0.0
  vitest: ^1.2.0
  
  # 构建工具
  rollup: ^4.9.0
  esbuild: ^0.19.0
  
  # 开发工具
  eslint: ^8.56.0
  prettier: ^3.2.0
  
  # 框架支持
  vue: ^3.4.0
  react: ^18.2.0
  
  # AST 处理
  gogocode: ^1.0.0
  
  # 工具库
  commander: ^11.1.0
  chalk: ^5.3.0
  ora: ^8.0.0
```

**pnpm 工作区优势：**
- 📦 **依赖提升**: 共享依赖安装在根目录
- 🔗 **符号链接**: 内部包通过符号链接引用
- 🎯 **catalog 功能**: 统一管理依赖版本

### 第四步：配置 Turborepo

创建 `turbo.json`：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "package.json", "tsconfig.json"],
      "outputs": ["dist/**", "lib/**", "es/**", "*.d.ts"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "**/*.json", "**/*.md"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "test/**/*", "**/*.test.*"],
      "outputs": ["coverage/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "tsconfig.json"],
      "outputs": []
    },
    "clean": {
      "cache": false,
      "outputs": []
    }
  }
}
```

**Turborepo 配置详解：**
- `dependsOn`: 定义任务依赖关系
- `inputs`: 指定影响任务输出的输入文件
- `outputs`: 定义任务输出目录，用于缓存
- `cache: false`: 禁用某些任务的缓存（如 dev）

### 第五步：配置 TypeScript

创建根 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    "baseUrl": ".",
    "paths": {
      "@translink/i18n-cli": ["packages/cli/src"],
      "@translink/i18n-runtime": ["packages/runtime/src"],
      "@translink/vite-plugin": ["packages/vite-plugin/src"]
    }
  },
  "include": [],
  "references": [
    {
      "path": "./packages/cli"
    },
    {
      "path": "./packages/runtime"
    },
    {
      "path": "./packages/vite-plugin"
    },
    {
      "path": "./apps/docs"
    },
    {
      "path": "./apps/playground"
    }
  ]
}
```

**TypeScript 项目引用优势：**
- 🚀 **增量构建**: 只重新构建修改的项目
- 🔍 **类型检查**: 跨包的类型安全
- 📝 **智能提示**: IDE 中的完整类型支持

### 第六步：初始化子包

#### CLI 工具包配置

创建 `packages/cli/package.json`：

```json
{
  "name": "@translink/i18n-cli",
  "version": "1.0.0",
  "description": "TransLink I18n CLI Tool - 智能国际化文本提取和管理工具",
  "keywords": ["i18n", "cli", "internationalization", "translation", "ast", "extract"],
  "author": "lynncen",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "translink": "./dist/cli.js",
    "tl": "./dist/cli.js"
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "type-check": "tsc --noEmit",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "chalk": "^5.3.0",
    "ora": "^8.0.0",
    "gogocode": "^1.0.0",
    "glob": "^10.3.0",
    "fs-extra": "^11.2.0",
    "inquirer": "^9.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsup": "^8.0.0",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0",
    "@types/node": "^20.11.0",
    "@types/fs-extra": "^11.0.0",
    "@types/inquirer": "^9.0.0",
    "rimraf": "^5.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

创建 `packages/cli/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*",
    "src/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.spec.ts"
  ]
}
```

#### 运行时库包配置

创建 `packages/runtime/package.json`：

```json
{
  "name": "@translink/i18n-runtime",
  "version": "1.0.0",
  "description": "TransLink I18n Runtime - 高性能国际化运行时库，支持 Vue3 和 React",
  "keywords": ["i18n", "runtime", "internationalization", "translation", "vue", "react", "cache"],
  "author": "lynncen",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./vue": {
      "import": "./dist/vue.esm.js",
      "require": "./dist/vue.js",
      "types": "./dist/vue.d.ts"
    },
    "./react": {
      "import": "./dist/react.esm.js",
      "require": "./dist/react.js",
      "types": "./dist/react.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "type-check": "tsc --noEmit",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "lru-cache": "^10.1.0"
  },
  "peerDependencies": {
    "vue": "^3.0.0",
    "react": "^18.0.0"
  },
  "peerDependenciesMeta": {
    "vue": {
      "optional": true
    },
    "react": {
      "optional": true
    }
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "rollup": "^4.9.0",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0",
    "vue": "^3.4.0",
    "react": "^18.2.0",
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-commonjs": "^25.0.0",
    "rollup-plugin-dts": "^6.1.0",
    "rimraf": "^5.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

#### Vite 插件包配置

创建 `packages/vite-plugin/package.json`：

```json
{
  "name": "@translink/vite-plugin",
  "version": "1.0.0",
  "description": "TransLink I18n Vite Plugin - Vite 国际化插件，支持热更新和构建时优化",
  "keywords": ["vite", "plugin", "i18n", "internationalization", "hmr", "build-time", "vue", "react"],
  "author": "lynncen",
  "license": "MIT",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.esm.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "vitest",
    "type-check": "tsc --noEmit",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "gogocode": "^1.0.0",
    "glob": "^10.3.0",
    "fs-extra": "^11.2.0"
  },
  "peerDependencies": {
    "vite": "^4.0.0 || ^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "rollup": "^4.9.0",
    "vitest": "^1.2.0",
    "eslint": "^8.56.0",
    "@types/node": "^20.11.0",
    "@types/fs-extra": "^11.0.0",
    "@rollup/plugin-typescript": "^11.1.0",
    "@rollup/plugin-node-resolve": "^15.2.0",
    "@rollup/plugin-commonjs": "^25.0.0",
    "rollup-plugin-dts": "^6.1.0",
    "rimraf": "^5.0.0"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

### 第七步：配置代码质量工具

#### ESLint 共享配置

创建 `tools/eslint-config/package.json`：

```json
{
  "name": "@translink/eslint-config",
  "version": "1.0.0",
  "description": "TransLink I18n ESLint 共享配置",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.0",
    "eslint-plugin-prettier": "^5.1.0",
    "eslint-plugin-vue": "^9.20.0",
    "eslint-plugin-react": "^7.33.0",
    "eslint-plugin-react-hooks": "^4.6.0"
  },
  "peerDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

创建 `tools/eslint-config/index.js`：

```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
    'import/no-unresolved': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
  overrides: [
    // Vue 文件配置
    {
      files: ['*.vue'],
      extends: ['plugin:vue/vue3-recommended'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
    // React 文件配置
    {
      files: ['*.jsx', '*.tsx'],
      extends: [
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
      ],
      settings: {
        react: {
          version: 'detect',
        },
      },
    },
    // 测试文件配置
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx'],
      env: {
        jest: true,
        'vitest-globals/env': true,
      },
    },
  ],
};
```

#### 根目录配置文件

创建 `.eslintrc.js`：

```javascript
module.exports = {
  extends: ['./tools/eslint-config'],
  ignorePatterns: [
    'dist',
    'node_modules',
    '.turbo',
    'coverage',
    '*.d.ts',
  ],
};
```

创建 `.prettierrc`：

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "printWidth": 100,
        "proseWrap": "always"
      }
    },
    {
      "files": "*.vue",
      "options": {
        "parser": "vue"
      }
    }
  ]
}
```

### 第八步：配置测试环境

创建 `vitest.config.ts`：

```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/*/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        'packages/*/test/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@translink/i18n-cli': resolve(__dirname, './packages/cli/src'),
      '@translink/i18n-runtime': resolve(__dirname, './packages/runtime/src'),
      '@translink/vite-plugin': resolve(__dirname, './packages/vite-plugin/src'),
    },
  },
});
```

### 第九步：配置 Git

创建 `.gitignore`：

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
lib/
es/
coverage/
.turbo/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Cache
.npm
.eslintcache
.stylelintcache

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### 第十步：安装依赖和验证

```bash
# 安装所有依赖
pnpm install

# 验证工作区结构
pnpm list --depth=0

# 运行类型检查
pnpm type-check

# 运行代码检查
pnpm lint
```

## 🎯 CLI 工具基础实现

### 创建 CLI 源码结构

```bash
mkdir -p packages/cli/src/{commands,utils,types}
```

#### 类型定义

创建 `packages/cli/src/types/config.ts`：

```typescript
/**
 * TransLink I18n 配置文件类型定义
 */

export interface I18nConfig {
  // 扫描配置
  extract: {
    patterns: string[];
    exclude: string[];
    functions: string[];
    extensions: string[];
  };
  
  // 哈希配置
  hash: {
    algorithm: 'md5' | 'sha1' | 'sha256';
    length: number;
    includeContext: boolean;
    contextFields: ('filePath' | 'componentName' | 'functionName')[];
  };
  
  // 语言配置
  languages: {
    default: string;
    supported: string[];
    fallback: string;
  };
  
  // 输出配置
  output: {
    directory: string;
    format: 'json' | 'yaml' | 'js' | 'ts';
    splitByNamespace: boolean;
    flattenKeys: boolean;
  };
  
  // 云端配置
  vika: {
    apiKey: string;
    datasheetId: string;
    autoSync: boolean;
    syncInterval: number;
  };
  
  // 插件配置
  plugins: Array<string | [string, any]>;
}

export interface ExtractResult {
  key: string;
  text: string;
  filePath: string;
  line: number;
  column: number;
  context: {
    componentName?: string;
    functionName?: string;
    namespace?: string;
  };
}

export interface TranslationItem {
  key: string;
  text: string;
  context?: string;
  filePath?: string;
  status?: 'pending' | 'translated' | 'reviewed';
}
```

#### 日志工具

创建 `packages/cli/src/utils/logger.ts`：

```typescript
import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private static instance: Logger;
  private spinner: Ora | null = null;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✗'), message);
  }

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message);
    }
  }

  startSpinner(message: string): void {
    this.spinner = ora({
      text: message,
      color: 'blue',
    }).start();
  }

  stopSpinner(message?: string, success = true): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(message);
      } else {
        this.spinner.fail(message);
      }
      this.spinner = null;
    }
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  br(): void {
    console.log();
  }

  title(message: string): void {
    console.log();
    console.log(chalk.bold.cyan('🔗 TransLink I18n'));
    console.log(chalk.gray(message));
    console.log();
  }
}

export const logger = Logger.getInstance();
```

#### 配置管理

创建 `packages/cli/src/utils/config.ts`：

```typescript
import { resolve, dirname } from 'path';
import { existsSync, readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import type { I18nConfig } from '../types/config.js';
import { logger } from './logger.js';

export const DEFAULT_CONFIG: I18nConfig = {
  extract: {
    patterns: ['src/**/*.{vue,tsx,ts,jsx,js}'],
    exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    functions: ['t', '$tsl', 'i18n.t'],
    extensions: ['.vue', '.tsx', '.ts', '.jsx', '.js'],
  },
  hash: {
    algorithm: 'sha256',
    length: 8,
    includeContext: true,
    contextFields: ['componentName', 'functionName'],
  },
  languages: {
    default: 'zh-CN',
    supported: ['zh-CN', 'en-US'],
    fallback: 'zh-CN',
  },
  output: {
    directory: 'src/locales',
    format: 'json',
    splitByNamespace: false,
    flattenKeys: false,
  },
  vika: {
    apiKey: process.env.VIKA_API_KEY || '',
    datasheetId: process.env.VIKA_DATASHEET_ID || '',
    autoSync: false,
    syncInterval: 3600, // 1 hour
  },
  plugins: [],
};

export class ConfigManager {
  private config: I18nConfig | null = null;
  private configPath: string | null = null;

  async loadConfig(cwd = process.cwd()): Promise<I18nConfig> {
    if (this.config) {
      return this.config;
    }

    const configFiles = [
      'translink.config.ts',
      'translink.config.js',
      'i18n.config.ts',
      'i18n.config.js',
    ];

    for (const configFile of configFiles) {
      const configPath = resolve(cwd, configFile);
      if (existsSync(configPath)) {
        this.configPath = configPath;
        this.config = await this.loadConfigFile(configPath);
        logger.debug(`Loaded config from ${configPath}`);
        return this.config;
      }
    }

    logger.warn('No config file found, using default configuration');
    this.config = DEFAULT_CONFIG;
    return this.config;
  }

  private async loadConfigFile(configPath: string): Promise<I18nConfig> {
    try {
      let config: any;
      
      if (configPath.endsWith('.ts') || configPath.endsWith('.js')) {
        // 动态导入配置文件
        const fileUrl = pathToFileURL(configPath).href;
        const module = await import(fileUrl);
        config = module.default || module;
      } else {
        // JSON 配置
        const content = readFileSync(configPath, 'utf-8');
        config = JSON.parse(content);
      }

      // 合并默认配置
      return this.mergeConfig(DEFAULT_CONFIG, config);
    } catch (error) {
      logger.error(`Failed to load config from ${configPath}: ${error}`);
      throw error;
    }
  }

  private mergeConfig(defaultConfig: I18nConfig, userConfig: any): I18nConfig {
    return {
      extract: { ...defaultConfig.extract, ...userConfig.extract },
      hash: { ...defaultConfig.hash, ...userConfig.hash },
      languages: { ...defaultConfig.languages, ...userConfig.languages },
      output: { ...defaultConfig.output, ...userConfig.output },
      vika: { ...defaultConfig.vika, ...userConfig.vika },
      plugins: userConfig.plugins || defaultConfig.plugins,
    };
  }

  getConfig(): I18nConfig {
    if (!this.config) {
      throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  getConfigPath(): string | null {
    return this.configPath;
  }
}

export const configManager = new ConfigManager();
```

### 构建配置

创建 `packages/cli/tsup.config.ts`：

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm'],
  target: 'node16',
  clean: true,
  dts: false,
  sourcemap: true,
  splitting: false,
  minify: false,
  external: ['gogocode'],
  banner: {
    js: '',
  },
  esbuildOptions(options) {
    options.mainFields = ['module', 'main'];
  },
});
```

### 验证构建和运行

```bash
# 构建 CLI 工具
cd packages/cli && pnpm build

# 测试 CLI 工具
node dist/cli.js --help

# 测试 init 命令
node dist/cli.js init --help
```

## ✅ 验证检查清单

- [ ] 项目结构创建完成
- [ ] pnpm 工作区配置正确
- [ ] Turborepo 构建管道工作正常
- [ ] TypeScript 项目引用配置正确
- [ ] ESLint 和 Prettier 配置生效
- [ ] 依赖安装成功
- [ ] CLI 工具构建成功
- [ ] CLI 工具基本功能验证通过

## 🎯 关键学习要点

1. **Monorepo 架构优势**：
   - 代码共享和重用
   - 统一的构建和发布流程
   - 更好的依赖管理

2. **pnpm 工作区特性**：
   - 符号链接减少磁盘占用
   - catalog 功能统一版本管理
   - 更快的安装速度

3. **Turborepo 缓存机制**：
   - 增量构建提升效率
   - 智能缓存避免重复工作
   - 并行执行加速构建

4. **TypeScript 项目引用**：
   - 增量编译提升开发体验
   - 跨包类型安全
   - 更好的 IDE 支持

## 🚀 下一步计划

完成基础架构搭建后，接下来将进入：
- **阶段二**：CLI 工具核心功能开发
- **阶段三**：运行时库实现
- **阶段四**：Vite 插件开发
- **阶段五**：测试和文档完善

---

*本教程详细记录了 TransLink I18n 项目的基础架构搭建过程，可作为类似项目的参考模板。*
