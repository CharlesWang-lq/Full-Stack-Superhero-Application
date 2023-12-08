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

router.get("/authed", async (req, res) => {
  try {
    const usersEmail  = req.query.userEmail;
    console.log(usersEmail);
    
    // Retrieve all public lists and private lists of the authenticated user
    const lists = await List.find({
      $or: [
        { private: false }, // Public lists
        { "creator.email": usersEmail }, // Private lists of the authenticated user
      ],
    }).sort({ lastModified: -1 });

    res.status(200).send(lists);
  } catch (error) {
    console.error("Error getting lists:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/all-lists', async (req, res) => {
  try {
    // Fetch all lists from the database
    const allLists = await List.find();
    res.status(200).json(allLists);
  } catch (error) {
    console.error('Error fetching all lists:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.put('/toggle-visibility/:listId/:reviewId', async (req, res) => {
  try {
    const { listId, reviewId } = req.params;
    const list = await List.findById(listId);

    if (!list) {
      return res.status(404).send({ message: 'List not found' });
    }

    const review = list.reviews.id(reviewId);
    if (!review) {
      return res.status(404).send({ message: 'Review not found' });
    }

    // Toggle the isVisible attribute
    review.isVisible = !review.isVisible;

    // Save the changes
    await list.save();

    res.status(200).send({ message: 'Review visibility toggled successfully', isVisible: review.isVisible });
  } catch (error) {
    console.error('Error toggling review visibility:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

// Create a new list
router.post('/', async (req, res) => {
  try {
    const newListData = req.body;
    // Check if a list with the same name already exists
    const existingList = await List.findOne({ name: newListData.name });
    

    if (existingList) {
      return res.status(400).json({ message: "A list with the same name already exists." });
    }

    // Create a new List document
    const newList = new List({
      name: newListData.name,
      creator: newListData.creator,
      heroes: newListData.heroes.map(hero => {
        return hero.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      }),
      averageRating: 0,
      private: newListData.visibility === "private",
      lastModified: Date.now(),
      description: newListData.description,
      // Add other fields as needed
    });

    // Save the new list to the database
    const savedList = await newList.save();

    // Respond with the saved list
    res.status(201).json(savedList);
  } catch (error) {
    console.error("Error creating list:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post('/reviews', async (req, res) => {
  const { listId, userName, rating, comment } = req.body;

  try {
    // Find the list by id
    const existingList = await List.findById(listId);

    // Check if the list exists
    if (!existingList) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Add the review to the list
    existingList.reviews.push({
      userName,
      rating,
      comments: comment,
      createdAt: new Date(),
    });

    // Recalculate the average rating
    const totalRating = existingList.reviews.reduce((sum, review) => sum + review.rating, 0);
    existingList.averageRating = totalRating / existingList.reviews.length;

    // Save the updated list
    await existingList.save();

    res.json({ message: 'Review added successfully', list: existingList });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a list
router.put('/:listId', async (req, res) => {
  const { listId } = req.params;

  // Assuming req.body contains the updated list information
  const { name, description, visibility, heroes } = req.body;

  try {
    // Find the list by id
    const existingList = await List.findById(listId);

    // Check if the list exists
    if (!existingList) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Update the list information
    existingList.name = name;
    existingList.description = description;
    existingList.private = visibility === "private";
    existingList.heroes = heroes;
    existingList.lastModified = Date.now(); // Update the last modified date

    // Save the changes
    await existingList.save();

    res.json(existingList);
  } catch (error) {
    console.error('Error updating list:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE a list by ID
router.delete('/:id', async (req, res) => {
  const listId = req.params.id;

  try {
    // Find the list by ID
    const list = await List.findById(listId);

    // Check if the list exists
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if the user has permission to delete the list (you might want to add this logic)
    // For example, you might check if the list creator's email matches the authenticated user's email.

    // Perform the deletion
    await List.findByIdAndDelete(listId);

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  
module.exports = router;