/**
 * Created by Samuel Gratzl on 05.08.2014.
 */
export interface ITransform {
    /**
     * scale factors (width, height)
     */
    readonly scale: [number, number];
    /**
     * rotation
     */
    readonly rotate: number;
}
