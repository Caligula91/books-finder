const modifyNotSameMap = (sameMap, notSameMap) => {
  console.log(sameMap);
  console.log('========================');
  console.log(notSameMap);
  notSameMap.forEach((value, key) => {
    const sameSet = sameMap.get(key);
    if (sameSet) {
      const difference = new Set(
        [...value].filter((el) => !sameSet.includes(el))
      );
      if (difference.size !== 0) notSameMap.set(key, difference);
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
