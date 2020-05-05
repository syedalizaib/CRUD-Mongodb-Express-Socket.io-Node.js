const express = require("express");
const router = express.Router();
const users = require("../models/users");

//it get all the users
router.get("/", async (req, res) => {
  try {
    const allUser = await users.find();
    res.json(allUser);
  } catch (err) {
    res.json({ message: err });
  }
});
//----------------------------------------------

//it get specific user by id
router.get("/:postId", async (req, res) => {
  try {
    const specificUser = await users.findById(req.params.postId);
    res.json(specificUser);
  } catch (err) {
    res.json({ message: err });
  }
});
//----------------------------------------------

//it saves user without async
// router.post("/", (req, res) => {
//   const user_obj = new users({
//     first_name: req.body.first_name,
//     last_name: req.body.last_name,
//     picture: req.body.picture,
//   });
//   const savedUser = await user_obj
//     .save()
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((err) => {
//       res.json({ message: err });
//     });
// });
//----------------------------------------------

//it saves user with async
router.post("/", async (req, res) => {
  const user_obj = new users({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    picture: req.body.picture,
  });
  try {
    const savedUser = await user_obj.save();
    res.json(savedUser);
  } catch (err) {
    res.json({ message: err });
  }
});
//----------------------------------------------

//it will remove specific user using delete method
router.delete("/:id", async (req, res) => {
  try {
    const removedUser = await users.deleteOne({ _id: req.params.id });
    res.json(removedUser);
  } catch (err) {
    res.json({ message: err });
  }
});
//----------------------------------------------

//it will update specific user
router.patch("/:id", async (req, res) => {
  try {
    const updatedUser = await users.updateOne(
      { _id: req.params.id },
      { $set: { last_name: req.body.last_name } }
    );
    res.json(updatedUser);
  } catch (err) {
    res.json({ message: err });
  }
});
//----------------------------------------------

module.exports = router;
