const BookUrlMap = require('../models/bookUrlMap');

module.exports = class {
  constructor() {
    this.map = new Map();
  }

  async populateMap(allBooks) {
    // allBooks = [[book, book, book...], [book, book, book]...]
    const urlArr = allBooks
      .map((books) => books.map((book) => book.source.url))
      .reduce((acc, curr) => acc.concat(curr));
    const bookUrlMapArr = await BookUrlMap.find({ url: { $in: urlArr } });
    const urlHashMap = bookUrlMapArr.reduce((acc, curr) => {
      acc.set(curr.url, curr.sameBooks);
      return acc;
    }, this.map);
    return urlHashMap;
  }

  getArr(url) {
    return this.map.get(url);
  }

  clearMap() {
    this.map.clear();
  }

  getMap() {
    return this.map;
  }
};
