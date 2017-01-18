/**
 * Created by Holger Stitz on 18.01.2017.
 */

import {cat} from './ObjectNode';

export interface ISimilarityCategory {
  name: string;
  color: string;
  icon: string; // font-awesome CSS class
  weight: number;
  active: boolean;
}

export class SimCats {

  public static readonly INVALID:ISimilarityCategory = {
    name: 'invalid',
    color: '#fff',
    icon: '',
    weight: 0,
    active: false
  };

  public static readonly DATA:ISimilarityCategory = {
    name: cat.data,
    color: '#e41a1c',
    icon: 'fa-database',
    weight: 30,
    active: true
  };

  public static readonly VISUAL:ISimilarityCategory = {
    name: cat.visual,
    color: '#377eb8',
    icon: 'fa-bar-chart',
    weight: 20,
    active: true
  };

  public static readonly SELECTION:ISimilarityCategory = {
    name: cat.selection,
    color: '#984ea3',
    icon: 'fa-pencil-square',
    weight: 25,
    active: true
  };

  public static readonly LAYOUT:ISimilarityCategory = {
    name: cat.layout,
    color: '#ffff33',
    icon: 'fa-desktop',
    weight: 20,
    active: true
  };

  public static readonly LOGIC:ISimilarityCategory = {
    name: cat.logic,
    color: '#ff7f00',
    icon: 'fa-gear',
    weight: 5,
    active: true
  };

  public static readonly CATEGORIES: ISimilarityCategory[] = [
    SimCats.DATA,
    SimCats.VISUAL,
    SimCats.SELECTION,
    SimCats.LAYOUT,
    SimCats.LOGIC,
  ];

}
