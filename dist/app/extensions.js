export var LoginExtensionPoint;
(function (LoginExtensionPoint) {
    /**
     * Triggered when a user was logged in
     */
    LoginExtensionPoint.EP_PHOVEA_CORE_LOGIN = 'epPhoveaCoreLogin';
})(LoginExtensionPoint || (LoginExtensionPoint = {}));
export var LogoutExtensionPoint;
(function (LogoutExtensionPoint) {
    /**
     * Triggered when a user was logged out. Does not provide any further information.
     */
    LogoutExtensionPoint.EP_PHOVEA_CORE_LOGOUT = 'epPhoveaCoreLogout';
})(LogoutExtensionPoint || (LogoutExtensionPoint = {}));
export var LocaleExtensionPointDesc;
(function (LocaleExtensionPointDesc) {
    /**
     * Load locale JSON files with translations
     */
    LocaleExtensionPointDesc.EP_PHOVEA_CORE_LOCALE = 'epPhoveaCoreLocale';
})(LocaleExtensionPointDesc || (LocaleExtensionPointDesc = {}));
//# sourceMappingURL=extensions.js.map