/**
 * Created by Samuel Gratzl on 27.12.2016.
 */

export class UniqueIdManager {

  /**
   * unique id container
   * @type {{}}
   */
  private idCounter = new Map<string, number>();
  /**
   * returns a unique id for the given domain
   * @param domain
   * @return {number}
   */
  public uniqueId(domain: string = '_default') {
    if (!this.idCounter.has(domain)) {
      this.idCounter.set(domain, 0);
    }
    const v = this.idCounter.get(domain);
    this.idCounter.set(domain, v + 1);
    return v;
  }

  public flagId(domain: string, id: number) {
    if (isNaN(id) || id < 0) {
      return id;
    }
    if (!this.idCounter.has(domain)) {
      this.idCounter.set(domain, id + 1);
    } else {
      this.idCounter.set(domain, Math.max(this.idCounter.get(domain), id + 1)); //use the next one afterwards
    }
    return id;
  }

  /**
   * returns a string, which is a unique id for the given domain
   * @param domain
   * @return {string}
   */
  public uniqueString(domain: string = '_default') {
    return domain + this.uniqueId(domain);
  }
  private static instance: UniqueIdManager;
  public static getInstance(): UniqueIdManager {
    if (!UniqueIdManager.instance) {
      UniqueIdManager.instance = new UniqueIdManager();
    }
    return UniqueIdManager.instance;
  }
}
