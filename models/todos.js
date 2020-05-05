// The model!
function init(Schema, mongoose) {
  const UserProfileSchema = Schema({
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
  return mongoose.model("users", UserProfileSchema);
}

module.exports.init = init;
