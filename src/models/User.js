const mongoose = require('mongoose');

const User = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

module.exports = User;
