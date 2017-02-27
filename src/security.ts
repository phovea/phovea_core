/**
 * Created by sam on 27.02.2017.
 */


import {retrieve, store} from './session';
import {fire} from './event';

export const GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';
export const GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';

export interface IUser {
  /**
   * user name
   */
  readonly name: string;
  /**
   * list of roles the user is associated with
   */
  readonly roles: string[];
}

export function isLoggedIn() {
  return retrieve('logged_in') === true;
}

/**
 * stores the given user information
 * @param user
 */
export function login(user: {name: string}) {
  store('logged_in', true);
  store('username', user.name);
  store('user', user);
  fire(GLOBAL_EVENT_USER_LOGGED_IN, user);
}

/**
 * logs the current user out
 */
export function logout() {
  const wasLoggedIn = isLoggedIn();
  store('logged_in', false);
  if (wasLoggedIn) {
    fire(GLOBAL_EVENT_USER_LOGGED_OUT);
  }
}

export const ANONYMOUS_USER: IUser = {name: 'anonymous', roles: ['anonymous']};

/**
 * returns the current user or null
 * @returns {any}
 */
export function currentUser(): IUser|null {
  if (!isLoggedIn()) {
    return null;
  }
  return retrieve('user', ANONYMOUS_USER);
}

export function currentUserNameOrAnonymous() {
  const u = currentUser();
  return u ? u.name : ANONYMOUS_USER.name;
}
