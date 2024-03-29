/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
const axios = require('axios');
const delfiParser = require('../utils/booksParser/delfiParser');
const vulkanParser = require('../utils/booksParser/vulkanParser');
const korisnaKnjigaParser = require('../utils/booksParser/korisnaKnjigaParser');
const evrobooksParser = require('../utils/booksParser/evrobookParser');
const topBooksParser = require('../utils/booksParser/topBooksParser');
const merger = require('../utils/merger');
const catchAsync = require('../utils/catchAsync');
const UrlMapDB = require('../utils/urlMapDB');
const RequestMap = require('../utils/requestMap');
const PotentialSameBooksMap = require('../utils/potentialSameBooksMap');
const TopBooks = require('../models/topBookModel');
const updateDB = require('../utils/updateDB');

const sources = {
  DELFI: 'delfi',
  VULKAN: 'vulkan',
  EVROBOOK: 'evrobook',
  KORISNA_KNJIGA: 'korisnaknjiga',
};

const sendResponse = (res, data) => {
  if (data) {
    const { books, page, nextPage, previousPage } = data;
    res.status(200).json({
      status: 'success',
      records: books.length,
      page,
      nextPage,
      previousPage,
      data: {
        books,
      },
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: {
        books: [],
      },
    });
  }
};

// It should return promise, not results
const getInitPromises = (search, source) => {
  const timeout = process.env.TIMEOUT || 10000;
  switch (source) {
    case 'delfi': {
      const perPage = 50;
      const url = `https://www.delfi.rs/pretraga?q=${search}&c=1&per_page=${perPage}&s=relevance&cena_od=0&cena_do=0&izdavaci=%5B%5D&customMobRadio2=on&stanje=1`;
      return axios(url, { timeout });
    }
    case 'vulkan': {
      const url = `https://www.knjizare-vulkan.rs/domace-knjige?search=${search}`;
      const perPage = 48;
      return axios({
        method: 'GET',
        url,
        headers: {
          Cookie: `order_limit=${perPage};`,
        },
        timeout,
      });
    }
    case 'korisnaknjiga': {
      const url = `https://www.korisnaknjiga.com/pretraga-proizvoda?s=${search}&v=0&c1=&c2=&o=`;
      return axios(url, { timeout });
    }
    case 'evrobook': {
      const url = `https://evrobook.rs/search.php?search=${search}`;
      return axios(url, { timeout });
    }
    default: {
      return undefined;
    }
  }
};

const getInitBooks = (result) => {
  // CRITIAL CODE: change this to something more stable (host from request)
  const source = result.request.host;
  switch (source) {
    case 'www.delfi.rs': {
      const numPages = delfiParser.getNumPages(result.data);
      const books = delfiParser.parseBooks(result.data);
      return {
        source: 'delfi',
        numPages,
        books,
      };
    }
    case 'www.knjizare-vulkan.rs': {
      const numPages = vulkanParser.getNumPages(result.data);
      const books = vulkanParser.parseBooks(result.data);
      return {
        source: 'vulkan',
        numPages,
        books,
      };
    }
    case 'www.korisnaknjiga.com': {
      const books = korisnaKnjigaParser.parseBooks(result.data);
      return {
        source: 'korisnaknjiga',
        books,
      };
    }
    case 'evrobook.rs': {
      const books = evrobooksParser.parseBooks(result.data);
      const numPages = evrobooksParser.getNumPages(result.data);
      return {
        source: 'evrobook',
        numPages,
        books,
      };
    }
    default: {
      return undefined;
    }
  }
};

const getBooksPromiseByPage = (search, source, page) => {
  const timeout = process.env.TIMEOUT || 10000;
  switch (source) {
    case 'delfi': {
      const perPage = 50;
      const url = `https://www.delfi.rs/pretraga?q=${search}&c=1&per_page=${perPage}&s=relevance&cena_od=0&cena_do=0&izdavaci=%5B%5D&customMobRadio2=on&stanje=1&page=${page}`;
      return axios(url, { timeout });
    }
    case 'vulkan': {
      const perPage = 48;
      const url = `https://www.knjizare-vulkan.rs/domace-knjige/page-${
        page - 1
      }?search=${search}`;
      return axios({
        method: 'GET',
        url,
        headers: {
          Cookie: `order_limit=${perPage};`,
        },
        timeout,
      });
    }
    case 'evrobook': {
      const url = axios(
        `https://evrobook.rs/search.php?search=${search}&page=${page}`
      );
      return axios(url, timeout);
    }
    default:
      return undefined;
  }
};

const getBooksByPage = (result) => {
  const source = result.request.host;
  switch (source) {
    case 'www.delfi.rs': {
      return delfiParser.parseBooks(result.data);
    }
    case 'www.knjizare-vulkan.rs': {
      return vulkanParser.parseBooks(result.data);
    }
    case 'evrobook.rs': {
      return evrobooksParser.parseBooks(result.data);
    }
    default: {
      return undefined;
    }
  }
};

