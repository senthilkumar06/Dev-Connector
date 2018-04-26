const mongoose = require("mongoose");

var schema = mongoose.Schema;

const userSchema = schema.createSchema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  avatar: {
    type: String
  },

  date: {
    type: Date,
    required: true,
    default: Date.now()
  }
});

module.exports = User = mongoose.model("users", userSchema);
