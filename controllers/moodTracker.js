const User = require("../models/user.js");

async function resolveCurrentUser(req) {
  if (req.session && req.session.userId) {
    return await User.findById(req.user._id);
  }
  if (req.query && req.query.username) {
    return await User.findOne({ username: req.query.username });
  }
  return await User.findOne({});
}

module.exports.renderTracker = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const user = await resolveCurrentUser(req);
      if (!user) {
        return res.render("pages/moodTracker", {
          username: "No User",
          hasUser: false,
        });
      }
      res.render("pages/moodTracker", {
        username: user.username,
        hasUser: true,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server error");
    }
  } else res.redirect("/signup");
};

module.exports.renderData = async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) return res.json({ moods: [] });
    res.json({ moods: user.moods || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ moods: [] });
  }
};