exports.getDelfiBooks = async (req, res, next) => {
  const { search } = req.query;
  const perPage = 50;
  const url = `https://www.delfi.rs/pretraga?q=${search}&c=1&per_page=${perPage}&s=relevance&cena_od=0&cena_do=0&izdavaci=%5B%5D&customMobRadio2=on&stanje=1`;
  const results = [];
  results.push(await axios(url));
  const numPages = delfiParser.getNumPages(results[0].data);
  const promises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 2; i <= numPages; i++) {
    promises.push(axios(`${url}&page=${i}`));
  }
  (await Promise.all(promises)).forEach((resolvedPromise) => {
    results.push(resolvedPromise);
  });
  const books = [];
  results.forEach((result) => {
    const booksArr = delfiParser.parseBooks(result.data);
    booksArr.forEach((book) => {
      books.push(book);
    });
  });
  res.status(200).json({
    status: 'succeess',
    message: 'DEVELOPMENT',
    records: books.length,
    numPages,
    perPage,
    data: {
      books,
    },
  });
};

exports.getKorisnaKnjigaBooks = async (req, res, next) => {
  const { search } = req.query;
  const url = `https://www.korisnaknjiga.com/pretraga-proizvoda?s=${search}&v=0&c1=&c2=&o=`;
  const result = await axios(url);
  if (Math.floor(result.status / 100) !== 2) {
    res.status(200).json({
      status: 'fail',
    });
    return;
  }
  const books = korisnaKnjigaParser.parseBooks(result.data);
  res.status(200).json({
    status: 'success',
    records: books.length,
    message: 'DEVELOPMENT',
    data: {
      books,
    },
  });
};

exports.getVulkanBooks = async (req, res, next) => {
  const { search } = req.query;
  const url = `https://www.knjizare-vulkan.rs/domace-knjige?search=${search}`;
  const perPage = 48;
  //
  const results = [];
  results.push(
    await axios({
      method: 'GET',
      url,
      headers: {
        Cookie: 'order_limit=48;',
      },
    })
  );
  const numPages = vulkanParser.getNumPages(results[0].data);
  const promises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 2; i <= numPages; i++) {
    promises.push(
      axios({
        method: 'GET',
        url: url.replace('?', `/page-${i - 1}?`),
        headers: {
          Cookie: 'order_limit=48;',
        },
      })
    );
  }
  (await Promise.all(promises)).forEach((resolvedPromise) => {
    results.push(resolvedPromise);
  });
  const books = [];
  results.forEach((result) => {
    const booksArr = vulkanParser.parseBooks(result.data);
    booksArr.forEach((book) => {
      books.push(book);
    });
  });
  res.status(200).json({
    status: 'success',
    message: 'DEVELOPMENT',
    records: books.length,
    numPages,
    perPage,
    data: {
      books,
    },
  });
};

exports.getEvrobooks = async (req, res, next) => {
  const { search } = req.query;
  const url = `https://evrobook.rs/search.php?search=${search}`;
  const perPage = 48;
  const results = [];
  results.push(await axios(url));
  const numPages = evrobooksParser.getNumPages(results[0].data);
  const promises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 2; i <= numPages; i++) {
    promises.push(axios(`${url}&page=${i}`));
  }
  (await Promise.all(promises)).forEach((resolvedPromise) => {
    results.push(resolvedPromise);
  });
  const books = [];
  results.forEach((result) => {
    const booksArr = evrobooksParser.parseBooks(result.data);
    booksArr.forEach((book) => {
      books.push(book);
    });
  });
  res.status(200).json({
    status: 'succeess',
    message: 'DEVELOPMENT',
    records: books.length,
    numPages,
    perPage,
    data: {
      books,
    },
  });
};

/**
 * ALL BOOKS
 */
