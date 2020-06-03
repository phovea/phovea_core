/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */

export interface IEventHandler {
  on(events: string|{[key: string]: IEventListener}, handler?: IEventListener): void;
  off(events: string|{[key: string]: IEventListener}, handler?: IEventListener): void;
}

export interface IDataBinding {
  data(key: string): any;
  data(key: string, value: any): any;
}

/**
 * basic interface of an event
 */
export interface IEvent {
  /**
   * type of the event
   */
  readonly type: string;
  readonly currentTarget: IEventHandler;
  readonly target: IEventHandler;
  readonly delegateTarget: IEventHandler;
  /**
   * creation date
   */
  readonly timeStamp: Date;
  /**
   * additional arguments given to the event
   */
  readonly args: any[];

  isPropagationStopped(): boolean;
  stopPropagation(): void;
  isImmediatePropagationStopped(): boolean;
  stopImmediatePropagation(): void;
}

export interface IEventListener {
  (event: IEvent, ...args: any[]): void;
}

class Event implements IEvent {
  readonly timeStamp = new Date();
  private stopped = false;
  private stopedPropagation = false;

  constructor(public readonly type: string, public readonly args: any[], public readonly target: IEventHandler, public readonly delegateTarget: IEventHandler) {

  }

  get currentTarget() {
    return this.target;
  }

  isImmediatePropagationStopped() {
    return this.stopped;
  }

  stopImmediatePropagation() {
    this.stopped = true;
  }

  isPropagationStopped() {
    return this.stopedPropagation;
  }

  stopPropagation() {
    this.stopedPropagation = true;
  }
}

class SingleEventHandler {
  private listeners: IEventListener[] = [];

  constructor(public readonly type: string) {
    //nothing else to do
  }

  push(listener: IEventListener) {
    this.listeners.push(listener);
  }

  remove(listener: IEventListener) {
    const i = this.listeners.indexOf(listener);
    if (i >= 0) {
      this.listeners.splice(i, 1);
      return true;
    }
    return false;
  }

  fire(event: IEvent) {
    if (this.listeners.length === 0) {
      return false;
    }
    const largs = [event].concat(event.args);
    if (this.listeners.length === 1) {
      this.listeners[0].apply(event, largs);
    } else {
      //work on a copy in case the number changes
      const l = this.listeners.slice(), ll = l.length;
      for (let i = 0; i < ll && !event.isImmediatePropagationStopped(); ++i) {
        l[i].apply(event, largs);
      }
    }
    return true;
  }

  get length() {
    return this.listeners.length;
  }
}

function createEvent(event: string, args: any[], target: IEventHandler) {
  return new Event(event, args, target, target);
}
function propagateEvent(event: IEvent, target: IEventHandler) {
  return new Event(event.type, event.args, target, event.target);
}

export interface IEventListener {
  (event: IEvent, ...args: any[]): any;
}
/**
 * EventHandler base class
 */
export class EventHandler implements IEventHandler {


  public static readonly MULTI_EVENT_SEPARATOR = ',';

  private readonly handlers = new Map<string, SingleEventHandler>();

  private readonly propagationHandler: IEventListener = (event: IEvent) => {
    if (!event.isPropagationStopped()) {
      EventHandler.getInstance().fireEvent(propagateEvent(event, EventHandler.getInstance()));
    }
  }

  /**
   * register a global event handler
   * @param events either one event string (multiple are supported using , as separator) or a map of event handlers
   * @param handler the handler in case of a given string
   */
  on(events: string|{[key: string]: IEventListener}, handler?: IEventListener) {
    if (typeof events === 'string') {
      events.split(EventHandler.MULTI_EVENT_SEPARATOR).forEach((event) => {
        if (!EventHandler.getInstance().handlers.has(event)) {
          EventHandler.getInstance().handlers.set(event, new SingleEventHandler(event));
        }
        EventHandler.getInstance().handlers.get(event).push(handler);
      });
    } else {
      Object.keys(events).forEach((event) => {
        const h = events[event];
        EventHandler.getInstance().on(event, h);
      });
    }
    return EventHandler.getInstance();
  }

  /**
   * unregister a global event handler
   * @param events
   * @param handler
   */
  off(events: string|{[key: string]: IEventListener}, handler?: IEventListener) {
    if (typeof events === 'string') {
      events.split(EventHandler.MULTI_EVENT_SEPARATOR).forEach((event) => {
        if (EventHandler.getInstance().handlers.has(event)) {
          const h: SingleEventHandler = EventHandler.getInstance().handlers.get(event);
          h.remove(handler);
          if (h.length === 0) {
            EventHandler.getInstance().handlers.delete(event);
          }
        }
      });
    } else {
      Object.keys(events).forEach((event) => {
        const h = events[event];
        EventHandler.getInstance().off(event, h);
      });
    }
    return EventHandler.getInstance();
  }


  /**
   * list for each registered event the number of listeners
   */
  getRegisteredHandlerCount(): {[key: string]: number} {
    const r: {[key: string]: number} = {};
    EventHandler.getInstance().handlers.forEach((handler, type) => {
      r[type] = handler.length;
    });
    return r;
  }


  /**
   * fires an event
   * @param events name(s) of the event
   * @param args additional arguments
   */
  fire(events: string, ...args: any[]) {
    events.split(EventHandler.MULTI_EVENT_SEPARATOR).forEach((event) => {
      EventHandler.getInstance().fireEvent(createEvent(event, args, EventHandler.getInstance()));
    });
    return EventHandler.getInstance();
  }

  private fireEvent(event: Event) {
    if (EventHandler.getInstance().handlers.has(event.type)) {
      const h: SingleEventHandler = EventHandler.getInstance().handlers.get(event.type);
      return h.fire(event);
    }
    return false;
  }

  /**
   * registers on the given event handler and propagates the given events to itself
   * @param progatee
   * @param events
   */
  propagate(progatee: IEventHandler, ...events: string[]) {
    progatee.on(events.join(EventHandler.MULTI_EVENT_SEPARATOR), EventHandler.getInstance().propagationHandler);
  }

  stopPropagation(progatee: IEventHandler, ...events: string[]) {
    progatee.off(events.join(EventHandler.MULTI_EVENT_SEPARATOR), EventHandler.getInstance().propagationHandler);
  }

  private static instance: EventHandler;

  public static getInstance(): EventHandler {
    if (!EventHandler.instance) {
      EventHandler.instance = new EventHandler();
    }
    return EventHandler.instance;
  }

}
