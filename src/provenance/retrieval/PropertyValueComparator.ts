/**
 * Created by Holger Stitz on 30.06.2017.
 */
import {TermFrequency} from './tf_idf/TermFrequency';
import {InverseDocumentFrequency} from './tf_idf/InverseDocumentFrequency';

export interface IPropertyComparator {
  compare: (a:any, b:any, c?:any) => number;
}

export interface ICategoricalPropertyComparator extends IPropertyComparator {
  compare: (term:string, termFreq:TermFrequency, idf:InverseDocumentFrequency) => number;
}

export interface INumericalPropertyComparator extends IPropertyComparator {
  compare: (numVal1:number, numVal2:number) => number;
}

export interface ISetPropertyComparator extends IPropertyComparator {
  compare: (set1:string[], set2:string[]) => number;
}

