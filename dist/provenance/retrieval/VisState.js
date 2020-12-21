/**
 * Created by Holger Stitz on 31.05.2017.
 */
import { createPropertyValue, PropertyType } from './VisStateProperty';
import { TermFrequency } from './tf_idf/TermFrequency';
export class VisState {
    constructor(node, stateAccessor, storageId) {
        this.node = node;
        this.stateAccessor = stateAccessor;
        this.storageId = storageId;
        this._idf = null;
        this._termFreq = new TermFrequency();
        this._propValues = null;
    }
    get idf() {
        return this._idf;
    }
    set idf(value) {
        this._idf = value;
        this._idf.addTermFreq(this._termFreq);
    }
    get propValues() {
        this.checkCache();
        return this._propValues;
    }
    /**
     * Compare this VisState with a list of property values and return a similarity score
     * @param comparatorAccessor
     * @param queryPropValues
     * @returns {number}
     */
    compare(comparatorAccessor, queryPropValues) {
        this.checkCache();
        // cache once before looping through all properties
        const stateSetProps = this.getGroupedPropIds(PropertyType.SET, this._propValues);
        const querySetProps = this.getGroupedPropIds(PropertyType.SET, queryPropValues);
        const similarities = queryPropValues.map((queryPropVal) => {
            let statePropVal;
            if (queryPropVal.type === PropertyType.SET) {
                // get SET property by exact id (`param1 = foo` -> id: `param1 = foo`) and group
                // in order to match only properties from the same group.
                // the "fuzzyness" based  will happen later by the Jaccard index in the comparator.
                statePropVal = this._propValues.find((p) => p.id === queryPropVal.id && p.group === queryPropVal.group);
            }
            else {
                // get property with the baseId in order to fuzzy match numerical properties (`year = 1920` -> baseId: `year`).
                // a detailed check will happen later in the comparator.
                statePropVal = this._propValues.find((p) => p.baseId === queryPropVal.baseId);
            }
            if (statePropVal) {
                switch (queryPropVal.type) {
                    case PropertyType.CATEGORICAL:
                        return comparatorAccessor(queryPropVal.type)
                            .compare(String(queryPropVal.id), this._termFreq);
                    case PropertyType.NUMERICAL:
                        return comparatorAccessor(queryPropVal.type)
                            .compare(statePropVal, queryPropVal);
                    case PropertyType.SET:
                        return comparatorAccessor(queryPropVal.type)
                            .compare(stateSetProps.get(statePropVal.group), querySetProps.get(queryPropVal.group));
                }
            }
            return 0;
        });
        return similarities;
    }
    /**
     * Clone all property values from a given visState and persist the current visState with the newly cloned values
     * @param {IVisState} visState
     * @returns {boolean}
     */
    cloneAndPersist(visState) {
        if (!visState) {
            return false;
        }
        this._propValues = visState.propValues.map((d) => d.clone());
        this.processPropValues(this._propValues);
        this.persist();
        return true;
    }
    /**
     * Check if the visState is already persisted in the provenance graph
     * @returns {boolean}
     */
    isPersisted() {
        return this.node.hasAttr(this.storageId);
    }
    /**
     * Capture and persist the visState in the provenance graph
     * Note: A previously set visState will be overridden without further checks.
     */
    captureAndPersist() {
        return this.captureVisState()
            .then(() => {
            this.persist();
            return this;
        });
    }
    /**
     * Checks if the terms of the visState are cached already.
     * Otherwise tries to load the persisted state or if this is not available,
     * then capture and persist the current state
     */
    checkCache() {
        // object is already cached
        if (this._propValues) {
            return;
        }
        if (this.isPersisted()) {
            this.loadPersisted();
        }
        else {
            this.captureAndPersist();
        }
    }
    /**
     * Load the persisted visState
     */
    loadPersisted() {
        // otherwise use try to use sessionStorage and decode json
        const jsonTerms = this.node.getAttr(this.storageId, null);
        const propValues = JSON.parse(jsonTerms);
        this._propValues = propValues.map((d) => {
            return createPropertyValue(d.type, d);
        });
        this.processPropValues(this._propValues);
    }
    /**
     * Captures the current visState using the `termAccessor`
     */
    captureVisState() {
        return this.stateAccessor()
            .then((propVals) => {
            this._propValues = propVals;
            this.processPropValues(this._propValues);
        });
    }
    /**
     * Persists the current visState
     * Note: A previously set visState will be overridden without further checks.
     */
    persist() {
        this.node.setAttr(this.storageId, JSON.stringify(this._propValues));
    }
    processPropValues(propValues) {
        // handle categorical values with TF
        this._termFreq.terms = this.getPropIds(PropertyType.CATEGORICAL, propValues);
    }
    getPropIds(type, propValues) {
        return propValues
            .filter((d) => d.type === type)
            .map((d) => String(d.id));
    }
    getGroupedPropIds(type, propValues) {
        const map = new Map();
        propValues
            .filter((d) => d.type === type)
            .forEach((d) => {
            const arr = (map.has(d.group)) ? map.get(d.group) : [];
            map.set(d.group, [...arr, String(d.id)]);
        });
        return map;
    }
}
//# sourceMappingURL=VisState.js.map