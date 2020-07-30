/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
export class RangeUtils {
    static fixRange(v, size) {
        return v < 0 ? (size + 1 + v) : v;
    }
}
//# sourceMappingURL=RangeUtils.js.map