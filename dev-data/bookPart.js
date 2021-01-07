/* eslint-disable no-unused-vars */
/* eslint-disable no-plusplus */
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
// (đ|ž||ć|č|dž|š)
const title1 = 'SAJMON, SVETSKI PUTNIK 1. DEO - POLARNA PUSTOLOVINA';
const title2 = 'SAJMON, SVETSKI PUTNIK 1 DEO - POLARNA PUSTOLOVINA';
const title3 = 'SAJMON, SVETSKI PUTNIK šesti DEO - POLARNA PUSTOLOVINA';
const title4 = 'SAJMON, SVETSKI PUTNIK Xi DEO - POLARNA PUSTOLOVINA';
const title5 = 'SAJMON, SVETSKI PUTNIK I - POLARNA PUSTOLOVINA 4 deo';
const title6 = 'SAJMON, SVETSKI PUTNIK sedmi deo - POLARNA PUSTOLOVINA V';
const title7 = 'SAJMON, SVETSKI PUTNIK ii V - POLARNA PUSTOLOVINA VI';
const title8 = 'SAJMON, SVETSKI PUTNIK deo sedmi POLARNA PUSTOLOVINA VI';
const title9 = 'SAJMON, SVETSKI PUTNIK - POLARNA PUSTOLOVINA deo drugi';

const test1 = 'covek-buducnosti-vaspitavanje-roditelja-deo';
const test2 = 'SEĆANJA NA LED - deo prvi';
const test3 = 'GOSPODAR HAOSA - deo prvi';
const test4 = 'BUDA JE REKAO, DEO PRVI: SUSRET SA ŽIVOTNIM POTEŠKOĆAMA';
// deo prvi, number in middle of sentence
let title = test2;

const serbianLatinRegExp = new RegExp(/(č|š|dž|ž|đ|ć)/, 'ig');
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

const partMatch = title.match(/(\d\.?|\w+)\s(deo\s|deo$)/i);
const partMatchAlt = title.match(/\sdeo\s(\d\.?$|\w+$)/i);
console.log(partMatch);
console.log(partMatchAlt);
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
if (endPart && part !== endPart) {
  return undefined;
}
return part;

// LEFT TO DO
// 1. 'I/i' should be ignored when comparing slugs
// 2. If MIDDLE and END_PART are present then
// 3. 'VI' handle
