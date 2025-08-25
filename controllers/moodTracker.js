const User = require("../models/user.js");

async function resolveCurrentUser(req) {
  if (req.user) {
    return await User.findById(req.user._id); 
  }
  if (req.session && req.session.userId) {
    return await User.findById(req.session.userId); 
  }
  if (req.query && req.query.username) {
    return await User.findOne({ username: req.query.username });
  }
  return null;
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
      console.error("Error in renderTracker:", err);
      res.status(500).send("Server error");
    }
  } else {
    res.redirect("/signup");
  }
};

module.exports.renderData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await User.findById(req.user._id).lean();

    if (!user || !user.moods) {
      return res.json({ moods: [] });
    }

    const sortedMoods = [...user.moods].sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({ moods: sortedMoods });
  } catch (err) {
    console.error("Error fetching moods:", err);
    res.status(500).json({ error: "Failed to fetch mood data" });
  }
};
