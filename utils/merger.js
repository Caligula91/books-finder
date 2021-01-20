/* eslint-disable no-continue */
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

const isSameBook = async (data, requestMap) => {
  const { url1, author1, url2, author2 } = data;
  try {
    const result1 = await requestMap.getResponse(url1);
    const result2 = await requestMap.getResponse(url2);
    const same = compareBooks.secondCompare(
      { url1, html1: result1.data, author1 },
      { url2, html2: result2.data, author2 }
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
        const url1 = book1.source.url;
        const sameBooksArr = urlMapDB.getSameUrl(book1.source.url);
        const notSameBooksArr = urlMapDB.getNotSameUrl(book1.source.url);
        books[j].forEach((book2) => {
          const sameSource =
            initialValue && j === books.length - 1
              ? book2.source.find((el) => el.name === book1.source.name)
              : undefined;
          if (sameSource) return;
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

const pushNewBook = (finalBooks, book) => {
  const img = [];
  img.push(book.img);
  const source = [];
  source.push(book.source);
  finalBooks.push(new Book(book, img, source));
};
const pushSameBook = (finalBook, book) => {
  finalBook.img.push(book.img);
  finalBook.source.push(book.source);
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
      const url1 = book.source.url;
      const sameBooksArr = urlMapDB.getSameUrl(url1);
      const notSameBooksArr = urlMapDB.getNotSameUrl(url1);
      for (let z = 0; z < initialValue.length; z++) {
        const finalBook = initialValue[z];
        const url2 = finalBook.source[0].url;
        // Check if there is already book.source in finalBooks.source. If there is, skip that final book
        const sameSource = finalBook.source.find(
          (el) => el.name === book.source.name
        );
        if (sameSource) {
          if (z === initialValue.length - 1) {
            pushNewBook(initialValue, book);
            break;
          }
          continue;
        }
        const sameBook = sameBooksArr && sameBooksArr.includes(url2);
        if (sameBook) {
          pushSameBook(finalBook, book);
          break;
        }
        const notSameBook = notSameBooksArr && notSameBooksArr.includes(url2);
        if (notSameBook) {
          if (z === initialValue.length - 1) {
            pushNewBook(initialValue, book);
            break;
          }
          continue;
        }
        const passedFirstCompare = potentialSameBooksMap.passedFirstCompare(
          url1,
          url2
        );
        if (
          passedFirstCompare &&
          (await isSameBook(
            { url1, author1: book.author, url2, author2: finalBook.author },
            requestMap
          ))
        ) {
          pushSameBook(finalBook, book);
          break;
        }
        if (z === initialValue.length - 1) {
          pushNewBook(initialValue, book);
          break;
        }
      }
    }
  }
  return initialValue;
};
