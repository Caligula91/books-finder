/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const Book = require('../models/bookModel');
const compareBooks = require('./compareBooks');

const getInitBooks = (books) => {
  const returnValue = [];
  books.forEach((book) => {
    const img = [];
    img.push(book.img);
    const source = [];
    source.push(book.source);
    returnValue.push(new Book(book, img, source));
  });
  return returnValue;
};

const getSource = (url) => {
  if (url.startsWith('https://www.delfi.rs')) {
    return 'delfi';
  }
  if (url.startsWith('https://www.knjizare-vulkan.rs')) {
    return 'vulkan';
  }
  if (url.startsWith('https://www.korisnaknjiga.com')) {
    return 'korisna_knjiga';
  }
  if (url.startsWith('https://evrobook.rs')) {
    return 'evrobook';
  }
};

const isSameBook = async (url1, url2, requestMap) => {
  const source1 = getSource(url1);
  const source2 = getSource(url2);
  try {
    const result1 = await requestMap.getResponse(url1);
    const result2 = await requestMap.getResponse(url2);
    const same = compareBooks.secondCompare(
      { source1, html1: result1.data, url1 },
      { source2, html2: result2.data, url2 }
    );
    return same;
  } catch {
    return false;
  }
};

const populateMap = (
  books,
  initialValue,
  requestMap,
  urlMapDB,
  potentialSameBooksMap
) => {
  if (initialValue) books.push(initialValue);
  const ingoreSet = new Set();
  for (let i = 0; i < books.length - 1; i++) {
    for (let j = i + 1; j < books.length; j++) {
      // restart set of ignoring books
      ingoreSet.clear();
      books[i].forEach((book1) => {
        const sameBooksArr = urlMapDB.getSameUrl(book1.source.url);
        const notSameBooksArr = urlMapDB.getNotSameUrl(book1.source.url);
        books[j].forEach((book2) => {
          const url1 = book1.source.url;
          const url2 =
            j === books.length - 1 && initialValue
              ? book2.source[0].url
              : book2.source.url;
          if (ingoreSet.has(url1) || ingoreSet.has(url2)) {
            return;
          }
          if (sameBooksArr && sameBooksArr.find((el) => el === url2)) {
            ingoreSet.add(url2);
            ingoreSet.add(url1);
            return;
          }
          if (notSameBooksArr && notSameBooksArr.find((el) => el === url2))
            return;
          if (compareBooks.firstCompare(book1, book2)) {
            requestMap.addGetRequest(url1);
            requestMap.addGetRequest(url2);
            potentialSameBooksMap.addUrlPair(url1, url2);
          }
        });
      });
    }
  }
  if (initialValue) books.pop();
};

module.exports = async (values) => {
  const { books, urlMapDB, requestMap, potentialSameBooksMap } = values;
  let { initialValue } = values;
  populateMap(books, initialValue, requestMap, urlMapDB, potentialSameBooksMap);
  if (!initialValue) {
    const index = books.findIndex((el) => el.length > 0);
    if (index === -1) return [];
    initialValue = getInitBooks(books[index]);
    books.splice(index, 1);
  }
  for (let i = 0; i < books.length; i++) {
    const sourceBooks = books[i];
    for (let j = 0; j < sourceBooks.length; j++) {
      const book = sourceBooks[j];
      for (let z = 0; z < initialValue.length; z++) {
        const finalBook = initialValue[z];
        const sameSource = finalBook.source.find(
          (el) => el.name === book.source.name
        );
        const urlArr = urlMapDB.getSameUrl(book.source.url);
        const sameBook = urlArr && urlArr.includes(finalBook.source[0].url);
        const passedFirstCompare = potentialSameBooksMap.passedFirstCompare(
          book.source.url,
          finalBook.source[0].url
        );
        if (
          !sameSource &&
          passedFirstCompare &&
          (sameBook ||
            (await isSameBook(
              book.source.url,
              finalBook.source[0].url,
              requestMap
            )))
        ) {
          finalBook.img.push(book.img);
          finalBook.source.push(book.source);
          break;
        } else if (z === initialValue.length - 1) {
          const img = [];
          img.push(book.img);
          const source = [];
          source.push(book.source);
          initialValue.push(new Book(book, img, source));
          break;
        }
      }
    }
  }
  return initialValue;
};
