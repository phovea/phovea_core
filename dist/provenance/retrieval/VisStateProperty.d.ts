/**
 * Created by Holger Stitz on 28.06.2017.
 */
export declare const TAG_VALUE_SEPARATOR = "=";
export declare enum PropertyType {
    NUMERICAL = 0,
    CATEGORICAL = 1,
    SET = 2
}
export interface IProperty {
    type: PropertyType;
    text: string;
    values: IPropertyValue[];
}
export interface IPropertyValue {
    type: PropertyType;
    id: string;
    text: string;
    payload: any;
    group: string;
    isSelected: boolean;
    isVisible: boolean;
    isDisabled: boolean;
    isActive: boolean;
    needsInput: boolean;
    numCount: number;
    baseId: string;
    clone(): IPropertyValue;
}
export declare class Property implements IProperty {
    type: PropertyType;
    text: string;
    values: IPropertyValue[];
    constructor(type: PropertyType, text: string, values: IPropertyValue[]);
}
export declare function categoricalProperty(text: string, values: string[] | {
    text: string;
    id?: string;
}[]): IProperty;
export declare function setProperty(text: string, values: string[] | {
    text: string;
    id?: string;
}[]): IProperty;
export declare function numericalProperty(text: string, values: string[] | {
    text: string;
    id?: string;
}[], needsInput?: boolean): IProperty;
export declare function createPropertyValue(type: PropertyType, data: any, textAddon?: string): IPropertyValue;
