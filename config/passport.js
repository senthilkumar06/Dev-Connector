const jwtStrategy = require("passport-jwt").Strategy;
const extractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const users = mongoose.model("users");
const keys = require("./keys");

const opts = {};
opts.secretOrKey = keys.secretKey;
opts.jwtFromRequest = extractJwt.fromAuthHeaderAsBearerToken();

module.exports = passport => {
  passport.use(
    new jwtStrategy(opts, (payload, done) => {
      users.findOne({ id: payload.id }, (error, user) => {
        if (error) {
          return done(error, false);
        } else {
          if (user) {
            return done(null, user);
          } else {
            return done(error, false);
          }
        }
      });
    })
  );
};
