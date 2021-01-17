const axios = require('axios');

const timeout = process.env.TIMEOUT || 10000;

module.exports = class {
  constructor() {
    this.map = new Map();
  }

  addGetRequest(url) {
    if (this.map.has(url)) return;
    this.map.set(
      url,
      axios(encodeURI(url), { timeout }).catch((err) =>
        console.log(err.message)
      )
    );
  }

  getResponse(url) {
    return this.map.get(url);
  }

  clearMap() {
    this.map.clear();
  }

  getMap() {
    return this.map;
  }
};
