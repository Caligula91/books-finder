const HTMLParser = require('node-html-parser');
const titleFormater = require('./titleFormater');
const { evrobookFormatPrices } = require('./priceFormater');

exports.parseBooks = (html) => {
  const books = [];
  try {
    const dom = HTMLParser.parse(html);
    const productsList = dom.querySelectorAll('.one-product');

    productsList.forEach((product) => {
      const domImgUrl = product.querySelector('.product-img');
      const img = domImgUrl.querySelector('img').getAttribute('src');
      // CHECK IF ITS ABSOLUTE PATH
      const url = domImgUrl.querySelector('a').getAttribute('href');
      const rawTitle = product
        .querySelector('.sku-holder')
        .querySelector('h3')
        .innerText.trim();
      const { title, ilustrated, extended, part, slug } = titleFormater(
        rawTitle
      );
      // PRICE NOT WORKING
      const domPrice = product.querySelector('.price-holder');
      const salesPrice = domPrice.querySelector('.salesprice');
      const regularPrice = domPrice.querySelector('.price');
      let rawPrice;
      if (salesPrice) rawPrice = salesPrice.innerText.trim();
      else if (regularPrice) rawPrice = regularPrice.innerText.trim();
      else return;
      const price = evrobookFormatPrices(rawPrice);
      books.push({
        title,
        author: undefined,
        slug,
        img,
        ilustrated,
        extended,
        part,
        source: {
          name: 'Evrobook',
          logo: '/img/logo/evrobooks.png',
          onlinePrice: price,
          url: `https://evrobook.rs/${url}`,
        },
      });
    });
  } catch (error) {
    console.log('EVROBOOK_PARSER ', error);
    return [];
  }
  return books;
};

exports.getNumPages = (html) => {
  try {
    const dom = HTMLParser.parse(html);
    const pageItems = dom.querySelector('.pagination').querySelectorAll('li');
    if (pageItems.length <= 1) return 1;
    const numPages = pageItems[pageItems.length - 1 - 1].innerText.trim();
    return parseInt(numPages, 10);
  } catch (error) {
    console.log('EVROBOOK_PAGE_PARSER ', error);
    return 1;
  }
};
