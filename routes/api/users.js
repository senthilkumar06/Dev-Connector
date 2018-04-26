const express = require("express");
const router = express.Router();

// Load user module
const User = require("../../models/User");

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    message: "Users works"
  })
);

// @route   GET api/users/register
// @desc    Register users route
// @access  Public

router.post("/register", (req, res) =>
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", // size 200
        r: "pg", // rating
        d: "mm" // Default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .error(err => console.log(err));
        });
      });
    }
  })
);

router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email }).then(user => {
    // check for user
    if (!user) {
      res.status(400).error({ errorMessage: "user not found" });
    } else {
      // check password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // Generate token
          res.json({ message: "password matched" });
        } else {
          res.status(400).json({ errorMessage: "Password Incorrect" });
        }
      });
    }
  });
});
module.exports = router;
