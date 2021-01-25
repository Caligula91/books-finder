const mongoose = require('mongoose');
const validator = require('validator');

const topBookSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      unique: true,
      required: [true, 'Top Books must have source'],
    },
    dateModified: {
      type: Date,
      default: Date.now(),
    },
    books: [
      {
        url: {
          type: String,
          required: [true, 'Book must have url'],
          validate: [validator.isURL, 'Invalid url format'],
        },
        title: {
          type: String,
          required: [true, 'Book must have a title'],
        },
        author: {
          type: String,
        },
        price: Number,
        onlinePrice: Number,
        img: {
          type: String,
          default: 'default_book.png',
        },
      },
    ],
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

topBookSchema.virtual('isUpdated').get(function () {
  const today = new Date();
  return (
    this.dateModified.getDate() === today.getDate() &&
    this.dateModified.getMonth() === today.getMonth() &&
    this.dateModified.getFullYear() === today.getFullYear()
  );
});

const TopBooks = mongoose.model('topBook', topBookSchema);

module.exports = TopBooks;
