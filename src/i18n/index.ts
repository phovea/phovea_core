import i18next from 'i18next';
import {list} from '../plugin';
import {EP_PHOVEA_CORE_LOCALE, ILocaleEPDesc} from '../extensions';

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_NAMESPACE = 'default_namespace';

/**
 *  Awaits the translation files registered at the EP_PHOVEA_CORE_LOCALE extension point
 *  Initialize I18next with the translation files
 */
export async function initI18n() {
  const plugins = await Promise.all(list(EP_PHOVEA_CORE_LOCALE).map((pluginDesc: ILocaleEPDesc) => {
    return pluginDesc.load().then((locale) => {
      return {
        lng: pluginDesc.lng || DEFAULT_LANGUAGE,
        ns: pluginDesc.ns || DEFAULT_NAMESPACE,
        resources: locale.factory(),
        order: pluginDesc.order || 0
      };
    });
  }));

  return i18next
    .use({
      type: 'postProcessor',
      name: 'showKeyDebugger',
      process: (value, key, option, translator) => translator.options.debug ? key : value
    })
    .init({
      debug: false,
      appendNamespaceToCIMode: true,
      interpolation: {
        escapeValue: true,
        format: (value, format) => {
          if (format === 'uppercase') {return value.toUpperCase();}
          if (format === 'lowercase') {return value.toLowerCase();}
          return value;
        }
      },
      ns: DEFAULT_NAMESPACE,
      defaultNS: DEFAULT_NAMESPACE,
      lng: DEFAULT_LANGUAGE,
      fallbackLng: DEFAULT_LANGUAGE,
      postProcess: ['showKeyDebugger']
    })
    .then(() => {
      /* For each plugin add the resources to the i18next configuration
         If plugins have same language and namespace the  one with greater order
         overwrites the others
      */
      plugins.sort((pluginA, pluginB) => pluginA.order - pluginB.order).forEach((plugin) => {
        i18next.addResourceBundle(plugin.lng, plugin.ns, plugin.resources, true, true);
      });
    });
}

export default i18next;
