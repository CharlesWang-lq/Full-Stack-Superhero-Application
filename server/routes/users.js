const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");



router.post("/", async (req, res) => {
	try {
		const { error } = validate(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		let user = await User.findOne({ email: req.body.email });
		if (user)
			return res
				.status(409)
				.send({ message: "User with given email already Exist!" });

		const salt = await bcrypt.genSalt(Number(process.env.SALT));
		const hashPassword = await bcrypt.hash(req.body.password, salt);

		user = await new User({ ...req.body, password: hashPassword }).save();

		const token = await new Token({
			userId: user._id,
			token: crypto.randomBytes(32).toString("hex"),
		}).save();
			// Inside your router.post("/") handler
		const frontendOrigin = req.get('Referer');
		const frontendUrl = new URL(frontendOrigin);
		const frontendBaseUrl = `${frontendUrl.protocol}//${frontendUrl.host}`;
		const url = `${frontendBaseUrl}/users/${user.id}/verify/${token.token}`;
		await sendEmail(user.email, "Verify Email", url);
		res.status(201).send({ message: "An Email Sent to your account, please check your inbox" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

router.get('/users', async (req, res) => {
	try {
	  // Fetch all users from the database
	  const users = await User.find({});
  
	  res.json(users);
	} catch (error) {
	  console.error('Error fetching users:', error);
	  res.status(500).json({ message: 'Internal Server Error' });
	}
  });

  // Express route to grant admin privileges to a user
router.post('/grantadmin/:userId', async (req, res) => {
	try {
	  const { userId } = req.params;
  
	  // Check if the user with the specified ID exists
	  const user = await User.findById(userId);
	  if (!user) {
		return res.status(404).json({ message: 'User not found' });
	  }
  
	  // Check if the user is already an admin
	  if (user.isAdmin) {
		return res.status(400).json({ message: 'User is already an admin' });
	  }
  
	  // Grant admin privileges
	  user.isAdmin = true;
	  await user.save();
  
	  res.json({ message: 'Admin privileges granted successfully' });
	} catch (error) {
	  console.error('Error granting admin privileges:', error);
	  res.status(500).json({ message: 'Internal Server Error' });
	}
  });

router.post("/deactivate", async (req, res) => {
	try {
	  const { email } = req.body;
	  const user = await User.findOne({ email });
  
	  if (!user) {
		return res.status(404).send({ message: "User not found" });
	  }
  
	  // Deactivate the account
	  user.isDeactivated = true;
	  await user.save();
  
	  res.status(200).send({ message: "Account deactivated successfully" });
	} catch (error) {
	  console.error(error);
	  res.status(500).send({ message: "Internal Server Error" });
	}
  });

router.get("/:id/verify/:token/", async (req, res) => {

	try {
		const user = await User.findOne({ _id: req.params.id });
		if (!user) return res.status(400).send({ message: "Invalid link" });

		const token = await Token.findOne({
			userId: user._id,
			token: req.params.token,
		});
		if (!token) return res.status(400).send({ message: "Invalid link" });

		await User.updateOne({ _id: user._id, verified: true });
		await token.remove();

		res.status(200).send({ message: "Email verified successfully" });
	} catch (error) {
		res.status(500).send({ message: "Internal Server Error" });
	}
});

// Add this to your router handling admin actions
router.put("/deactivate/:userId", async (req, res) => {
	try {
	  const user = await User.findById(req.params.userId);
  
	  if (!user) {
		return res.status(404).send({ message: "User not found" });
	  }
  
	  user.isDeactivated = !user.isDeactivated;
	  await user.save();
  
	  res.status(200).send({ message: "User deactivation status updated" });
	} catch (error) {
	  console.error("Error deactivating user:", error);
	  res.status(500).send({ message: "Internal Server Error" });
	}
  });
  

module.exports = router;
