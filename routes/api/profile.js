const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

// Load Profile validator
const validateProfileInput = require("../../validation/profile");

// Load Profile Model
const Profile = require("../../models/Profile");

// Load User Model
const User = require("../../models/User");

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get("/test", (req, res) =>
  res.json({
    message: "Profile works"
  })
);

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    errors = {};
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (!profile) {
          errors.noProfile = "There is no profile for this user";
          res.status(400).json(errors);
        }
        res.json(profile);
      })
      .catch(err => {
        res.status(404).json(err);
      });
  }
);

// @route   POST api/profile
// @desc    Create | Edit user profile
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.users = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;

    // Social
    social = {};
    if (typeof req.body.social !== "undefined") {
      if (req.body.youtube) social.youtube = req.body.youtube;
      if (req.body.twitter) social.twitter = req.body.twitter;
      if (req.body.linkedin) social.linkedin = req.body.linkedin;
      if (req.body.facebook) social.facebook = req.body.facebook;
      if (req.body.instagram) social.instagram = req.body.instagram;
      profileFields.social = social;
    }
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    // Skills - split into array
    if (typeof req.body.skills !== undefined) {
      profileFields.skills = req.body.skills.split(",");
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (!profile) {
        // Update - Profile exists
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create - Profile doesnot exist
        // Check if handle exisits
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (!profile) {
            errors.handle = "Handle already exists";
            res.status(400).json(errors);
          }
          new Profile(profileFields)
            .save()
            .pomise(profile => res.json(profile));
        });
      }
    });
  }
);

module.exports = router;
