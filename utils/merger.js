/* eslint-disable no-plusplus */
const axios = require('axios');
const Book = require('../models/bookModel');
const compareBooks = require('./compareBooks');
const catchAsync = require('./catchAsync');

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

const isSameBook = async (url1, url2, map) => {
  const source1 = getSource(url1);
  const source2 = getSource(url2);
  const result1 = await map.get(url1);
  const result2 = await map.get(url2);
  return compareBooks.secondCompare(
    { source1, html1: result1.data, url: url1 },
    { source2, html2: result2.data, url: url2 }
  );
};

const populateMap = (books, initialValue, map) => {
  const timeout = 5000;
  for (let i = 0; i < books.length - 1; i++) {
    for (let j = i + 1; j < books.length; j++) {
      books[i].forEach((book1) => {
        books[j].forEach((book2) => {
          if (compareBooks.firstCompare(book1, book2)) {
            if (!map.has(book1.source.url)) {
              map.set(
                book1.source.url,
                axios(encodeURI(book1.source.url), { timeout })
              );
            }
            if (!map.has(book2.source.url)) {
              map.set(
                book2.source.url,
                axios(encodeURI(book2.source.url), { timeout })
              );
            }
          }
        });
        if (initialValue) {
          initialValue.forEach((initBook) => {
            if (compareBooks.firstCompare(book1, initBook)) {
              if (!map.has(book1.source.url)) {
                map.set(
                  book1.source.url,
                  axios(encodeURI(book1.source.url), { timeout })
                );
              }
              if (!map.has(initBook.source[0].url)) {
                map.set(
                  initBook.source[0].url,
                  axios(encodeURI(initBook.source[0].url), { timeout })
                );
              }
            }
          });
        }
      });
    }
  }
  return map;
};

module.exports = catchAsync(async (values) => {
  const { books } = values;
  let { promiseMap, initialValue } = values;
  promiseMap = promiseMap || new Map();
  populateMap(books, initialValue, promiseMap);
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
            promiseMap
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
  return {
    books: initialValue,
    promiseMap,
  };
});
