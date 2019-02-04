const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Validation
const validateProfileInput = require('../../validation/profile');
const validateExperienceInput = require('../../validation/experience');
const validateEducationInput = require('../../validation/education');

// Load Profile Model
const Profile = require('../../models/Profile');
// Load User Model
const User = require('../../models/User');

// @route   GET api/profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.status(403).json({}));

// @route   GET api/profile
// @desc    Get current users profile
// @access  Private
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const errors = {};

    Profile.findOne({ user: req.user.id })
      .populate('user', ['name', 'avatar'])
      .then(profile => {
        if (!profile) {
          errors.noprofile = 'There is no profile for this user';
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   GET api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
  const errors = {};

  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.noprofile = 'There are no profiles';
        return res.status(404).json(errors);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profile: 'There are no profiles' }));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};

  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public

router.get('/user/:user_id', (req, res) => {
  const errors = {};

  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noprofile = 'There is no profile for this user';
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: 'There is no profile for this user' })
    );
});

// @route   POST api/profile
// @desc    Create or edit user profile
// @access  Private
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.handle) profileFields.handle = req.body.handle;
    if (req.body.company) profileFields.company = req.body.company;
    if (req.body.website) profileFields.website = req.body.website;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.bio) profileFields.bio = req.body.bio;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername)
      profileFields.githubusername = req.body.githubusername;
    // Skills - Spilt into array
    if (typeof req.body.skills !== 'undefined') {
      profileFields.skills = req.body.skills.split(',');
    }

    // Social
    profileFields.social = {};
    if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.json(profile));
      } else {
        // Create

        // Check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then(profile => {
          if (profile) {
            errors.handle = 'That handle already exists';
            res.status(400).json(errors);
          }

          // Save Profile
          new Profile(profileFields).save().then(profile => res.json(profile));
        });
      }
    });
  }
);

// @route   POST api/profile/experience
// @desc    Add experience to profile
// @access  Private
router.post(
  '/experience',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newExp = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.experience.unshift(newExp);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/education
// @desc    Add education to profile
// @access  Private
router.post(
  '/education',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    // Check Validation
    if (!isValid) {
      // Return any errors with 400 status
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id }).then(profile => {
      const newEdu = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      };

      // Add to exp array
      profile.education.unshift(newEdu);

      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private
router.delete(
  '/experience/:exp_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);

        // Splice out of array
        profile.experience.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile/education/:edu_id
// @desc    Delete education from profile
// @access  Private
router.delete(
  '/education/:edu_id',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        // Get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);

        // Splice out of array
        profile.education.splice(removeIndex, 1);

        // Save
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id }).then(() => {
      User.findOneAndRemove({ _id: req.user.id }).then(() =>
        res.json({ success: true })
      );
    });
  }
);


const json = {
  "id": 174667,
  "name": "WAL-MART DC 7055",
  "addressLine1": "100, S 500 E",
  "addressLine2": null,
  "city": "Gas City",
  "postal": "46933",
  "county": null,
  "district": null,
  "state": "IN",
  "country": "US",
  "timezone": "Indiana (East)",
  "latitude": "40.47694",
  "longitude": "-85.58207",
  "amenities": {
      "stopDetails": {
          "streetAddress": "100 FISCHER PARKWAY",
          "city": "Gas City",
          "zip": "46933"
      },
      "generalInformation": {
          // "hoursOfOperation": "09:00 AM - 01:00PM",
          // "shuttleProvider": "t",
          // "nearestMotel": "t",
          // "cagFacility": "t",
          // "fuelStations": 20,
          // "isDroplotFenced": false,
          // "rawPackLoads": 100,
          // "finishedGoodsLoads": 10,
          // "nearestTruckStop": "15",
          // "nearestWeighStation": "2",
          // "rawPackDockDoors": "100",
          // "availableParkingSpots": 60,
          // "droplotAvailableSpots": 120
      },
      "contactInfo": {
          "afterHoursContact": "15199619622",
          "plantManagerName": "Bob",
          "plantManagerEmail": "bob@def.com",
          "plantManagerPhone": "17656777000",
          "operationsManagerName": "Sally Fields",
          "operationsManagerEmail": "sally.fields@gmail.com",
          "appointmentPhone": "17656777000",
          "appointmentEmail": "nick@def.com",
          "appointmentPreference": "Nick",
          "appointmentFax": "+17328590249"
      },
      "onSiteAmenities": {
          "isRestaurantsAvailable": true,
          "isShowerAvailable": true,
          "isWifi": true,
          "isAtmAvailable": false,
          "documentMailingServiceAvailable": false,
          "overnightParkingAllowed": true,
          "truckingServiceAvailable": true,
          "certifiedWeighingScaleAvailable": false,
          "isDriverLoungeOnsite": true,
          "welcomeCenterAvailable": true,
          "referFuelingAvailable": true
      },
      "requiredDocuments": {
          "isPhotoRequired": true,
          "isPuNumberRequired": false,
          "requiredDocuments": "Seal Number",
          "isSealNumberRequired": true
      },
      "images": [
          "https://c1.staticflickr.com/2/1451/26212113490_acc9489a82_b.jpg"
      ]
  },
  "reviews": [
      {
          "user_id": "Anbu",
          "title": "thanks",
          "content": "Databases tend to grow. At a certain point, their size becomes a liability, and we are not even considering extreme cases when the primary key hits the limit (although, this does happen). This article is written from experience: one of our clients, Gett, had a database table that grew over time to menacing proportions",
          "created_at": "2019-01-18T12:58:17.056Z",
          "updated_at": "2019-01-18T13:30:42.543Z"
      },
      {
          "address_id": "174666",
          "user_id": "Rajan",
          "title": "title",
          "content": "content",
          "created_at": "2019-01-18T11:38:10.731Z",
          "updated_at": "2019-01-18T11:38:10.731Z"
      }
  ],
  "ratings": {
      "0": 0,
      "1": 0,
      "2": 0,
      "3": 1,
      "4": 1,
      "5": 0,
      "overall": 3.5,
      "total": 2
  }
}

module.exports = router;
