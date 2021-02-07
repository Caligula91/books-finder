const slugify = require('slugify');
const { romanToArab, isValidRoman } = require('roman-numbers');

const partsWords = [
  'prvi',
  'drugi',
  'treci',
  'cetvrti',
  'peti',
  'sesti',
  'sedmi',
  'osmi',
  'deveti',
  'deseti',
  'jedanaesti',
  'dvanaesti',
  'trinaesti',
  'cetrnaesti',
  'petnaesti',
  'sestnaesti',
  'sedamnaesti',
  'osamnaesti',
  'devetnaesti',
  'dvadeseti',
];
const romanNumerals = [
  'II',
  'III',
  'IV',
  'V',
  //'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
];
const serbianLatinRegExp = new RegExp(/(č|š|dž|ž|đ|ć)/, 'ig');
const getPart = (title) => {
  title = title.replace(serbianLatinRegExp, (char) => {
    switch (char.toLowerCase()) {
      case 'đ':
        return 'dj';
      case 'ž':
        return 'z';
      case 'ć':
        return 'c';
      case 'č':
        return 'c';
      case 'dž':
        return 'dz';
      case 'š':
        return 's';
      default:
        return '';
    }
  });
  // MIDDLE PART
  const partMatch = title.match(/(\d\.?|\w+)\s(deo\s|deo$)/i);
  const partMatchAlt = title.match(/\sdeo\s(\d\.?$|\w+$)/i);
  let part;
  if (partMatch) {
    let wordPart = slugify(partMatch[1], { lower: true });
    part = partsWords.findIndex((el) => el === wordPart) + 1;
    const partForRemoving = partMatch[0];
    if (!part) {
      wordPart = wordPart.replace(/,|\./g, '');
      part = romanToArab(wordPart.toUpperCase());
    }
    if (!part) {
      part = parseInt(wordPart, 10);
    }
    if (part) {
      title = title.replace(partForRemoving, '').trim();
    }
  } else if (partMatchAlt) {
    let wordPart = slugify(partMatchAlt[1], { lower: true });
    part = partsWords.findIndex((el) => el === wordPart) + 1;
    const partForRemoving = partMatchAlt[0];
    if (!part) {
      wordPart = wordPart.replace(/,|\./g, '');
      part = romanToArab(wordPart.toUpperCase());
    }
    if (!part) {
      part = parseInt(wordPart, 10);
    }
    if (part) {
      title = title.replace(partForRemoving, '').trim();
    }
  } else {
    part = romanNumerals.find((rom) => {
      const regExpStr = `\\s${rom}\\s`;
      const romanRegExp = new RegExp(regExpStr, 'ig');
      const romanMatch = title.match(romanRegExp);
      if (romanMatch) {
        // REMOVE ROMAN NUMERAL FROM TITLE
        title = title.replace(romanMatch[0], ' ').trim();
        return true;
      }
      return false;
    });
    part = part ? romanToArab(part) : undefined;
  }

  let endPart;
  const endPartMatch = title.match(/\b(\w+)$/i);
  if (endPartMatch) {
    if (isValidRoman(endPartMatch[0].toUpperCase())) {
      endPart = romanToArab(endPartMatch[0].toUpperCase());
      title = title.slice(0, endPartMatch.index).trim();
    } else if (parseInt(endPartMatch[0], 10)) {
      endPart = parseInt(endPartMatch[0], 10);
      title = title.replace(0, endPartMatch.index).trim();
    }
  }
  if (part && endPart && part !== endPart) part = undefined;
  return {
    title,
    part,
  };
};

/**
 * EXPORTING
 */
module.exports = (title) => {
  const originalTitle = title;
  const ilustrated = title.search(/ilustrovano/i) !== -1;
  let extended = false;
  const veznik = new RegExp(/\si\s/, 'ig');
  const sestica = new RegExp(/\svi\s/, 'ig');
  title = title
    .replace(/(–)/g, '-')
    .replace(/\((.*)\)/g, '')
    .replace(/\s+/g, ' ')
    .replace(/:/g, '')
    .replace('.', '')
    .replace(';', '')
    .trim();
  title = title.replace(veznik, ' ').replace(sestica, ' ');
  const titlePartObj = getPart(title);
  // eslint-disable-next-line prefer-destructuring
  title = titlePartObj.title;
  const part = titlePartObj.part ? titlePartObj.part : undefined;
  const ilustrovanoIndex = title.search(/ilustrovano/i);
  if (ilustrovanoIndex !== -1) {
    const str = title.search(/(pro.?ireno|dopunjeno)\s(i)/i);
    if (str !== -1) {
      extended = true;
      title = title.slice(0, str).trim();
    } else {
      title = title.slice(0, ilustrovanoIndex).trim();
    }
  }
  const povezIndex = title.search(/(mek|meki|tvrd|tvrdi)\s?-?\s?povez/i);
  if (povezIndex !== -1) {
    title = title.slice(0, povezIndex).trim();
    if (title[title.length - 1] === '-' || title[title.length - 1] === ',') {
      title = title.slice(0, title.length - 1).trim();
    }
  }
  title = title.replace(/-/g, '').replace(/\s+/g, ' ');
  return {
    title: originalTitle,
    ilustrated,
    extended,
    part,
    slug: slugify(title, { lower: true }).split('-'),
  };
};
