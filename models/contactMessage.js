const mongoose = require('mongoose');
const validator = require('validator');

const contactMessageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Message must have email'],
    validate: [validator.isEmail, 'Invalid email format'],
  },
  message: {
    type: String,
    required: [true, 'Empty messages not allowed'],
  },
  dateRecieved: {
    type: Date,
    default: Date.now(),
  },
});

const ContactMessage = mongoose.model('contactmessages', contactMessageSchema);

module.exports = ContactMessage;
