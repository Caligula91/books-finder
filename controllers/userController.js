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
  ).select('+wishList');
  if (!user) return next(new AppError('Book already in Wish List', 400));
  res.status(200).json({
    status: 'success',
    message: 'DEVELOPMENT',
    data: {
      user,
    },
  });
});

exports.removeWishBook = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    {
      _id: req.user.id,
    },
    {
      $pull: { wishList: { url: req.body.url } },
    },
    {
      new: true,
    }
  ).select('+wishList');
  // CHANGE CODE
  if (!user) return next(new AppError('User not found', 400));
  res.status(204).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.clearWishList = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    {
      _id: req.user.id,
    },
    {
      $set: { wishList: [] },
    },
    {
      new: true,
    }
  ).select('+wishList');
  if (!user) return next(new AppError('User not found', 400));
  res.status(204).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      active: false,
    },
    {
      new: true,
    }
  ).select('+active');
  if (user.active)
    return next(
      new AppError(
        'Failed to deactivate user, try again later or contact support',
        400
      )
    );
  next();
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const query = User.find().select('+active');
  if (req.query.wishlist === 'true') query.select('+wishList');
  const users = await query;
  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

exports.addUser = catchAsync(async (req, res, next) => {
  const user = await User.create({ ...req.body });
  user.password = undefined;
  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const query = User.findById(id).select('+active');
  if (req.query.wishlist === 'true') query.select('+wishList');
  const user = await query;
  if (!user) return next(new AppError('No user with provided id', 404));
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    { ...req.body },
    { runValidators: true, new: true, context: 'query' }
  ).select('+active +wishList');
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { hard } = req.query;
  if (hard === 'true') {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return next(new AppError('User not found', 400));
    res.status(201).json({
      status: 'success',
      message: 'user deleted forever',
      data: {
        user,
      },
    });
  } else {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    ).select('+active');
    if (user.active)
      return next(new AppError('Failed to deactivate user', 400));
    res.status(200).json({
      status: 'success',
      message: 'user deactivated',
      data: {
        user,
      },
    });
  }
});
