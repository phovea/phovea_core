/**
 * Created by Holger Stitz on 28.06.2017.
 */

export const TAG_VALUE_SEPARATOR = '=';

export enum PropertyType {
  NUMERICAL,
  CATEGORICAL,
  SET
}

export interface IProperty {
  type: PropertyType;
  text: string; // must be `text` because of Select2 usage
  values: IPropertyValue[]; // must be `children` because of Select2 usage
}

export interface IPropertyValue {
  type: PropertyType;
  id: string; // must be `id` because of Select2 usage
  text: string; // must be `text` because of Select2 usage
  payload: any;
  isSelected: boolean;
  isDisabled: boolean;
  needsInput: boolean;
}

export class Property implements IProperty {
  constructor(public type: PropertyType, public text:string, public values: IPropertyValue[]) {
    //
  }
}

class PropertyValue implements IPropertyValue {
  isSelected:boolean = false;
  isDisabled:boolean = false;
  needsInput:boolean = false;

  constructor(public type: PropertyType, public id:string, public text:string, public payload:any) {
    //
  }

  toJSON():any {
    const r:any = {
      type: this.type,
      id: this.id,
    };

    if(this.id !== this.text) {
      r.text = this.text;
    }

    if(this.payload !== undefined) {
      r.payload = this.payload;
    }

    return r;
  }
}

export function categoricalProperty(text:string, values:string[]|{text:string, id?:string}[]):IProperty {
  const vals:IPropertyValue[] = (<any>values).map((d) => createPropertyValue(PropertyType.CATEGORICAL, d));
  return new Property(PropertyType.CATEGORICAL, text, vals);
}

export function setProperty(text:string, values:string[]|{text:string, id?:string}[]):IProperty {
  const vals:IPropertyValue[] = (<any>values).map((d) => createPropertyValue(PropertyType.SET, d));
  return new Property(PropertyType.SET, text, vals);
}

export function numericalProperty(text:string, values:string[]|{text:string, id?:string}[], needsInput:boolean = false):IProperty {
  const textAddon = (needsInput) ? ` ${TAG_VALUE_SEPARATOR} <i>&lt;number&gt;</i>` : '';
  const vals:IPropertyValue[] = (<any>values).map((d) => {
    const prop = createPropertyValue(PropertyType.NUMERICAL, d, textAddon);
    prop.needsInput = needsInput;
    return prop;
  });
  return new Property(PropertyType.NUMERICAL, text, vals);
}

export function createPropertyValue(type:PropertyType, data:any, textAddon:string = ''):IPropertyValue {
  let id = (data.id === undefined) ? data.text : data.id;
  let text = data.text || data.id;

  if(Object.prototype.toString.call(data) === '[object String]') {
    id = data;
    text = data;
  }

  text += textAddon;

  return new PropertyValue(type, id, text, data.payload);
}
