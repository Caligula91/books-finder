exports.getTestData = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'Test route and controller',
    data: {
      name: 'Mihajlo',
      age: 28,
    },
  });
};
