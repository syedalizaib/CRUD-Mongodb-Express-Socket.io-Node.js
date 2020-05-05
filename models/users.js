const mongoose = require("mongoose");

const UserProfileSchema = mongoose.Schema({
  first_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    require: true,
  },
  picture: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("userss", UserProfileSchema);
