const HTMLParser = require('node-html-parser');
const priceFormater = require('./priceFormater');

exports.delfiParser = (html) => {
  const books = [];
  const dom = HTMLParser.parse(html);
  const domContent = dom.querySelector('.carousel-content');
  const booksListDOM = domContent
    ? domContent.querySelectorAll('.listing-item')
    : undefined;
  if (!booksListDOM) return books;
  booksListDOM.forEach((el) => {
    try {
      const url = el.querySelector('a').getAttribute('href');
      const img = el.querySelector('img').getAttribute('src');
      const bodyDOM = el.querySelector('.body');
      const title = bodyDOM.querySelector('a').innerText.trim();
      const author = bodyDOM.querySelector('p').innerText.trim();
      const priceDOM = el.querySelector('.price');
      const { price, onlinePrice } = priceFormater.delfiFormatPrices(priceDOM);
      books.push({
        title,
        author,
        img,
        url,
        price,
        onlinePrice,
      });
    } catch (error) {
      console.log('PARSING DELFI TOP BOOKS: ', error.message);
    }
  });
  return {
    source: 'delfi',
    records: books.length,
    books,
  };
};

exports.vulkanParser = (html) => {
  const books = [];
  const dom = HTMLParser.parse(html);
  const topTenListDOM = dom.querySelector('.top-ten-list');
  const booksListDOM = topTenListDOM
    ? topTenListDOM.querySelectorAll('.product-item')
    : undefined;
  if (!booksListDOM) return books;
  booksListDOM.forEach((el) => {
    try {
      const urlTitleDom = el.querySelector('a');
      const url = urlTitleDom.getAttribute('href');
      const title = urlTitleDom.getAttribute('title');
      const img = `https://www.knjizare-vulkan.rs`.concat(
        el.querySelector('img').getAttribute('src')
      );
      const author = el
        .querySelector('.atributs-wrapper')
        .querySelector('a')
        .getAttribute('title');
      const priceDOM = el.querySelector('.prices-wrapper');
      const { price, onlinePrice } = priceFormater.vulkanFormatPrices(
        priceDOM.querySelector('.current-price'),
        priceDOM.querySelector('.prev-price')
      );
      books.push({
        title,
        author,
        img,
        url,
        price,
        onlinePrice,
      });
    } catch (error) {
      console.log('PARSING VULKAN TOP BOOKS: ', error.message);
    }
  });
  return {
    source: 'vulkan',
    records: books.length,
    books,
  };
};

exports.evrobookParser = (html) => {
  const books = [];
  const dom = HTMLParser.parse(html);
  const containerListDOM = dom.querySelectorAll('.swiper-container-holder');
  // CRITICAL PART, MAYBE INDEX WILL CHANGE BECAUSE OF BANNERS
  const containerDOM = containerListDOM ? containerListDOM[4] : undefined;
  const booksListDOM = containerDOM
    ? containerDOM.querySelectorAll('.product-holder')
    : undefined;
  if (!booksListDOM) return books;
  booksListDOM.forEach((el) => {
    try {
      const domImgUrl = el.querySelector('.product-img');
      const img = domImgUrl.querySelector('img').getAttribute('src');
      const url = `https://evrobook.rs/`.concat(
        domImgUrl.querySelector('a').getAttribute('href')
      );
      const title = el
        .querySelector('.sku-holder')
        .querySelector('h3')
        .innerText.trim();
      const domPrice = el.querySelector('.price-holder');
      const salesPrice = domPrice.querySelector('.salesprice');
      const regularPrice = domPrice.querySelector('.price');
      let rawPrice;
      if (salesPrice) rawPrice = salesPrice.innerText.trim();
      else if (regularPrice) rawPrice = regularPrice.innerText.trim();
      else return;
      const price = priceFormater.evrobookFormatPrices(rawPrice);
      books.push({
        title,
        img,
        url,
        onlinePrice: price,
      });
    } catch (error) {
      console.log('PARSING EVROBOOK TOP BOOKS: ', error.message);
    }
  });
  return {
    source: 'evrobook',
    records: books.length,
    books,
  };
};

exports.korisnaknjigaParser = (html) => {
  const books = [];
  const dom = HTMLParser.parse(html);
  const knjigeHolder = dom.querySelectorAll('#knjige-holder');
  if (!knjigeHolder) return books;
  knjigeHolder.forEach((el) => {
    try {
      const domPrice = el.querySelector('.override-cena');
      if (!domPrice) return;
      const price = priceFormater.korisnaKnjigaFormatPrices(
        domPrice.querySelector('#kolicna').innerText.trim()
      );
      const title = el
        .querySelector('#naslov')
        .querySelector('a')
        .innerText.trim();
      const author = el
        .querySelector('#pisac')
        .querySelector('a')
        .innerText.trim();
      const domImgUrl = el.querySelector('#naslovna-strana');
      const img = domImgUrl.querySelector('img').getAttribute('src');
      const url = `https://www.korisnaknjiga.com/${domImgUrl
        .querySelector('a')
        .getAttribute('href')}`;
      books.push({
        title,
        author,
        img,
        url,
        onlinePrice: price,
      });
    } catch (error) {
      console.log('PARSING KORISNA_KNJIGA TOP BOOKS: ', error.message);
    }
  });
  return {
    source: 'korisnaknjiga',
    records: books.length,
    books,
  };
};
