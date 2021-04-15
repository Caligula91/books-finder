const slugify = require('slugify');
const HTMLParser = require('node-html-parser');
const stringSimilarity = require('string-similarity');

const getDetailsObject = {
  delfi: (html) => {
    let publisher;
    let povez = 'mek';
    let pages;
    try {
      const dom = HTMLParser.parse(html);
      publisher = slugify(
        dom.querySelectorAll('.author')[1].querySelector('a').innerText,
        { lower: true }
      );
      const domIndex = dom
        .querySelector('.tab-pane.podaci')
        .querySelector('.col-left')
        .querySelectorAll('p');
      let povezIndex = -1;
      let pagesIndex = -1;
      domIndex.forEach((el, index) => {
        if (el.innerText.trim().toLowerCase().startsWith('povez'))
          povezIndex = index;
        if (el.innerText.trim().toLowerCase().startsWith('broj strana'))
          pagesIndex = index;
      });
      const domDetails = dom
        .querySelector('.tab-pane.podaci')
        .querySelector('.col-right')
        .querySelectorAll('p');
      if (povezIndex !== -1) {
        povez = slugify(domDetails[povezIndex].innerText, { lower: true });
        povez = povez.startsWith('bros') ? 'mek' : povez;
      }
      if (pagesIndex !== -1)
        pages = parseInt(domDetails[pagesIndex].innerText, 10);
      return {
        publisher,
        povez,
        pages,
      };
    } catch (error) {
      // LOG SOMEWHERE URL AND VARIABLES
      return {
        publisher,
        povez,
        pages,
      };
    }
  },
  vulkan: (html) => {
    let publisher;
    let povez = 'mek';
    let pages;
    try {
      const dom = HTMLParser.parse(html);
      const domPublisher = dom
        .querySelector('.atributs-wrapper.chosen-atributes')
        .querySelector('.value a');
      publisher = slugify(domPublisher.innerText, { lower: true });
      const domDetails = dom.querySelector('#tab_product_specification');
      const domPovez = dom.querySelector('.attr-povez');
      if (domPovez) {
        povez = slugify(domPovez.querySelectorAll('td')[1].innerText, {
          lower: true,
        });
        povez = povez.startsWith('bros') ? 'mek' : povez;
      }
      const domPages = domDetails.querySelector('tbody').querySelectorAll('tr');
      // eslint-disable-next-line no-plusplus
      for (let i = domPages.length - 1; i >= 0; i--) {
        const temp = domPages[i].querySelectorAll('td');
        if (temp[0].innerText.trim().toLowerCase() === 'strana') {
          pages = parseInt(temp[1].innerText, 10);
          break;
        }
      }
      return {
        publisher,
        povez,
        pages,
      };
    } catch (error) {
      // LOG SOMEWHERE URL AND VARIABLES
      return {
        publisher,
        povez,
        pages,
      };
    }
  },
  korisna_knjiga: (html) => {
    let publisher;
    let povez = 'mek';
    let pages;
    try {
      const dom = HTMLParser.parse(html);
      const domData = dom
        .querySelector('.override-opis-knjige')
        .querySelectorAll('p');
      if (domData) {
        domData.forEach((el) => {
          if (el.getAttribute('title').toLowerCase() === 'brosiran') {
            povez = slugify(el.innerText, { lower: true });
            povez = povez.split('-')[1];
            povez = povez.startsWith('bros') ? 'mek' : povez;
          } else if (el.getAttribute('title').toLowerCase() === 'izdavac') {
            publisher = slugify(el.querySelector('a').innerText, {
              lower: true,
            });
          } else if (el.getAttribute('title').toLowerCase() === 'br.strana') {
            pages = parseInt(el.innerText.slice(11), 10);
          }
        });
      }
      return {
        publisher,
        povez,
        pages,
      };
    } catch (error) {
      // LOG SOMEWHERE URL AND VARIABLES
      return {
        publisher,
        povez,
        pages,
      };
    }
  },
  evrobook: (html) => {
    let povez = 'mek';
    let pages;
    try {
      const dom = HTMLParser.parse(html);
      const domDetails = dom.querySelector('ul.product-bullets');
      const rawPovez = domDetails
        ? domDetails.querySelectorAll('li')[2].innerText.trim().toLowerCase()
        : undefined;
      povez = rawPovez ? slugify(rawPovez.slice(7), { lower: true }) : povez;
      const rawPages = domDetails
        ? domDetails.querySelectorAll('li')[0].innerText.trim()
        : undefined;
      pages = rawPages ? parseInt(rawPages.slice(13), 10) : 0;
      return {
        publisher: 'evro-book',
        povez: povez === 'bros' ? 'mek' : povez,
        pages,
      };
    } catch (error) {
      return {
        publisher: 'evro-book',
        povez: povez === 'bros' ? 'mek' : povez,
        pages,
      };
    }
  },
};

