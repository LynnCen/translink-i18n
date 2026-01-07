/**
 * 轻量级事件发射器
 */

export type EventListener<T = any> = (data: T) => void;

export class EventEmitter {
  private events = new Map<string, Set<EventListener>>();

  /**
   * 添加事件监听器
   */
  on<T = any>(event: string, listener: EventListener<T>): this {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }

    this.events.get(event)!.add(listener);
    return this;
  }

  /**
   * 添加一次性事件监听器
   */
  once<T = any>(event: string, listener: EventListener<T>): this {
    const onceWrapper = (data: T) => {
      listener(data);
      this.off(event, onceWrapper);
    };

    return this.on(event, onceWrapper);
  }

  /**
   * 移除事件监听器
   */
  off<T = any>(event: string, listener?: EventListener<T>): this {
    if (!this.events.has(event)) {
      return this;
    }

    const listeners = this.events.get(event)!;

    if (listener) {
      listeners.delete(listener);
    } else {
      listeners.clear();
    }

    if (listeners.size === 0) {
      this.events.delete(event);
    }

    return this;
  }

  /**
   * 触发事件
   */
  emit<T = any>(event: string, data?: T): boolean {
    if (!this.events.has(event)) {
      return false;
    }

    const listeners = this.events.get(event)!;

    for (const listener of listeners) {
      try {
        listener(data);
      } catch (error) {
        console.error(`Error in event listener for "${event}":`, error);
      }
    }

    return listeners.size > 0;
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }

    return this;
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size || 0;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): string[] {
    return Array.from(this.events.keys());
  }
}
