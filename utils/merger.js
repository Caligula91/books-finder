/* eslint-disable no-plusplus */
const { set } = require('mongoose');
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

const isSameBook = async (
  url1,
  url2,
  requestMap,
  urlMapDB,
  notSameBooksMap
) => {
  const urlArr = urlMapDB.getArr(url1);
  if (urlArr && urlArr.includes(url2)) {
    return true;
  }
  const source1 = getSource(url1);
  const source2 = getSource(url2);
  try {
    const result1 = await requestMap.getResponse(url1);
    const result2 = await requestMap.getResponse(url2);
    const same = compareBooks.secondCompare(
      { source1, html1: result1.data, url: url1 },
      { source2, html2: result2.data, url: url2 }
    );
    if (!same) {
      console.log('adding to map');
      notSameBooksMap.addNotSamePair(url1, url2);
    }
    return same;
  } catch {
    return false;
  }
};

const populateMap = (books, initialValue, requestMap, urlMapDB) => {
  for (let i = 0; i < books.length - 1; i++) {
    for (let j = i + 1; j < books.length; j++) {
      books[i].forEach((book1) => {
        const sameBooksArr = urlMapDB.getArr(book1.source.url);
        books[j].forEach((book2) => {
          if (
            sameBooksArr &&
            sameBooksArr.find((el) => el === book2.source.url)
          ) {
            console.log(book1.source.url, '===', book2.source.url);
            set.add(book1.source.url);
            set.add(book2.source.url);
            return;
          }
          if (compareBooks.firstCompare(book1, book2)) {
            console.log(book1.source.url, '=', book2.source.url);
            requestMap.addGetRequest(book1.source.url);
            requestMap.addGetRequest(book2.source.url);
          }
        });
        if (initialValue) {
          initialValue.forEach((initBook) => {
            if (
              sameBooksArr &&
              sameBooksArr.find((el) => el === initBook.source[0].url)
            ) {
              return;
            }

            if (compareBooks.firstCompare(book1, initBook)) {
              requestMap.addGetRequest(book1.source.url);
              requestMap.addGetRequest(initBook.source[0].url);
            }
          });
        }
      });
    }
  }
};

module.exports = async (values) => {
  const { books, urlMapDB, requestMap } = values;
  let { initialValue } = values;
  populateMap(books, initialValue, requestMap, urlMapDB);
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
        if (
          !sameSource &&
          compareBooks.firstCompare(book, finalBook) &&
          // eslint-disable-next-line no-await-in-loop
          (await isSameBook(
            book.source.url,
            finalBook.source[0].url,
            requestMap,
            urlMapDB,
            values.notSameBooksMap
          ))
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
  console.log(values.notSameBooksMap.getMap());
  return initialValue;
};
