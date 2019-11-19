import {IPluginDesc, IPlugin} from './plugin';
import {IUser} from './security';

/**
 * Triggered when a user was logged in
 */
export const EP_PHOVEA_CORE_LOGIN = 'epPhoveaCoreLogin';

export interface ILoginExtensionPoint {
  /**
   * @param user {IUser} The user object that was logged in
   */
  factory(user: IUser): void;
}

export interface ILoginExtensionPointDesc extends IPluginDesc {
  load(): Promise<IPlugin & ILoginExtensionPoint>;
}


/**
 * Triggered when a user was logged out. Does not provide any further information.
 */
export const EP_PHOVEA_CORE_LOGOUT = 'epPhoveaCoreLogout';

export interface ILogoutExtensionPoint {
  factory(): void;
}

export interface ILogoutExtensionPointDesc extends IPluginDesc {
  load(): Promise<IPlugin & ILogoutExtensionPoint>;
}
