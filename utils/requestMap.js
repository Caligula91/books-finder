const axios = require('axios');

const timeout = process.env.TIMEOUT || 10000;

module.exports = class {
  constructor() {
    this.map = new Map();
    this.failedRequest = new Set();
  }

  addGetRequest(url) {
    if (this.map.has(url)) return;
    this.map.set(
      url,
      axios(encodeURI(url), { timeout }).catch((err) => {
        this.failedRequest.add(url);
        // eslint-disable-next-line no-console
        console.log(err.message, url);
      })
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

  getFailedRequestsSet() {
    return this.failedRequest;
  }
};
