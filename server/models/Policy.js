// policies.js
const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  type: { type: String, default: "Policy" },
  content: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

const Policy = mongoose.model("Policy", policySchema);

module.exports = Policy;
