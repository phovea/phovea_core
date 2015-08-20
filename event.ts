/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
/// <reference path="../../tsd.d.ts" />
import $ = require('jquery');
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
 * EventHandler base class, in the backend JQuery is used
 */
export class EventHandler implements IEventHandler {
  private $obj = $({});
  private eventList = {};

  /**
   * register a global event handler
   * @param events
   * @param handler
   */
  on(events, handler) {
    this.$obj.on(events, handler);
    if (!this.eventList[events]) {
      this.eventList[events] = 0;
    }
    this.eventList[events] += 1;
    return this;
  }

  /**
   * unregister a global event handler
   * @param events
   * @param handler
   */
  off(events, handler) {
    this.$obj.off(events, handler);

    if (this.eventList[events]) {
      if (this.eventList[events] > 1) {
        this.eventList[events] -= 1;
      }
      else {
        delete this.eventList[events];
      }
    }

    return this;
  }


  /**
   * list all registered Events
   */
  list(){
    return this.eventList;
  }


  /**
   * fires an event
   * @param event
   * @param extraArguments
   */
  fire(event, ...extraArguments: any[]) {
    this.$obj.trigger(event, extraArguments);
    return this;
  }

  /**
   * registers on the given event handler and propagates the given events to itself
   * @param progatee
   * @param events
   */
  propagate(progatee: IEventHandler, ...events: string[]) {
    var that = this;
    events.forEach((event) => {
      progatee.on(event, (...args: any[]) => {
        var a = Array.prototype.slice.call(args);
        a[0] = event; //replace the event object with the type
        that.fire.apply(that, a);
      });
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

