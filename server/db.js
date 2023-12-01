// Importing the Mongoose library
const mongoose = require("mongoose");

// Exporting a function that connects to the MongoDB database
module.exports = () => {
  // Connection parameters for Mongoose
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };


  try {
    // Attempting to connect to the MongoDB database using the connection string from the environment variables
    mongoose.connect(process.env.DB, connectionParams);
    console.log("Connected to the database successfully");
  } catch (error) {
    // Handling errors if the connection fails
    console.log(error);
    console.log("Could not connect to the database!");
  }
};
