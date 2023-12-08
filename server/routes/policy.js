// policies.route.js
const express = require("express");
const router = express.Router();
const Policy = require("../models/Policy");

// Get the latest policy
router.get('/:type', async (req, res) => {
  try {
    const { type } = req.params;

    // Find the policy with the specified type
    const policy = await Policy.findOne({ type });

    // Respond with the policy content
    if (policy) {
      res.json({ content: policy.content, lastUpdated: policy.lastUpdated });
    } else {
      res.status(404).json({ error: 'Policy not found' });
    }
  } catch (error) {
    console.error('Error fetching policy content:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Update the policy (Only accessible by Site Manager)
router.put('/', async (req, res) => {
  try {
    const { type, content } = req.body;

    // Check if the policy with the specified type already exists
    let existingPolicy = await Policy.findOne({ type });

    if (existingPolicy) {
      // If it exists, update the content and lastUpdated
      existingPolicy.content = content;
      existingPolicy.lastUpdated = new Date();
      await existingPolicy.save();
    } else {
      // If it doesn't exist, create a new policy
      await Policy.create({ type, content, lastUpdated: new Date() });
    }

    // Respond with success
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating policy:', error);
    res.status(500).json({ success: false, error: 'Failed to update policy. Please try again.' });
  }
});
module.exports = router;
