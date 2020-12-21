/**
 * Created by sam on 12.02.2015.
 */
import { GraphNode, GraphEdge } from '../graph/graph';
import { VisState } from './retrieval/VisState';
/**
 * a state node is one state in the visual exploration consisting of an action creating it and one or more following ones.
 * In addition, a state is characterized by the set of active object node s
 */
export class StateNode extends GraphNode {
    constructor(name, description = '') {
        super('state');
        super.setAttr('name', name);
        super.setAttr('description', description);
        this.visState = new VisState(this, this.getCurrVisState.bind(this), 'visState');
    }
    getCurrVisState() {
        if (this.consistsOf.length === 0) {
            return Promise.reject(`No current vis state for state #${this.id} available. This state does not consists of any objects.`);
        }
        // use first element and assume that only the application returns a list of terms
        return this.consistsOf
            .map((objectNode) => objectNode.getCurrVisState())
            .filter((d) => d !== null && d !== undefined)[0]; // note the [0]
    }
    get name() {
        return super.getAttr('name');
    }
    set name(value) {
        super.setAttr('name', value);
    }
    get description() {
        return super.getAttr('description', '');
    }
    set description(value) {
        super.setAttr('description', value);
    }
    static restore(p) {
        const r = new StateNode(p.attrs.name);
        return r.restore(p);
    }
    /**
     * this state consists of the following objects
     * @returns {ObjectNode<any>[]}
     */
    get consistsOf() {
        return this.outgoing.filter(GraphEdge.isGraphType('consistsOf')).map((e) => e.target);
    }
    /**
     * returns the actions leading to this state
     * @returns {ActionNode[]}
     */
    get resultsFrom() {
        return this.incoming.filter(GraphEdge.isGraphType('resultsIn')).map((e) => e.source);
    }
    /**
     *
     * @returns {any}
     */
    get creator() {
        //results and not a inversed actions
        const from = this.incoming.filter(GraphEdge.isGraphType('resultsIn')).map((e) => e.source).filter((s) => !s.isInverse);
        if (from.length === 0) {
            return null;
        }
        return from[0];
    }
    get next() {
        return this.outgoing.filter(GraphEdge.isGraphType('next')).map((e) => e.target).filter((s) => !s.isInverse);
    }
    get previousState() {
        const a = this.creator;
        if (a) {
            return StateNode.previous(a);
        }
        return null;
    }
    get previousStates() {
        return this.resultsFrom.map((n) => StateNode.previous(n));
    }
    get nextStates() {
        return this.next.map((n) => StateNode.resultsIn(n));
    }
    get nextState() {
        const r = this.next[0];
        return r ? StateNode.resultsIn(r) : null;
    }
    get path() {
        const p = this.previousState, r = [];
        r.unshift(this);
        if (p) {
            p.pathImpl(r);
        }
        return r;
    }
    pathImpl(r) {
        const p = this.previousState;
        r.unshift(this);
        if (p && r.indexOf(p) < 0) { //no loop
            //console.log(p.toString() + ' path '+ r.join(','));
            p.pathImpl(r);
        }
    }
    toString() {
        return this.name;
    }
    static resultsIn(node) {
        const r = node.outgoing.filter(GraphEdge.isGraphType('resultsIn'))[0];
        return r ? r.target : null;
    }
    static previous(node) {
        const r = node.incoming.filter(GraphEdge.isGraphType('next'))[0];
        return r ? r.source : null;
    }
}
//# sourceMappingURL=StateNode.js.map