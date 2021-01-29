const HTMLParser = require('node-html-parser');
const titleFormater = require('./titleFormater');
const { korisnaKnjigaFormatPrices } = require('./priceFormater');

exports.parseBooks = (html) => {
  const books = [];
  try {
    const dom = HTMLParser.parse(html);
    const knjigeHolder = dom.querySelectorAll('#knjige-holder');

    knjigeHolder.forEach((item) => {
      const domPrice = item.querySelector('.override-cena');
      if (!domPrice) return;
      const price = korisnaKnjigaFormatPrices(
        domPrice.querySelector('#kolicna').innerText.trim()
      );
      const rawTitle = item
        .querySelector('#naslov')
        .querySelector('a')
        .innerText.trim();
      const { title, ilustrated, extended, part, slug } = titleFormater(
        rawTitle
      );
      const author = item
        .querySelector('#pisac')
        .querySelector('a')
        .innerText.trim();
      const domImgUrl = item.querySelector('#naslovna-strana');
      const img = domImgUrl.querySelector('img').getAttribute('src');
      const url = `https://www.korisnaknjiga.com/${domImgUrl
        .querySelector('a')
        .getAttribute('href')}`;
      books.push({
        title,
        author,
        slug,
        ilustrated,
        extended,
        part,
        source: {
          name: 'korisna_Knjiga',
          logo: '/img/logo/korisna_knjiga.png',
          onlinePrice: price,
          url,
          img,
          title,
          author,
        },
      });
    });
  } catch (error) {
    console.log('KORISNA_KNJIGA_PARSER', error);
    return [];
  }
  return books;
};
