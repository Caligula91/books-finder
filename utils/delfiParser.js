const HTMLParser = require('node-html-parser');
const titleFormater = require('./titleFormater');

const formatPrices = (el, discount) => {
  const arr = el.innerText.split('din');
  let price;
  let onlinePrice;
  if (arr.length > 2) {
    price = arr[2].trim().replace('.', '').replace(',', '.');
    if (discount) {
      discount = parseFloat(discount.replace(/%/, ''));
      onlinePrice = price - (price * discount) / 100;
    }
  } else {
    price = arr[0].trim().replace('.', '').replace(',', '.');
  }
  return {
    price: parseFloat(price),
    onlinePrice: parseFloat(onlinePrice),
  };
};

exports.parseBooks = (html) => {
  const books = [];
  try {
    const dom = HTMLParser.parse(html).querySelector('.content-holder');
    const items = dom.querySelectorAll('.listing-item');
    items.forEach((el) => {
      const url = el.querySelector('a').getAttribute('href');
      const img = el.querySelector('img').getAttribute('src');
      const domDiscount = el.querySelector('.cena-popust-badge');
      const discount = domDiscount
        ? domDiscount.querySelector('p').innerText.trim()
        : undefined;
      const body = el.querySelector('.body');
      const rawTitle = body.querySelector('a').getAttribute('title');
      const author = body.querySelector('p').innerText.trim();
      const { price, onlinePrice } = formatPrices(
        body.querySelector('.price'),
        discount
      );
      const { title, ilustrated, extended, part, slug } = titleFormater(
        rawTitle
      );
      books.push({
        title,
        author,
        slug,
        img,
        ilustrated,
        extended,
        part,
        source: {
          name: 'Delfi',
          logo: '/img/logo/delfi.png',
          price,
          onlinePrice,
          url,
        },
      });
    });
  } catch (error) {
    console.log('DELFI_PARSER', error);
    return [];
  }
  return books;
};

exports.getNumPages = (html) => {
  try {
    const dom = HTMLParser.parse(html);
    const pageItems = dom.querySelectorAll('.page-link');
    if (pageItems.length === 0) return 1;
    const numPages = pageItems[pageItems.length - 1 - 1].innerText.trim();
    return parseInt(numPages, 10);
  } catch (error) {
    console.log('DELFI_PAGE_PARSER', error);
    return 1;
  }
};
