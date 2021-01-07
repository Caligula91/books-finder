/* eslint-disable no-plusplus */
const axios = require('axios');
const Book = require('../models/bookModel');
const compareBooks = require('./compareBooks');

// RETURN ARRAY WITH FINAL BOOKS
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

//===============================================

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

// NOT GOOD FOR MULTI USERS
const populateMap = (books, initialValue, map) => {
  //if (!initialValue) map.clear();
  const timeout = 3000;
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
        // CRITICAL CODE: DUPLICATE CODE
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

module.exports = async (values) => {
  const { books } = values;
  let { promiseMap, initialValue } = values;
  promiseMap = promiseMap || new Map();
  populateMap(books, initialValue, promiseMap);
  if (!initialValue) {
    // PART TO ADD TO V1
    const index = books.findIndex((el) => el.length > 0);
    if (index === -1) return [];
    initialValue = getInitBooks(books[index]);
    books.splice(index, 1);
    // END
  }
  // PART TO ADD TO V1
  let collisions = 0;
  for (let i = 0; i < books.length; i++) {
    // END
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
          collisions++;
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
  console.log('COLLISIONS: ', collisions);
  // return initialValue;
  return {
    books: initialValue,
    promiseMap,
  };
};
