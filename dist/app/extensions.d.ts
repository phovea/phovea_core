import { IPluginDesc, IPlugin } from '../base/plugin';
import { IUser } from '../security';
export declare module LoginExtensionPoint {
    /**
     * Triggered when a user was logged in
     */
    const EP_PHOVEA_CORE_LOGIN = "epPhoveaCoreLogin";
}
export interface ILoginExtensionPoint {
    /**
     * @param user {IUser} The user object that was logged in
     */
    factory(user: IUser): void;
}
export interface ILoginExtensionPointDesc extends IPluginDesc {
    load(): Promise<IPlugin & ILoginExtensionPoint>;
}
export declare module LogoutExtensionPoint {
    /**
     * Triggered when a user was logged out. Does not provide any further information.
     */
    const EP_PHOVEA_CORE_LOGOUT = "epPhoveaCoreLogout";
}
export interface ILogoutEP {
    factory(): void;
}
export interface ILogoutEPDesc extends IPluginDesc {
    load(): Promise<IPlugin & ILogoutEP>;
}
export declare module LocaleExtensionPointDesc {
    /**
     * Load locale JSON files with translations
     */
    const EP_PHOVEA_CORE_LOCALE = "epPhoveaCoreLocale";
}
export interface ILocaleEPDesc extends IPluginDesc {
    /**
     * Locale namespace that usually matches the resource filename (e.g., `phovea` and `phovea.json`)
     */
    ns?: string;
    /**
     * Language following the [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) (e.g., `en` or `en-US`)
     * Default value is `en`.
     */
    lng?: string;
    /**
     * Order of the locales, if two locales with the same namespace and language are found.
     * Locales with a higher the order number override the locales with lower order numbers.
     * Default value is  `0`.
     */
    order?: number;
}
