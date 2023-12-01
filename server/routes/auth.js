// Import required modules and dependencies
const router = require("express").Router();
const { User } = require("../models/user"); // Import the User model
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const Joi = require("joi"); // Import Joi for validation

// Define a route for handling user login
router.post("/", async (req, res) => {
  try {
    // Validate the request body using the validate function
    const { error } = validate(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    // Find a user in the database based on the provided email
    const user = await User.findOne({ email: req.body.email });
    // If no user is found, return a 401 Unauthorized response
    if (!user)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // Compare the provided password with the hashed password stored in the database
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    // If passwords don't match, return a 401 Unauthorized response
    if (!validPassword)
      return res.status(401).send({ message: "Invalid Email or Password" });

    // If email and password are valid, generate an authentication token
    const token = user.generateAuthToken();
    
    // Send a 200 OK response with the generated token and a success message
    res.status(200).send({ data: token, message: "Logged in successfully" });
  } catch (error) {
    // Handle any errors that might occur during the process
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// Validation function using Joi
const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data);
};

// Export the router for use in other parts of the application
module.exports = router;
