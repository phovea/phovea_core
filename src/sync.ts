/**
 * Created by Samuel Gratzl on 01.12.2016.
 */

import {mixin} from './';
import {} from './idtype';

export interface ITabSyncerOptions {
  keyPrefix?: string;
  storage?: Storage;
}

class StoreWrapper {
  constructor(private storage: Storage, private prefix: string, onChange: (key: string, new_: string, old: string, url: string)=>void) {
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.storageArea === storage && event.key.startsWith(prefix)) {
        onChange(event.key.substring(prefix.length), event.newValue, event.oldValue, event.url);
      }
    });
  }

  private toFullKey(key: string) {
    return this.prefix + key;
  }

  setValue(key: string, value: any) {
    key = this.toFullKey(key);
    const bak = this.storage.getItem(key);
    this.storage.setItem(key, JSON.stringify(value));
    return bak;
  }

  deleteValue(key: string) {
    key = this.toFullKey(key);
    this.storage.removeItem(key);
  }

  includes(key: string) {
    key = this.toFullKey(key);
    return (this.storage.getItem(key) !== null);
  }

  getValue<T>(key: string, default_: T = null): T {
    key = this.toFullKey(key);
    const v = this.storage.getItem(key);
    return v !== null ? JSON.parse(v) : default_;
  }
}

export default class TabSyncer {
  private static TAB_LIST = 'tabList';

  private options: ITabSyncerOptions = {
    keyPrefix: 'tab-sync-',
    storage: localStorage
  };

  private store: StoreWrapper;

  constructor(options?: ITabSyncerOptions) {
    mixin(this.options, options);

    this.store = new StoreWrapper(this.options.storage, this.options.keyPrefix, this.handleChange.bind(this));

    this.registerTab(document.location.href);

    window.addEventListener('beforeunload', () => {
      this.unregisterTab(document.location.href);
    });
  }

  private registerTab(url: string) {
    const list = this.getTabList();
    list.push(url);
    this.store.setValue(TabSyncer.TAB_LIST, list);
  }

  private handleChange(key: string, new_: string, old: string, url: string) {
    console.log('change in local storage', key, new_, old, url);
  }

  private unregisterTab(url: string) {
    const list = this.getTabList();
    const i = list.indexOf(url);
    if (i >= 0) {
      list.splice(i,1);
      this.store.setValue(TabSyncer.TAB_LIST, list);
    }
  }

  getTabList(): string[] {
    return this.store.getValue(TabSyncer.TAB_LIST, <string[]>[]);
  }
}




