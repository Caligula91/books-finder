/* eslint-disable no-plusplus */
const slugify = require('slugify');

const x = 'Dz. R. R. Tolkin';
const y = 'Džon Ronald Rejel Tolkin';
const test1 = 'Dzoan Rouling';
const test2 = 'Dž. K. Rouling';
const test3 = 'Rowling';

/**
 * OLD WAY
 */
// const isAuthorEqual = (author1, author2) => {
//   const slug1 = slugify(author1, { lower: true });
//   const slug2 = slugify(author2, { lower: true });
//   const arr1 = slug1.split('-');
//   const arr2 = slug2.split('-');
//   if (arr1.length === arr2.length) {
//     for (let i = 0; i < arr1.length; i++) {
//       let flag = false;
//       if (arr1[i] === arr2[i]) {
//         flag = true;
//       } else if (
//         arr1[i].charAt(arr1[i].length - 1) === '.' &&
//         arr2[i].startsWith(arr1[i].slice(0, arr1[i].length - 1))
//       ) {
//         flag = true;
//       } else if (
//         arr2[i].charAt(arr2[i].length - 1) === '.' &&
//         arr1[i].startsWith(arr2[i].slice(0, arr2[i].length - 1))
//       ) {
//         flag = true;
//       }
//       if (!flag) return false;
//     }
//     return true;
//   }
//   return false;
// };

const isAuthorEqual = (author1, author2) => {
  const slug1 = slugify(author1, { lower: true });
  const slug2 = slugify(author2, { lower: true });
  const arr1 = slug1.split('-');
  const arr2 = slug2.split('-');
  return arr1[arr1.length - 1] === arr2[arr2.length - 1];
};

console.log(isAuthorEqual(test1, test2));
