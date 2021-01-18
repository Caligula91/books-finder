const modifyNotSameMap = (sameMap, notSameMap) => {
  console.log(sameMap);
  console.log('========================');
  console.log(notSameMap);
  notSameMap.forEach((value, key) => {
    const sameSet = sameMap.get(key);
    if (sameSet) {
      sameSet.forEach((el) => value.delete(el));
      if (value.size === 0) notSameMap.delete(key);
    }
  });
};

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
  modifyNotSameMap(urlMap, notSameMap);
  console.log('=======================');
  console.log(notSameMap);
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
  //const bulkWriterResults = await BookUrlMap.bulkWrite(commandsArr);
  //return bulkWriterResults;
};
