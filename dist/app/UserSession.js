/**
 * Created by sam on 27.02.2017.
 */
import { Session } from '../base/Session';
import { UserUtils, Permission, EPermission, EEntity } from '../security';
import { EventHandler } from '../base/event';
import { PluginRegistry } from './PluginRegistry';
import { EP_PHOVEA_CORE_LOGIN, EP_PHOVEA_CORE_LOGOUT } from './extensions';
export class UserSession extends Session {
    /**
     * resets the stored session data that will be automatically filled during login
     */
    reset() {
        this.remove('logged_in');
        this.remove('username');
        this.remove('user');
    }
    /**
     * whether the user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return this.retrieve('logged_in') === true;
    }
    /**
     * stores the given user information
     * @param user
     */
    login(user) {
        this.store('logged_in', true);
        this.store('username', user.name);
        this.store('user', user);
        PluginRegistry.getInstance().listPlugins(EP_PHOVEA_CORE_LOGIN).map((desc) => {
            desc.load().then((plugin) => plugin.factory(user));
        });
        EventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_IN, user);
    }
    /**
     * logs the current user out
     */
    logout() {
        const wasLoggedIn = this.isLoggedIn();
        this.reset();
        if (wasLoggedIn) {
            PluginRegistry.getInstance().listPlugins(EP_PHOVEA_CORE_LOGOUT).map((desc) => {
                desc.load().then((plugin) => plugin.factory());
            });
            EventHandler.getInstance().fire(UserSession.GLOBAL_EVENT_USER_LOGGED_OUT);
        }
    }
    /**
     * returns the current user or null
     * @returns {any}
     */
    currentUser() {
        if (!this.isLoggedIn()) {
            return null;
        }
        return this.retrieve('user', UserUtils.ANONYMOUS_USER);
    }
    /**
     * returns the current user name else an anonymous user name
     */
    currentUserNameOrAnonymous() {
        const u = this.currentUser();
        return u ? u.name : UserUtils.ANONYMOUS_USER.name;
    }
    can(item, permission, user = this.currentUser()) {
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
    canRead(item, user = this.currentUser()) {
        return this.can(item, EPermission.READ, user);
    }
    /**
     * check whether the given user can write the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canWrite(item, user = this.currentUser()) {
        return this.can(item, EPermission.WRITE, user);
    }
    /**
     * check whether the given user can execute the given item
     * @param item the item to check
     * @param user the user by default the current user
     * @returns {boolean}
     */
    canExecute(item, user = this.currentUser()) {
        return this.can(item, EPermission.EXECUTE, user);
    }
    hasPermission(item, entity = EEntity.USER, permission = EPermission.READ) {
        const permissions = Permission.decode(item.permissions);
        return permissions.hasPermission(entity, permission);
    }
    isEqual(a, b) {
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
    includes(items, item) {
        if (!item) {
            return false;
        }
        return items.some((r) => this.isEqual(item, r));
    }
    static getInstance() {
        if (!UserSession.instance) {
            UserSession.instance = new UserSession();
        }
        return UserSession.instance;
    }
}
UserSession.GLOBAL_EVENT_USER_LOGGED_IN = 'USER_LOGGED_IN';
UserSession.GLOBAL_EVENT_USER_LOGGED_OUT = 'USER_LOGGED_OUT';
//# sourceMappingURL=UserSession.js.map