/**
 * 更新调度器
 * 使用 requestIdleCallback 批量处理更新，提升性能
 */

export type UpdateCallback = () => void;

export interface SchedulerOptions {
  timeout?: number; // 超时时间（毫秒）
  priority?: 'high' | 'normal' | 'low';
}

export class UpdateScheduler {
  private pendingUpdates = new Set<UpdateCallback>();
  private isScheduled = false;
  private defaultTimeout = 1000; // 1秒

  /**
   * 调度一个更新
   */
  schedule(callback: UpdateCallback, options: SchedulerOptions = {}): void {
    this.pendingUpdates.add(callback);

    if (!this.isScheduled) {
      this.isScheduled = true;
      this.requestUpdate(options);
    }
  }

  /**
   * 立即执行所有待处理的更新
   */
  flush(): void {
    this.executeUpdates();
  }

  /**
   * 清除所有待处理的更新
   */
  clear(): void {
    this.pendingUpdates.clear();
    this.isScheduled = false;
  }

  /**
   * 获取待处理更新的数量
   */
  getPendingCount(): number {
    return this.pendingUpdates.size;
  }

  /**
   * 请求更新
   */
  private requestUpdate(options: SchedulerOptions): void {
    const timeout = options.timeout ?? this.defaultTimeout;

    if (this.supportsRequestIdleCallback()) {
      // 使用 requestIdleCallback（推荐）
      const idleOptions: IdleRequestOptions = {
        timeout,
      };

      requestIdleCallback(deadline => {
        this.executeUpdatesWithDeadline(deadline);
      }, idleOptions);
    } else if (options.priority === 'high') {
      // 高优先级：使用 requestAnimationFrame
      requestAnimationFrame(() => {
        this.executeUpdates();
      });
    } else {
      // 降级方案：使用 setTimeout
      setTimeout(() => {
        this.executeUpdates();
      }, 0);
    }
  }

  /**
   * 执行更新（带 deadline）
   */
  private executeUpdatesWithDeadline(deadline: IdleDeadline): void {
    const updates = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    this.isScheduled = false;

    // 在空闲时间内尽可能多地执行更新
    for (const callback of updates) {
      try {
        callback();

        // 如果没有剩余时间了，将剩余更新重新调度
        if (deadline.timeRemaining() <= 0) {
          const remaining = updates.slice(updates.indexOf(callback) + 1);
          remaining.forEach(cb => this.pendingUpdates.add(cb));

          if (this.pendingUpdates.size > 0) {
            this.isScheduled = true;
            this.requestUpdate({});
          }
          break;
        }
      } catch (error) {
        console.error('[UpdateScheduler] Error executing update:', error);
      }
    }
  }

  /**
   * 执行所有更新
   */
  private executeUpdates(): void {
    const updates = Array.from(this.pendingUpdates);
    this.pendingUpdates.clear();
    this.isScheduled = false;

    for (const callback of updates) {
      try {
        callback();
      } catch (error) {
        console.error('[UpdateScheduler] Error executing update:', error);
      }
    }
  }

  /**
   * 检查是否支持 requestIdleCallback
   */
  private supportsRequestIdleCallback(): boolean {
    return (
      typeof window !== 'undefined' &&
      'requestIdleCallback' in window &&
      typeof window.requestIdleCallback === 'function'
    );
  }
}

// 全局单例
let globalScheduler: UpdateScheduler | null = null;

/**
 * 获取全局调度器实例
 */
export function getGlobalScheduler(): UpdateScheduler {
  if (!globalScheduler) {
    globalScheduler = new UpdateScheduler();
  }
  return globalScheduler;
}

/**
 * 调度一个更新（使用全局调度器）
 */
export function scheduleUpdate(
  callback: UpdateCallback,
  options?: SchedulerOptions
): void {
  getGlobalScheduler().schedule(callback, options);
}

/**
 * 批量调度多个更新
 */
export function batchUpdates(
  callbacks: UpdateCallback[],
  options?: SchedulerOptions
): void {
  const scheduler = getGlobalScheduler();
  callbacks.forEach(callback => scheduler.schedule(callback, options));
}
