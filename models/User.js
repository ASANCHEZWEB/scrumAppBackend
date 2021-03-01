const mongoose = require("mongoose");

const User = mongoose.model("User", {
  username: String,
  password: String,
  email:String,
  sessionStatus:Boolean,
  session: String,
});

module.exports = User;
