/**
 * Created by Holger Stitz on 30.06.2017.
 */
import {TermFrequency} from './tf_idf/TermFrequency';
import {IVisState} from './VisState';
import {IPropertyValue} from './VisStateProperty';

export interface IPropertyComparator {
  addState(state:IVisState):void;
  compare: (a:any, b:any) => number;
}

export interface ICategoricalPropertyComparator extends IPropertyComparator {
  compare: (term:string, termFreq:TermFrequency) => number;
}

export interface INumericalPropertyComparator extends IPropertyComparator {
  compare: (propValue1:IPropertyValue, propValue2:IPropertyValue) => number;
}

export interface ISetPropertyComparator extends IPropertyComparator {
  compare: (set1:string[], set2:string[]) => number;
}

