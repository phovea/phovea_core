/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
'use strict';

export interface IEventHandler {
  on(events, handler);
  off(events, handler);
}

export interface IDataBinding {
  data(key : string) : any;
  data(key : string, value: any) : any;
}

/**
 * basic interface of an event
 */
export interface IEvent {
  type: string;
  currentTarget: IEventHandler;
  target: IEventHandler;
  delegateTarget: IEventHandler;
  timeStamp: Date;
  args: any[];

  isPropagationStopped();
  stopPropagation();
  isImmediatePropagationStopped();
  stopImmediatePropagation();
}

export interface IEventListener {
  (event: IEvent, ...args:any[]) : void;
}

class Event implements IEvent {
  timeStamp = new Date();
  private stopped = false;
  private stopedPropagation = false;

  constructor(public type: string, public args: any[], public target: IEventHandler, public delegateTarget : IEventHandler) {

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
  private listeners : IEventListener[] = [];
  constructor(type: string) {

  }

  push(listener: IEventListener) {
    this.listeners.push(listener);
  }
  remove(listener: IEventListener) {
    var i = this.listeners.indexOf(listener);
    if (i >= 0) {
      this.listeners.splice(i,1);
      return true;
    }
    return false;
  }
  fire(event: IEvent) {
    if (this.listeners.length === 0) {
      return false;
    }
    var largs = [event].concat(event.args);
    if (this.listeners.length === 1) {
      this.listeners[0].apply(event, largs);
    } else {
      //work on a copy in case the number changes
      var l = this.listeners.slice(), ll = l.length;
      for (var i = 0; i < l.length && !event.isImmediatePropagationStopped(); ++i) {
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
/**
 * EventHandler base class, in the backend JQuery is used
 */
export class EventHandler implements IEventHandler {
  private handlers : any = {};

  /**
   * register a global event handler
   * @param events
   * @param handler
   */
  on(events: string, handler) {
    events.split(',').forEach((event) => {
      if (!this.handlers.hasOwnProperty(event)) {
        this.handlers[event] = new SingleEventHandler(event);
      }
      this.handlers[event].push(handler);
    });
    return this;
  }

  /**
   * unregister a global event handler
   * @param events
   * @param handler
   */
  off(events: string, handler) {
    events.split(',').forEach((event) => {
      if (this.handlers.hasOwnProperty(event)) {
        var h : SingleEventHandler = this.handlers[event];
        h.remove(handler);
        if (h.length === 0) {
          delete this.handlers[event];
        }
      }
    });
    return this;
  }


  /**
   * list all registered Events
   */
  list() {
    var r = {};
    Object.keys(this.handlers).forEach((type) => {
      r[type] = this.handlers[type].length;
    });
    return r;
  }


  /**
   * fires an event
   * @param event
   * @param args
   */
  fire(events: string, ...args: any[]) {
    events.split(',').forEach((event) => {
      this.fireEvent(createEvent(event, args, this));
    });
    return this;
  }

  private fireEvent(event: Event) {
    if (this.handlers.hasOwnProperty(event.type)) {
      var h : SingleEventHandler = this.handlers[event.type];
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
    progatee.on(events.join(','), (event: IEvent) => {
      if (!event.isPropagationStopped()) {
        this.fireEvent(propagateEvent(event, this));
      }
    });
  }
}

var global = new EventHandler();
/**
 * register a global event handler
 * @param events
 * @param handler
 */
export var on = global.on.bind(global);
/**
 * unregister a global event handler
 * @param events
 * @param handler
 */
export var off = global.off.bind(global);
/**
 * fires an event
 * @param event
 * @param extraArguments
 */
export var fire = global.fire.bind(global);
/**
 * list all events
 */
export var list = global.list.bind(global);

