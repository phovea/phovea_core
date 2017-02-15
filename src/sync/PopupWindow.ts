/**
 * Created by Samuel Gratzl on 15.02.2017.
 */

import {randomId, mixin} from '../';

export interface INodeVis {
  node: Element;
  destroy?();
}

export interface IPopupProxyOptions {
  args?: any[];
  name?: string;
}


export class PopupProxy<T extends INodeVis> {
  private current: T;
  private popup: Window;

  private options: IPopupProxyOptions = {
    args: [],
    name: `${self.document.title} PopUp ${randomId(3)}`
  };

  private handler: ProxyHandler<T> = {};

  constructor(private readonly parent: HTMLElement, private readonly factory: (parent: HTMLElement, ...args: any[]) => T, options: IPopupProxyOptions = {}) {
    this.options = mixin(this.options, options);
    this.build(this.parent);
  }

  private build(parent: HTMLElement) {
    this.current = this.factory(parent, ...this.options.args);
  }


  private buildPopup() {
    const serializer = new XMLSerializer();
    const links = Array.from(document.head.querySelectorAll('link')).map((link: HTMLLinkElement) => serializer.serializeToString(link));
    const template = `<!doctype html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>${this.options.name}</title>
          <meta name="description" content="">
          <meta name="viewport" content="width=device-width">
          <script src="//cdn.polyfill.io/v2/polyfill.min.js"></script>
          ${links.join('\n')}
      </head>
      <body class="popup-content">
      </body>
    </html>`;

    const blob = new Blob([template], {type: 'text/html'});
    return URL.createObjectURL(blob);
  }

  get proxy() {
    return new Proxy<T>(<T>{}, this.handler);
  }

  close() {
    if (this.current.destroy) {
      this.current.destroy();
    } else {
      this.current.node.remove();
    }
    this.current = null;
    this.parent.classList.remove('as-popup');
    this.build(this.parent);
  }

  open() {
    const rect = this.current.node.getBoundingClientRect();
    if (this.current.destroy) {
      this.current.destroy();
    } else {
      this.current.node.remove();
    }
    this.parent.classList.add('as-popup');
    this.current = null;
    this.popup = self.open(this.buildPopup(), this.options.name, `width=${rect.width},height=${rect.height},toolbar=0,menubar=0,location=0`);
    this.popup.onunload = () => this.close();
    const document = this.popup.document;
    if (document.readyState === 'ready') {
      this.build(document.body);
    } else {
      document.onload = () => this.build(document.body);
    }
  }
}

