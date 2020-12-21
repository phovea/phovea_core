/**
 * Created by Holger Stitz on 28.06.2017.
 */
export const TAG_VALUE_SEPARATOR = '=';
export var PropertyType;
(function (PropertyType) {
    PropertyType[PropertyType["NUMERICAL"] = 0] = "NUMERICAL";
    PropertyType[PropertyType["CATEGORICAL"] = 1] = "CATEGORICAL";
    PropertyType[PropertyType["SET"] = 2] = "SET";
})(PropertyType || (PropertyType = {}));
export class Property {
    constructor(type, text, values) {
        this.type = type;
        this.text = text;
        this.values = values;
        //
    }
}
class PropertyValue {
    constructor(type, id, text, payload) {
        this.type = type;
        this.id = id;
        this.text = text;
        this.payload = payload;
        this.isSelected = false;
        this.isVisible = true;
        this.isDisabled = false;
        this.isActive = false;
        this.needsInput = false;
        this.numCount = 0;
        this.group = '';
        //
    }
    get baseId() {
        return this.id.split(TAG_VALUE_SEPARATOR)[0].trim();
    }
    toJSON() {
        const r = {
            type: this.type,
            id: this.id,
        };
        if (this.id !== this.text) {
            r.text = this.text;
        }
        if (this.payload !== undefined) {
            r.payload = this.payload;
        }
        if (this.group) {
            r.group = this.group;
        }
        return r;
    }
    clone() {
        const pv = new PropertyValue(this.type, this.id, this.text, this.payload);
        pv.group = this.group;
        pv.isSelected = this.isSelected;
        pv.isSelected = this.isVisible;
        pv.isDisabled = this.isDisabled;
        pv.isActive = this.isActive;
        pv.needsInput = this.needsInput;
        pv.numCount = this.numCount;
        return pv;
    }
}
export function categoricalProperty(text, values) {
    const vals = values.map((d) => createPropertyValue(PropertyType.CATEGORICAL, d));
    return new Property(PropertyType.CATEGORICAL, text, vals);
}
export function setProperty(text, values) {
    const vals = values.map((d) => createPropertyValue(PropertyType.SET, d));
    return new Property(PropertyType.SET, text, vals);
}
export function numericalProperty(text, values, needsInput = false) {
    const textAddon = (needsInput) ? ` ${TAG_VALUE_SEPARATOR} <i>&lt;number&gt;</i>` : '';
    const vals = values.map((d) => {
        const prop = createPropertyValue(PropertyType.NUMERICAL, d, textAddon);
        prop.needsInput = needsInput;
        return prop;
    });
    return new Property(PropertyType.NUMERICAL, text, vals);
}
export function createPropertyValue(type, data, textAddon = '') {
    let id = (data.id === undefined) ? data.text : data.id;
    let text = data.text || data.id;
    if (Object.prototype.toString.call(data) === '[object String]') {
        id = data;
        text = data;
    }
    text += textAddon;
    const pv = new PropertyValue(type, id, text, data.payload);
    if (data.group) {
        pv.group = data.group;
    }
    return pv;
}
//# sourceMappingURL=VisStateProperty.js.map