const router = require("express").Router();

const { List, validateList } = require("../models/List");
const Joi = require("joi");


// Get public lists
router.get("/", async (req, res) => {
  try {
    // Retrieve up to 10 public lists ordered by lastModified
    const publicLists = await List.find({ private: false })
      .limit(10)
      .sort({ lastModified: -1 });

    res.status(200).send(publicLists);
  } catch (error) {
    console.error("Error getting public lists:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add more routes as needed

module.exports = router;