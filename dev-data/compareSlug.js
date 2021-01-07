/* eslint-disable no-plusplus */
const test1 = 'gospodar-prstenova-povratak-kralja';
const test2 = 'povratak-kralja-gospodar-prstenova';

// slug must be without parts
const isSlugEqual = (slug1, slug2) => {
  const slugArr1 = slug1.split('-');
  const slugArr2 = slug2.split('-');
  if (slugArr1.length === slugArr2.length) {
    return slugArr1.every((el1) => {
      return slugArr2.includes(el1);
    });
  }
  return false;
};
