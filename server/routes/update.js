const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

router.post("/", async (req, res) => {
  try {
    const { error } = validateUpdatePassword(req.body);
    if (error) {
      return res.status(400).send({ message: error.details[0].message });
    }

    // Assuming you are sending the user's email and both the old and new passwords
    const { email, currentPassword, newPassword } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Check if the current password is valid
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).send({ message: "Invalid current password" });
    }

    // Validate the new password complexity
    const newPasswordError = validateNewPasswordComplexity(newPassword);
    if (newPasswordError) {
      return res.status(400).send({ message: newPasswordError.details[0].message });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

const validateUpdatePassword = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    currentPassword: Joi.string().required().label("Current Password"),
    newPassword: passwordComplexity().required().label("New Password"),
  });
  return schema.validate(data);
};

const validateNewPasswordComplexity = (password) => {
  const schema = Joi.object({
    newPassword: passwordComplexity().required().label("New Password"),
  });
  const { error } = schema.validate({ newPassword: password });
  return error;
};

module.exports = router;