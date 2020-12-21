/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import { Range } from '../range';
export declare class LocalIDAssigner {
    private readonly pool;
    private readonly lookup;
    unmapOne(id: number): string;
    unmap(ids: number[]): string[];
    mapOne(id: string): number;
    map(ids: string[]): Range;
    static create(): any;
}
