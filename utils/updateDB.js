const BookUrlMap = require('../models/bookUrlMap');

module.exports = async (urlMap, notSameMap) => {
  const commandsArr = [];
  urlMap.forEach((value, key) => {
    commandsArr.push({
      updateOne: {
        filter: { url: key },
        update: {
          $addToSet: { sameBooks: { $each: value } },
        },
        upsert: true,
      },
    });
  });
  notSameMap.forEach((value, key) => {
    commandsArr.push({
      updateOne: {
        filter: { url: key },
        update: {
          $addToSet: { notSameBooks: { $each: Array.from(value) } },
        },
        upsert: true,
      },
    });
  });
  const bulkWriterResults = await BookUrlMap.bulkWrite(commandsArr);
  return bulkWriterResults;
};
