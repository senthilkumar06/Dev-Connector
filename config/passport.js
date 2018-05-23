const jwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const users = mongoose.model("users");
const keys = require("../config/keys");

const opts = {};
opts.secretOrKey = keys.secretKey;
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();

module.exports = passport => {
  passport.use(
    new jwtStrategy(opts, (payload, done) => {
      users.findById(payload.id).then(user => {
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};
