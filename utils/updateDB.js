/* eslint-disable no-plusplus */
const BookUrlMap = require('../models/bookUrlMap');

const getUrlMap = (books) => {
  const urlMap = new Map();
  books.forEach((book) => {
    if (book.source.length > 1) {
      const urls = book.source.map((src) => src.url);
      for (let i = 0; i < urls.length; i++) {
        urlMap.set(urls[i], []);
        const value = urlMap.get(urls[i]);
        for (let j = 0; j < urls.length; j++) {
          if (i !== j) {
            value.push(urls[j]);
          }
        }
      }
    }
  });
  return urlMap;
};

const getNotSameMap = (sameMap, potentialSameBooks, requestMap) => {
  potentialSameBooks.forEach((value, key) => {
    value.forEach((el) => {
      if (requestMap.getFailedRequestsSet().has(el)) value.delete(el);
    });
    if (value.size === 0) {
      potentialSameBooks.delete(key);
      return;
    }
    const sameSet = sameMap.get(key);
    if (sameSet) {
      sameSet.forEach((el) => value.delete(el));
      if (value.size === 0) potentialSameBooks.delete(key);
    }
  });
  return potentialSameBooks;
};

module.exports = async (books, potentialSameBooks, requestMap) => {
  const urlMap = getUrlMap(books);
  const commandsArr = [];
  urlMap.forEach((value, key) => {
    commandsArr.push({
      updateOne: {
        filter: { url: key },
        update: {
          $addToSet: { sameBooks: { $each: value } },
        },
        upsert: true,
      },
    });
  });
  const notSameMap = getNotSameMap(urlMap, potentialSameBooks, requestMap);
  notSameMap.forEach((value, key) => {
    commandsArr.push({
      updateOne: {
        filter: { url: key },
        update: {
          $addToSet: { notSameBooks: { $each: Array.from(value) } },
        },
        upsert: true,
      },
    });
  });
  // NOT OTPIMISED (REMOVE UNNECECERY COMMANDS)
  const bulkWriterResults = await BookUrlMap.bulkWrite(commandsArr);
  return bulkWriterResults;
};
