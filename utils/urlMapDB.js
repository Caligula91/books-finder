const BookUrlMap = require('../models/bookUrlMap');

module.exports = class {
  constructor() {
    this.sameBooksMap = new Map();
    this.notSameBooksMap = new Map();
  }

  async populateMaps(allBooks) {
    // allBooks = [[book, book, book...], [book, book, book]...]
    // 1. Get all url from allBooks [url, url...]
    const urlArr = allBooks
      .map((books) => books.map((book) => book.source.url))
      .reduce((acc, curr) => acc.concat(curr));
    //2. Fetch all documents with url [doc, doc...]
    const bookUrlMapArr = await BookUrlMap.find({ url: { $in: urlArr } });
    //3. Populate Map with url as key, and sameBooks array as value
    //4. Populate Map with url as key, and notSameBooks array as value
    bookUrlMapArr.forEach((el) => {
      this.sameBooksMap.set(el.url, el.sameBooks);
      this.notSameBooksMap.set(el.url, el.notSameBooks);
    });
  }

  getSameUrl(url) {
    this.sameBooksMap.get(url);
  }

  getNotSameUrl(url) {
    this.notSameBooksMap.get(url);
  }

  clearMap() {
    this.sameBooksMap.clear();
    this.notSameBooksMap.clear();
  }

  getMaps() {
    return {
      sameBooksMap: this.sameBooksMap,
      notSameBooksMap: this.notSameBooksMap,
    };
  }
};
