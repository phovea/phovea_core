import i18next from 'i18next';
import {list} from '../plugin';
import {EP_PHOVEA_CORE_LOCALE} from '../extensions';

const DEFAULT_LANGUAGE = 'en';


/**
 *  Awaits the translation files registered at the EP_PHOVEA_CORE_LOCALE extension point
 *  Initialize I18next with the translation files
 */
export async function initializeI18next() {
  const plugins = await Promise.all(list(EP_PHOVEA_CORE_LOCALE).map((pluginDesc) => {
    return pluginDesc.load().then((locale) => {
      return {
        lng: pluginDesc.lng,
        ns: pluginDesc.ns,
        resources: locale.factory(),
        order: pluginDesc.order
      };
    });
  }));

  return i18next
    .init({
      debug: true,
      appendNamespaceToCIMode: true,
      interpolation: {
        escapeValue: true,
        format: (value, format) => {
          if (format === 'uppercase') {return value.toUpperCase();}
          if (format === 'lowercase') {return value.toLowerCase();}
          return value;
        }
      },
      lng: DEFAULT_LANGUAGE,
      // ns: ['namespace1','namespace2','namespace3', ...],
      defaultNS: '',
      // fallbackNS: 'fallback namespace',
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
