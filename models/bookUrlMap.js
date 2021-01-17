const mongoose = require('mongoose');

const bookUrlMapSchema = new mongoose.Schema({
  url: {
    type: String,
    unique: true,
    required: [true, 'Url as a key is required'],
  },
  sameBooks: [String],
  notSameBooks: [String],
});

const BookUrlMap = mongoose.model('BookUrlMap', bookUrlMapSchema);

module.exports = BookUrlMap;
