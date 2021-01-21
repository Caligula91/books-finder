const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/User');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION,
  });
};
const sendResponseWithToken = (user, res, statusCode) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    next();
  };
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, password, passwordConfirm, email } = req.body;
  const user = await User.create({ name, password, passwordConfirm, email });
  user.password = undefined;
  sendResponseWithToken(user, res, 201);
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Email and Password are required to login', 400));
  let user = await User.findOne({ email }).select('+password +active');
  if (!user.active)
    user = await User.findByIdAndUpdate(
      user.id,
      { active: true },
      { new: true }
    ).select('+password');
  if (!user || !(await user.isCorrectPassword(password, user.password)))
    return next(new AppError('Incorrect Email or Password', 400));
  user.password = undefined;
  user.active = undefined;
  sendResponseWithToken(user, res, 200);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;
  if (!currentPassword || !newPassword || !newPasswordConfirm)
    return next(
      new AppError(
        'Please provide current password, new password and confirm new password',
        400
      )
    );
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.isCorrectPassword(currentPassword, user.password)))
    return next(new AppError('You entered wrong old password', 400));
  if (await user.isCorrectPassword(newPassword, user.password))
    return next(
      new AppError('Your new password must be different from old password', 400)
    );
  await user.updateOne(
    {
      password: newPassword,
      passwordConfirm: newPasswordConfirm,
    },
    {
      runValidators: true,
      context: 'query',
    }
  );
  user.password = undefined;
  sendResponseWithToken(user, res, 200);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email)
    return next(new AppError('Email is required to recover password', 400));
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError('There is no user with given email', 404));
  const {
    resetToken,
    passwordResetToken,
    passwordResetExpires,
  } = user.getResetTokens();
  await user.updateOne(
    {
      passwordResetToken,
      passwordResetExpires,
    },
    { runValidators: false }
  );
  const url = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/password-reset/${resetToken}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: url,
    });
  } catch (error) {
    await user.updateOne(
      {
        $unset: {
          passwordResetToken: undefined,
          passwordResetExpires: undefined,
        },
      },
      {
        runValidators: false,
      }
    );
    return next(error);
  }
  res.status(200).json({
    status: 'success',
    message: 'Email sent, check your inbox',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide password and password confirm', 400)
    );
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOneAndUpdate(
    {
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() },
    },
    {
      passwordConfirm: req.body.passwordConfirm,
      password: req.body.password,
      $unset: {
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      },
    },
    { new: true, runValidators: true, context: 'query' }
  );
  if (!user) return next(new AppError('Invalid password reset token', 400));
  sendResponseWithToken(user, res, 200);
});

exports.logOut = (req, res, next) => {
  res.cookie('jwt', 'blank', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Loged out',
  });
};

// HANDLE WHEN USER IS DEACTIVATED
exports.protect = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return next(new AppError('You are not logged in', 401));
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select(
    '+passwordChangedAt +active'
  );
  if (!user) return next(new AppError('Invalid token', 401));
  if (!user.active) return next(new AppError('User is deactivated', 401));
  if (!user.isPasswordValid(decoded.iat))
    return next(
      new AppError(
        'You are using old password, please login and try again',
        401
      )
    );
  user.passwordChangedAt = undefined;
  user.active = undefined;
  req.user = user;
  next();
});
