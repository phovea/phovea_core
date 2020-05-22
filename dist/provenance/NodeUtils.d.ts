/**
 * Created by sam on 12.02.2015.
 */
import { StateNode } from './StateNode';
import { ObjectNode } from './ObjectNode';
import { ActionNode } from './ActionNode';
export declare class NodeUtils {
    static findLatestPath(state: StateNode): StateNode[];
    static createdBy<T>(node: ObjectNode<T>): ActionNode;
    static removed<T>(node: ObjectNode<T>): ActionNode;
    static requiredBy<T>(node: ObjectNode<T>): ActionNode[];
    static partOf<T>(node: ObjectNode<T>): StateNode[];
    static uses<T>(node: ObjectNode<T>): ObjectNode<any>[];
    static creates<T>(node: ObjectNode<T>): ObjectNode<any>[];
    static removes<T>(node: ObjectNode<T>): ObjectNode<any>[];
    static requires<T>(node: ObjectNode<T>): ObjectNode<any>[];
    static resultsIn<T>(node: ObjectNode<T>): StateNode;
    static previous<T>(node: ObjectNode<T>): StateNode;
}