exports.getAllBooks = catchAsync(async (req, res, next) => {
  const { select } = req.query;
  const search = encodeURI(req.query.search);
  if (!search) return sendResponse(res);
  const limit = req.query.limit * 1 > 0 ? req.query.limit * 1 : 48;
  const page = req.query.page * 1 > 0 ? req.query.page * 1 : 1;
  const skip = (page - 1) * limit;
  const recordsCap = limit + skip;
  const perVirtualPage = 48;
  const selectArr = select
    ? select.split(' ').reduce((acc, cur) => {
        if (Object.values(sources).includes(cur)) acc.push(cur);
        return acc;
      }, [])
    : Object.values(sources);
  // get array of promises from init search results
  const initResultPromises = selectArr.map((src) =>
    getInitPromises(search, src)
  );
  const initResults = await Promise.allSettled(initResultPromises);
  const initBooks = [];
  const initBooksNoPage = [];
  initResults.forEach((el) => {
    if (el.status === 'rejected') return;
    const tempResultObj = getInitBooks(el.value);
    if (tempResultObj.numPages) {
      initBooks.push(tempResultObj);
    } else {
      initBooksNoPage.push(tempResultObj);
    }
  });
  const numPages = initBooks.map((el) => {
    return {
      source: el.source,
      numPages: el.numPages,
    };
  });
  // OUTPUT => [ { source: 'delfi', numPages: 3 }, ...]
  const forMerging = initBooks.map((el) => el.books);
  initBooksNoPage.forEach((el) => {
    forMerging.push(el.books.slice(0, perVirtualPage));
  });
  // OUTPUT => [ [ Book ], [ Book ]... ]
  const isEmpty = forMerging.every((books) => books.length === 0);
  if (isEmpty) return sendResponse(res);

  // INSTANTIATE --BEGIN--
  const urlMapDB = new UrlMapDB();
  const requestMap = new RequestMap();
  const potentialSameBooksMap = new PotentialSameBooksMap();
  if (process.env.DB_FETCH === 'yes') await urlMapDB.populateMaps(forMerging);
  // INSTANTIATE --END--

  let books = await merger({
    books: forMerging,
    urlMapDB,
    requestMap,
    potentialSameBooksMap,
  });
  // ADD SITUATION WHEN THERE IS NO NEXT PAGE BASED ON RECORDS FROM books
  for (let i = 2; books.length <= recordsCap; i++) {
    const nextPageResultPromises = [];
    numPages.forEach((src) => {
      if (src.numPages >= i) {
        nextPageResultPromises.push(
          getBooksPromiseByPage(search, src.source, i)
        );
      }
    });

    let nextBooksResults;
    const nextBooks = [];
    if (nextPageResultPromises.length > 0) {
      nextBooksResults = await Promise.allSettled(nextPageResultPromises);
      nextBooksResults.forEach((bookRes) => {
        if (bookRes.status === 'fulfilled') {
          nextBooks.push(getBooksByPage(bookRes.value));
        }
      });
    }
    const nextBooksNoPages = [];
    initBooksNoPage.forEach((el) => {
      const start = (i - 1) * perVirtualPage;
      const end = start + perVirtualPage;
      const nextVirtualPage = el.books.slice(start, end);
      if (nextVirtualPage.length !== 0) nextBooksNoPages.push(nextVirtualPage);
      // [ [books], [books]... ]
    });

    if (nextBooks.length === 0 && nextBooksNoPages.length === 0) break;

    const forMergingPage = nextBooks.map((el) => el);
    nextBooksNoPages.forEach((el) =>
      forMergingPage.push(el.slice(0, perVirtualPage))
    );
    if (process.env.DB_FETCH === 'yes')
      await urlMapDB.populateMaps(forMergingPage);
    books = await merger({
      books: forMergingPage,
      initialValue: books,
      urlMapDB,
      requestMap,
      potentialSameBooksMap,
    });
  }
  const nextPage = books.length > recordsCap;
  const start = skip;
  const end = limit + skip;
  if (process.env.DB_COMMIT === 'yes') {
    await updateDB(books, potentialSameBooksMap.getMap(), requestMap, urlMapDB);
  }
  console.log('REQUEST_MAP: ', requestMap.getMap().size);
  sendResponse(res, {
    page,
    books: books.slice(start, end),
    nextPage,
    previousPage: page > 1,
  });
});

/**
 * TOP BOOKS
 */
const getParsedTopBooks = (() => {
  const timeout = 10000;
  const url = {
    delfi: `https://www.delfi.rs/top-liste.html`,
    vulkan: `https://www.knjizare-vulkan.rs/`,
    evrobook: `https://evrobook.rs/`,
    korisnaknjiga: `https://www.korisnaknjiga.com/top-lista`,
  };
  return async (src) => {
    const response = await axios(url[src], { timeout });
    if (response.status >= 300) return [];
    const books = topBooksParser[`${src}Parser`](response.data);
    return books;
  };
})();

exports.getTopBooks = catchAsync(async (req, res, next) => {
  const topBooks = await TopBooks.find();
  res.status(200).json({
    status: 'success',
    topBooks,
  });
});

exports.updateTopBooksDB = catchAsync(async (req, res, next) => {
  const { select } = req.query;
  const selectArr = select
    ? select.split(' ').reduce((acc, cur) => {
        if (Object.values(sources).includes(cur)) acc.push(cur);
        return acc;
      }, [])
    : Object.values(sources);
  const booksPromises = await Promise.allSettled(
    selectArr.map((src) => getParsedTopBooks(src))
  );
  const commandsDB = booksPromises.reduce((acc, curr) => {
    if (curr.status === 'fulfilled') {
      acc.push({
        updateOne: {
          filter: { source: curr.value.source },
          update: {
            $currentDate: {
              dateModified: true,
            },
            $set: { books: curr.value.books },
          },
          upsert: true,
        },
      });
    }
    return acc;
  }, []);
  const updateInfo = await TopBooks.bulkWrite(commandsDB);
  res.status(200).json({
    status: 'success',
    data: {
      updateInfo,
    },
  });
});
