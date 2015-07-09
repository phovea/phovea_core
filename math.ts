/**
 * Created by Samuel Gratzl on 29.08.2014.
 */

import ranges = require('./range');
/**
 * simple number statistics similar to DoubleStatistics in Caleydo
 * TODO use a standard library for that
 */
export interface IStatistics {
  min: number;
  max: number;
  sum: number;
  mean: number;
  var : number;
  sd: number;
  n: number;
  nans: number;
  moment2: number;
  moment3: number;
  moment4: number;
  kurtosis: number;
  skewness: number;
}


export interface IIterable<T> {
  forEach(callbackfn: (value: T) => void, thisArg?: any): void;
}

export interface IHistogram extends IIterable<number> {
  bins: number;
  largestFrequency : number;
  count: number;

  frequency(bin: number) : number;
  range(bin: number): ranges.Range;

  binOf(value: any) : number;

  missing: number;
  missingRange: ranges.Range;
}


class Statistics implements IStatistics {
  min: number = NaN;
  max: number = NaN;
  sum: number = 0;
  mean: number = 0;
  private _var : number = 0;
  n: number = 0;
  nans: number = 0;
  moment2: number = NaN;
  moment3: number = NaN;
  moment4: number = NaN;

  get var() {
    return this.n > 1 ? this._var / (this.n - 1) : 0;
  }

  /** Returns the standard deviation */
  get sd() {
    return Math.sqrt(this.var);
  }

  get kurtosis() {
    if (this.n === 0) {
      return 0;
    }
    return (this.n * this.moment4) / (this.moment2 * this.moment2) - 3;
  }

  get skewness() {
    if (this.n === 0) {
      return 0;
    }
    return Math.sqrt(this.n) * this.moment3 / (Math.pow(this.moment2, 3. / 2.));
  }

  push(x: number) {
    x = +x;
    if (isNaN(x)) {
      this.nans++;
      return;
    }

    this.n++;
    this.sum += x;
    if (x < this.min || isNaN(this.min)) {
      this.min = x;
    }
    if (this.max < x || isNaN(this.max)) {
      this.max = x;
    }
    // http://www.johndcook.com/standard_deviation.html
    // See Knuth TAOCP vol 2, 3rd edition, page 232
    // http://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Higher-order_statistics

    if (this.n === 1) {
      this.mean = x;
      this._var = 0;
      this.moment2 = this.moment3 = this.moment4 = 0;
    } else {
      var mean_m1 = this.mean;
      this.mean = mean_m1 + (x - mean_m1) / this.n;
      this._var = this._var + (x - mean_m1) * (x - this.mean);

      var delta = x - mean_m1;
      var delta_n = delta / this.n;
      var delta_n2 = delta_n * delta_n;
      var term1 = delta * delta_n * (this.n - 1);
      this.moment4 += term1 * delta_n2 * (this.n * this.n - 3 * this.n + 3) + 6 * delta_n2 * this.moment2 - 4 * delta_n * this.moment3;
      this.moment3 += term1 * delta_n * (this.n - 2) - 3 * delta_n * this.moment2;
      this.moment2 += term1;
    }
  }
}

export function computeStats(...arr: IIterable<number>[]) : IStatistics {
  var r = new Statistics();
  arr.forEach((a) => a.forEach(r.push,r));
  return r;
}

export function hist(arr: IIterable<number>, indices: ranges.Range1D, size: number, bins: number, range: number[]) : IHistogram {
  var r = new Histogram(bins, range);
  r.pushAll(arr, indices, size);
  return r;
}

export function categoricalHist(arr: IIterable<string>, indices: ranges.Range1D, size: number, categories: string[]) : IHistogram {
  var r = new CatHistogram(categories);
  r.pushAll(arr, indices, size);
  return r;
}

class AHistogram implements IHistogram {
  private bins_ : number[];
  private missing_ : number = 0;
  private ranges_ : ranges.Range[];
  private missingRange_  = ranges.none();

  constructor(bins: number) {
    this.bins_ = [];
    for(var i = 0; i < bins; ++i) {
      this.bins_.push(0);
    }
  }

  get largestFrequency() {
    return Math.max(Math.max.apply(Math,this.bins_), this.missing_);
  }

  get count() {
    return this.bins_.reduce((p,s) => p+s, this.missing_);
  }

  get bins() {
    return this.bins_.length;
  }

  binOf(value: any) {
    return -1;
  }

  frequency(bin: number) {
    return this.bins_[bin];
  }

  range(bin:number) {
    return this.ranges_ ? this.ranges_[bin] : null;
  }

  get missing() {
    return this.missing_;
  }

  get missingRange() {
    return this.missingRange_;
  }

  pushAll(arr: IIterable<any>, indices: ranges.Range1D, size: number) {
    var binindex = [], missingindex = [];
    for(var i = this.bins-1; i>=0; --i) {
      binindex.push([]);
    }
    if (indices) {
      var it = indices.iter(size);
      arr.forEach((x) => {
        var index = it.next();
        var bin = this.binOf(x);
        if (bin < 0) {
          this.missing_++;
          missingindex.push(index);
        } else {
          this.bins_[bin]++;
          binindex[bin].push(index);
        }
      });
      //build range and remove duplicates
      this.ranges_ = binindex.map((d) => ranges.list(d.sort().filter((di, i, a) => di !== a[i-1])));
      this.missingRange_ = ranges.list(missingindex.sort().filter((di, i, a) => di !== a[i-1]));
    } else {
      arr.forEach((x) => {
        var bin = this.binOf(x);
        if (bin < 0) {
          this.missing_++;
        } else {
          this.bins_[bin]++;
        }
      });
      this.ranges_ = null;
      this.missingRange_ = null;
    }
  }

  forEach(callbackfn: (value: number, index: number) => void, thisArg?: any) {
    return this.bins_.forEach(callbackfn, thisArg);
  }
}

class Histogram extends AHistogram {
  constructor(bins: number, private r: number[]) {
    super(bins);
  }

  binOf(value: any) {
    if (typeof value === 'number') {
      return this.binOfImpl(<number>value);
    }
    return -1;
  }

  private binOfImpl(value: number) {
    if (isNaN(value)) {
      return -1;
    }
    var n = (value - this.r[0]) / (this.r[1] - this.r[0]);
    var bin = Math.round(n * (this.bins - 1));
    if (bin < 0) {
      bin = 0;
    }
    if (bin >= this.bins) {
      bin = this.bins - 1;
    }
    return bin;
  }
}

class CatHistogram extends AHistogram {
  constructor(private categories: string[]) {
    super(categories.length);
  }

  binOf(value: any) {
    return this.categories.indexOf(value);
  }
}
