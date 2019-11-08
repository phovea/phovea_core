import i18next from 'i18next';

import translation from '../assets/locales/en/phovea.json';
import {list} from '../plugin';
import {EP_PHOVEA_CORE_LOCALE} from '../extensions';

const DEFAULT_LANGUAGE = 'en';

class PhoveaBackend implements i18next.BackendModule {
  type:'backend' = 'backend'; // necessary for i18next typings
  static type = 'backend'; // necessary for i18next plugin loading

  init(services: i18next.Services, backendOptions: i18next.TOptions, i18nextOptions: i18next.InitOptions): void {
    console.log('init', services, backendOptions, i18nextOptions);
  }

  read(language: string, namespace: string, callback: i18next.ReadCallback): void {
    console.log('read', language, namespace);
    setTimeout(() => {

      callback(null, {
        'common': {
          'group': 'Group from CLUE',
          'test': {
            'foo': 'baz from CLUE'
          }
        }
      });
    }, 500);
  }

  /**
   * Save the missing translation
   */
  create(languages: string[], namespace: string, key: string, fallbackValue: string): void {
    console.log('create', languages, namespace, key, fallbackValue);
  }

  /**
   * Load multiple languages and namespaces. For backends supporting multiple resources loading
   */
  readMulti(languages: string[], namespaces: string[], callback: i18next.ReadCallback): void {
    console.log('readMulti', languages, namespaces, callback);
  }

  /**
   * Store the translation. For backends acting as cache layer
   */
  save(language: string, namespace: string, data: i18next.ResourceLanguage): void {
    console.log('save', language, namespace, data);
  }
}


i18next
  .use(PhoveaBackend)
  .init({
    debug: true,
    appendNamespaceToCIMode: true,
    interpolation: {
      escapeValue: true,
      format: (value, format, lng) => {
        if (format === 'uppercase') {return value.toUpperCase();}
        if (format === 'lowercase') {return value.toLowerCase();}
        return value;
      }
    },
    lng: DEFAULT_LANGUAGE,
    ns: ['phovea'],
    defaultNS: 'phovea',
    fallbackNS: 'phovea'
    // initImmediate: false
  }); 

console.log(i18next.t('phovea:common.group'));
list(EP_PHOVEA_CORE_LOCALE).forEach((pluginDesc) => {
  pluginDesc.load().then((locale) => {
    console.log('load json', locale.factory());
  });
});

//i18next.addResourceBundle(defaultLanguage, 'phovea', translation.phovea, true, true);


export const t: i18next.TFunction = i18next.t;

export default i18next;
