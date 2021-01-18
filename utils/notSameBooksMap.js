module.exports = class {
  constructor() {
    this.map = new Map();
  }

  addNotSamePair(url1, url2) {
    const value1 = this.map.get(url1);
    const value2 = this.map.get(url2);
    if (value1) {
      value1.add(url2);
    } else {
      this.map.set(url1, new Set().add(url2));
    }
    if (value2) {
      value2.add(url1);
    } else {
      this.map.set(url2, new Set().add(url1));
    }
  }

  getMap() {
    return this.map;
  }

  clearMap() {
    this.map.clear();
  }

  passedFirstCompare(url1, url2) {
    const value = this.map.get(url1);
    if (!value) return false;
    return value.has(url2);
  }
};
