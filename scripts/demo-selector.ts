#!/usr/bin/env node

import { spawn, type ChildProcess } from 'node:child_process';
import { readdir, access } from 'node:fs/promises';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

// 获取项目根目录路径
const rootDir = process.cwd();
const playgroundDir = join(rootDir, 'apps/playground');

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
} as const;

// Demo 配置接口
interface DemoConfig {
  name: string;
  description: string;
  port: number | null;
  command: string;
  packageName: string;
}

// Demo 实例接口
interface Demo extends DemoConfig {
  id: string;
  path: string;
}

// Demo 配置
const demoConfigs: Record<string, DemoConfig> = {
  'vue-demo': {
    name: '🔥 Vue 3 Demo',
    description: 'Vue 3 + Composition API + Vite 示例',
    port: 3000,
    command: 'dev',
    packageName: 'translink-i18n-vue-demo',
  },
  'react-demo': {
    name: '⚛️ React Demo',
    description: 'React 18 + TypeScript + Vite 示例',
    port: 3001,
    command: 'dev',
    packageName: 'translink-i18n-react-demo',
  },
  'typescript-demo': {
    name: '📘 TypeScript Demo',
    description: 'Pure TypeScript 示例',
    port: null,
    command: 'dev',
    packageName: 'translink-i18n-typescript-demo',
  },
  'javascript-demo': {
    name: '📙 JavaScript Demo',
    description: 'Pure JavaScript 示例',
    port: null,
    command: 'start',
    packageName: '@translink/javascript-demo',
  },
};

/**
 * 获取可用的 demo 项目
 */
async function getAvailableDemos(): Promise<Demo[]> {
  try {
    const items = await readdir(playgroundDir, { withFileTypes: true });
    const demos: Demo[] = [];

    for (const item of items) {
      if (item.isDirectory() && demoConfigs[item.name]) {
        const demoPath = join(playgroundDir, item.name);
        const packageJsonPath = join(demoPath, 'package.json');

        try {
          await access(packageJsonPath);
          demos.push({
            id: item.name,
            path: demoPath,
            ...demoConfigs[item.name],
          });
        } catch (error) {
          // 忽略没有 package.json 的目录
          console.warn(
            `${colors.yellow}⚠️  跳过目录 ${item.name}: 缺少 package.json${colors.reset}`
          );
        }
      }
    }

    return demos;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `${colors.red}❌ 无法读取 playground 目录: ${errorMessage}${colors.reset}`
    );
    return [];
  }
}

/**
 * 显示 demo 列表
 */
function displayDemos(demos: Demo[]): void {
  console.log(
    `\n${colors.bright}${colors.cyan}🎮 TransLink I18n Demo 选择器${colors.reset}\n`
  );

  if (demos.length === 0) {
    console.log(`${colors.yellow}⚠️  未找到可用的 demo 项目${colors.reset}`);
    return;
  }

  console.log(`${colors.bright}可用的 Demo 项目:${colors.reset}\n`);

  demos.forEach((demo, index) => {
    const portInfo = demo.port
      ? `${colors.blue}(端口: ${demo.port})${colors.reset}`
      : '';
    console.log(
      `${colors.green}${index + 1}.${colors.reset} ${demo.name} ${portInfo}`
    );
    console.log(`   ${colors.white}${demo.description}${colors.reset}`);
    console.log(
      `   ${colors.magenta}路径: apps/playground/${demo.id}${colors.reset}\n`
    );
  });
}

/**
 * 运行选定的 demo
 */
function runDemo(demo: Demo): void {
  console.log(
    `${colors.bright}${colors.green}🚀 启动 ${demo.name}...${colors.reset}\n`
  );

  const child: ChildProcess = spawn(
    'pnpm',
    ['--filter', demo.packageName, 'run', demo.command],
    {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    }
  );

  child.on('error', error => {
    console.error(`${colors.red}❌ 启动失败: ${error.message}${colors.reset}`);
    process.exit(1);
  });

  child.on('exit', code => {
    if (code !== 0) {
      console.error(
        `${colors.red}❌ Demo 退出，退出码: ${code}${colors.reset}`
      );
      process.exit(code || 1);
    }
  });

  // 处理 Ctrl+C
  process.on('SIGINT', () => {
    console.log(`\n${colors.yellow}🛑 正在停止 ${demo.name}...${colors.reset}`);
    child.kill('SIGINT');
  });
}

/**
 * 获取用户输入
 */
function getUserInput(question: string): Promise<string> {
  return new Promise(resolve => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * 查找 demo
 */
function findDemo(demos: Demo[], input: string): Demo | undefined {
  // 尝试按数字选择
  const num = parseInt(input, 10);
  if (num >= 1 && num <= demos.length) {
    return demos[num - 1];
  }

  // 尝试按名称选择
  return demos.find(
    d =>
      d.id === input ||
      d.id.includes(input.toLowerCase()) ||
      d.name.toLowerCase().includes(input.toLowerCase())
  );
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
${colors.bright}${colors.cyan}TransLink I18n Demo 选择器${colors.reset}

${colors.bright}用法:${colors.reset}
  node demo-selector.js [选项] [demo-id]

${colors.bright}选项:${colors.reset}
  --list, -l     显示所有可用的 demo 列表
  --help, -h     显示帮助信息

${colors.bright}示例:${colors.reset}
  node demo-selector.js              # 交互式选择
  node demo-selector.js vue-demo     # 直接启动 Vue demo
  node demo-selector.js --list       # 显示 demo 列表
  node demo-selector.js --help       # 显示帮助
`);
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  try {
    const demos = await getAvailableDemos();

    if (demos.length === 0) {
      displayDemos(demos);
      process.exit(1);
    }

    // 检查命令行参数
    const args = process.argv.slice(2);

    // 处理帮助参数
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }

    // 处理列表参数
    if (args.includes('--list') || args.includes('-l')) {
      displayDemos(demos);
      console.log(`${colors.bright}快速启动命令:${colors.reset}`);
      demos.forEach(demo => {
        const shortName = demo.id.replace('-demo', '');
        console.log(
          `${colors.green}pnpm demo:${shortName}${colors.reset} - 启动 ${demo.name}`
        );
      });
      console.log(`${colors.cyan}pnpm demo${colors.reset} - 交互式选择\n`);
      return;
    }

    // 处理直接启动参数
    if (args.length > 0 && !args[0].startsWith('--')) {
      const demoId = args[0];
      const demo = findDemo(demos, demoId);

      if (demo) {
        runDemo(demo);
        return;
      } else {
        console.log(`${colors.red}❌ 未找到 demo: ${demoId}${colors.reset}`);
        console.log(
          `${colors.yellow}💡 可用的 demo: ${demos.map(d => d.id).join(', ')}${colors.reset}\n`
        );
      }
    }

    // 交互式选择
    displayDemos(demos);

    const input = await getUserInput(
      `${colors.bright}请选择要运行的 Demo (1-${demos.length}) 或输入 demo 名称: ${colors.reset}`
    );

    const selectedDemo = findDemo(demos, input);

    if (selectedDemo) {
      runDemo(selectedDemo);
    } else {
      console.log(`${colors.red}❌ 无效的选择: ${input}${colors.reset}`);
      console.log(
        `${colors.yellow}💡 请输入 1-${demos.length} 之间的数字或有效的 demo 名称${colors.reset}`
      );
      process.exit(1);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`${colors.red}❌ 程序出错: ${errorMessage}${colors.reset}`);
    process.exit(1);
  }
}

// 启动程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(
      `${colors.red}❌ 未处理的错误: ${errorMessage}${colors.reset}`
    );
    process.exit(1);
  });
}
