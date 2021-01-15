const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required for creating a new user'],
    validate: {
      validator: function (name) {
        return validator.isAlpha(name.split(' ').join(''));
      },
      message: 'Name must contain only letters',
    },
    minlength: [3, 'Name must contain at least 3 character'],
    maxlength: [30, "Name can't contain more than 15 characters"],
  },
  password: {
    type: String,
    required: [true, 'Password is required for creating a new user'],
    validate: [
      validator.isAlphanumeric,
      'Password can contain only numbers and letters',
    ],
    minlength: [8, 'Password must contain at least 8 character'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: async function (value) {
        if (this instanceof mongoose.Query) {
          if (this.get('password') !== this.get('passwordConfirm'))
            return false;
          const hashedPassword = await bcrypt.hash(this.get('password'), 12);
          this._update.$set.password = hashedPassword;
          delete this._update.$set.passwordConfirm;
          return true;
        }
        return this.password === value;
      },
      message: 'Passwords are not equal',
    },
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required for creating a new user'],
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email format'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  photo: {
    type: String,
    default: 'default_user.jpg',
  },
  wishList: [
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
      image: {
        type: String,
        default: 'default_book.png',
      },
    },
  ],
});

/**
 * DOCUMENT MIDDLEWARE
 */
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

/**
 * QUERY MIDDLEWARE
 */
userSchema.pre(/update/i, async function (next) {
  if (this.get('password')) {
    // must substract 1000 [ms] because of latency
    this.set('passwordChangedAt', Date.now() - 1000);
  }
  next();
});

/**
 * INSTANCE METHODS
 */
userSchema.methods.isCorrectPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.isPasswordValid = function (tokenIssuedAt) {
  if (!this.passwordChangedAt) return true;
  // must divide by 1000 because getTime() returns miliseconds and jwt.iat is in seconds
  const changedTime = parseInt(this.passwordChangedAt.getTime(), 10);
  return changedTime < tokenIssuedAt * 1000;
};
userSchema.methods.getResetTokens = function () {
  const resetToken = crypto.randomBytes(24).toString('hex');
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return {
    resetToken,
    passwordResetToken,
    passwordResetExpires,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
