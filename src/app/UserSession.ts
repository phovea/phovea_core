/**
 * Created by sam on 27.02.2017.
 */


import {Session} from '../base/Session';
import {IUser,UserUtils,ISecureItem, Permission, EPermission, EEntity} from '../security';
import {EventHandler} from '../base/event';
import {PluginRegistry} from './PluginRegistry';
import {ILoginExtensionPointDesc, ILogoutEP, ILogoutEPDesc, ILoginExtensionPoint, EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT} from './extensions';



export class UserSession extends Session {

  public static GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';
  public static GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';
  /**
   * resets the stored session data that will be automatically filled during login
   */
  public reset() {
    this.remove('logged_in');
    this.remove('username');
    this.remove('user');
  }

  /**
   * whether the user is logged in
   * @returns {boolean}
   */
  public isLoggedIn() {
    return this.retrieve('logged_in') === true;
  }

  /**
   * stores the given user information
   * @param user
   */
  public login(user: IUser) {
    this.store('logged_in', true);
    this.store('username', user.name);
    this.store('user', user);

    PluginRegistry.getInstance().listPlugins(EP_PHOVEA_CORE_LOGIN).map((desc: ILoginExtensionPointDesc) => {
      desc.load().then((plugin: ILoginExtensionPoint) => plugin.factory(user));
    });

    EventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, user);
  }

  /**
   * logs the current user out
   */
  public logout() {
    const wasLoggedIn = this.isLoggedIn();
    this.reset();
    if (wasLoggedIn) {
      PluginRegistry.getInstance().listPlugins(EP_PHOVEA_CORE_LOGOUT).map((desc: ILogoutEPDesc) => {
        desc.load().then((plugin: ILogoutEP) => plugin.factory());
      });

      EventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT);
    }
  }


  /**
   * returns the current user or null
   * @returns {any}
   */
  public currentUser(): IUser|null {
    if (!this.isLoggedIn()) {
      return null;
    }
    return this.retrieve('user', UserUtils.ANONYMOUS_USER);
  }

  /**
   * returns the current user name else an anonymous user name
   */
  public currentUserNameOrAnonymous() {
    const u = this.currentUser();
    return u ? u.name : UserUtils.ANONYMOUS_USER.name;
  }

  public can(item: ISecureItem, permission: EPermission, user = this.currentUser()): boolean {
    if (!user) {
      user = UserUtils.ANONYMOUS_USER;
    }
    const permissions = Permission.decode(item.permissions);

    // I'm the creator and have the right
    if (this.isEqual(user.name, item.creator) && permissions.user.has(permission)) {
      return true;
    }

    // check if I'm in the group and have the right
    if (item.group && this.includes(user.roles, item.group) && permissions.group.has(permission)) {
      return true;
    }

    // check if I'm a buddy having the right
    if (item.buddies && Array.isArray(item.buddies) && this.includes(item.buddies, user.name) && permissions.buddies.has(permission)) {
      return true;
    }

    // check others
    return permissions.others.has(permission);
  }

  /**
   * check whether the given user can read the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canRead(item: ISecureItem, user = this.currentUser()) {
    return this.can(item, EPermission.READ, user);
  }

  /**
   * check whether the given user can write the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canWrite(item: ISecureItem, user = this.currentUser()) {
    return this.can(item, EPermission.WRITE, user);
  }

  /**
   * check whether the given user can execute the given item
   * @param item the item to check
   * @param user the user by default the current user
   * @returns {boolean}
   */
  public canExecute(item: ISecureItem, user = this.currentUser()) {
    return this.can(item, EPermission.EXECUTE, user);
  }


  public hasPermission(item: ISecureItem, entity: EEntity = EEntity.USER, permission: EPermission = EPermission.READ) {
    const permissions = Permission.decode(item.permissions);
    return permissions.hasPermission(entity, permission);
  }
  private isEqual(a: string, b: string) {
    if (a === b) {
      return true;
    }
    if (a === null || b === null) {
      return false;
    }
    a = a.toLowerCase();
    b = b.toLowerCase();
    return a.localeCompare(b) === 0;
  }

  private includes(items: string[], item: string) {
    if (!item) {
      return false;
    }
    return items.some((r) => this.isEqual(item, r));
  }

  private static instance: UserSession;
  public static getInstance(): UserSession {
    if (!UserSession.instance) {
      UserSession.instance = new UserSession();
    }

    return UserSession.instance;
  }
}