const samePovez = (povez1, povez2) => {
  if (povez1.length === povez2.length) return povez1 === povez2;
  if (povez1.length > povez2.length) {
    return povez1.startsWith(povez2);
  }
  return povez2.startsWith(povez1);
};

const samePublisher = (publisher1, publisher2) => {
  publisher1 = publisher1.replace(/knjige|knjiga|izdavastvo|izdavac|,/gi, ' ');
  publisher1 = slugify(publisher1, { lower: true });
  publisher2 = publisher2.replace(/knjige|knjiga|izdavastvo|izdavac|,/gi, ' ');
  publisher2 = slugify(publisher2, { lower: true });
  const similarity = stringSimilarity.compareTwoStrings(publisher1, publisher2);
  return similarity >= 0.5;
};

// TOLERATE 10% DIFF NUM PAGES
const samePages = (data) => {
  const { pages1, author1, slug1, pages2, author2, slug2 } = data;
  const tolerate = slug1.length === slug2.length ? 10 : 5;
  if (pages1 && pages2) {
    const diff = Math.abs(pages1 - pages2);
    const perc1 = (100 * diff) / pages1;
    const perc2 = (100 * diff) / pages2;
    const percMean = (perc1 + perc2) / 2;
    return percMean < tolerate;
  }
  if (!author1 || !author2) return false;
  const similarity = stringSimilarity.compareTwoStrings(
    slugify(author1, { lower: true }),
    slugify(author2, { lower: true })
  );
  return similarity >= 0.35;
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

exports.secondCompare = (data1, data2) => {
  const { url1, html1, author1, slug1 } = data1;
  const { url2, html2, author2, slug2 } = data2;
  const source1 = getSource(url1);
  const source2 = getSource(url2);
  const obj1 = getDetailsObject[source1](html1);
  const obj2 = getDetailsObject[source2](html2);
  const publisher1 = obj1.publisher;
  const povez1 = obj1.povez;
  const pages1 = obj1.pages;
  const publisher2 = obj2.publisher;
  const povez2 = obj2.povez;
  const pages2 = obj2.pages;
  console.log(samePages({ pages1, author1, slug1, pages2, author2, slug2 }));
  console.log(samePublisher(publisher1, publisher2));
  console.log(samePovez(povez1, povez2));
  if (!samePages({ pages1, author1, slug1, pages2, author2, slug2 }))
    return false;
  if (!samePublisher(publisher1, publisher2)) return false;
  return samePovez(povez1, povez2);
};

exports.firstCompare = (() => {
  const isPartEqual = (part1, part2) => {
    if (part1 !== undefined && part2 !== undefined) {
      return part1 === part2;
    }
    return true;
  };
  const isIlustratedEqual = (ilustrated1, ilustrated2) => {
    return ilustrated1 === ilustrated2;
  };
  const isSlugEqual = (slug1, title1, slug2, title2) => {
    let longerArr;
    let shorterArr;
    if (slug1.length > slug2.length) {
      longerArr = slug1;
      shorterArr = slug2;
    } else {
      shorterArr = slug1;
      longerArr = slug2;
    }
    if (
      shorterArr.length !== longerArr.length &&
      shorterArr.length < Math.floor(longerArr.length / 2)
    )
      return false;
    const equal = shorterArr.every((el1) => {
      return longerArr.includes(el1);
    });
    if (!equal) {
      title1 = slugify(title1, { lower: true });
      title2 = slugify(title2, { lower: true });
      const similarity = stringSimilarity.compareTwoStrings(title1, title2);
      return similarity >= 0.75;
    }
    return equal;
  };
  return (book1, book2) => {
    return (
      isIlustratedEqual(book1.ilustrated, book2.ilustrated) &&
      isPartEqual(book1.part, book2.part) &&
      isSlugEqual(book1.slug, book1.title, book2.slug, book2.title)
    );
  };
})();
