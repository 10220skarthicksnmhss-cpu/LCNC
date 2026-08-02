// src/events/event-bus.ts — In-process event emitter
import { EventEmitter } from 'events';
export { AppEvent } from './events';

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

export const eventBus = new EventBus();
