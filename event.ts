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

  /**
   * register a global event handler
   * @param events
   * @param handler
   */
  on(events, handler) {
    this.$obj.on(events, handler);
    return this;
  }

  /**
   * unregister a global event handler
   * @param events
   * @param handler
   */
  off(events, handler) {
    this.$obj.off(events, handler);
    return this;
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
      progatee.on(event, () => {
        var a = Array.prototype.slice.call(arguments);
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
