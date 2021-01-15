const AppError = require('../utils/appError');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');

exports.getMe = (req, res, next) => {
  const { name, email, role, photo, wishList } = req.user;
  res.status(200).json({
    status: 'success',
    data: {
      name,
      email,
      role,
      photo,
      wishList,
    },
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const { name } = req.body;
  if (!name) return next(new AppError('Please provide new name', 400));
  if (req.user.name === name)
    return next(new AppError('New name must be different from old name', 400));
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name },
    { runValidators: true, new: true }
  );
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.addWishBook = catchAsync(async (req, res, next) => {
  if (req.user.wishList.length > 50)
    return next(new AppError('Wishlist maximus size is 50 books', 400));
  const user = await User.findOneAndUpdate(
    {
      _id: req.user.id,
      'wishList.url': { $ne: req.body.url },
    },
    {
      $push: { wishList: req.body },
    },
    {
      new: true,
      omitUndefined: true,
      runValidators: true,
    }
  );
  if (!user) return next(new AppError('Book already in wish list', 400));
  res.status(200).json({
    status: 'success',
    message: 'DEVELOPMENT',
    data: {
      user,
    },
  });
});
