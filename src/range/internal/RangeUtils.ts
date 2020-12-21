/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
export class RangeUtils {

  static fixRange(v: number, size: number) {
    return v < 0 ? (size + 1 + v) : v;
  }
}
