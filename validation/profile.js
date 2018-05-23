const Validator = require("validator");
const isEmpty = require("./is-empty");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.status = !isEmpty(data.status) ? data.status : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";

  if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = "handle needs to be between 2 and 40 characters";
  }

  if (Validator.isEmpty(data.handle)) {
    errors.handle = "Profile handle field is required";
  }

  if (Validator.isEmpty(data.status)) {
    errors.status = "Status field is required";
  }

  if (Validator.isEmpty(data.skills)) {
    errors.skills = "Skills field is required";
  }

  if (!isEmpty(data.website)) {
    if (!Validator.isURL(website)) {
      errors.website = "Not a valid url";
    }
  }

  if (!isEmpty(data.youtube)) {
    if (!Validator.isURL(youtube)) {
      errors.youtube = "Not a valid url";
    }
  }

  if (!isEmpty(data.facebook)) {
    if (!Validator.isURL(facebook)) {
      errors.facebook = "Not a valid url";
    }
  }

  if (!isEmpty(data.twitter)) {
    if (!Validator.isURL(twitter)) {
      errors.twitter = "Not a valid url";
    }
  }

  if (!isEmpty(data.linkedin)) {
    if (!Validator.isURL(linkedin)) {
      errors.linkedin = "Not a valid url";
    }
  }

  if (!isEmpty(data.instagram)) {
    if (!Validator.isURL(instagram)) {
      errors.instagram = "Not a valid url";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};