import {IPluginDesc, IPlugin} from './plugin';
import {IUser} from './security';

/**
 * Triggered when a user was logged in
 */
export const EP_PHOVEA_CORE_LOGIN = 'epPhoveaCoreLogin';

export interface ILoginExtension {
  /**
   * @param user {IUser} The user object that was logged in
   */
  factory(user: IUser): void;
}

export interface ILoginExtensionDesc extends IPluginDesc {
  load(): Promise<IPlugin & ILoginExtension>;
}


/**
 * Triggered when a user was logged out. Does not provide any further information.
 */
export const EP_PHOVEA_CORE_LOGOUT = 'epPhoveaCoreLogout';

export interface ILogoutExtension {
  factory(): void;
}

export interface ILogoutExtensionDesc extends IPluginDesc {
  load(): Promise<IPlugin & ILogoutExtension>;
}
