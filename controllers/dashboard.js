const User = require("../models/user.js");
const { affirmations } = require("../public/js/affirmations.js");

module.exports.renderDashboard = async (req, res) => {
  if (req.isAuthenticated()) {
    let randomIndex = Math.floor(Math.random() * affirmations.length);
    let todayaffirmation = affirmations[randomIndex];

    const userId = req.user._id;
    const user = await User.findById(userId);

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const recentMoods = user.moods.filter((m) => m.date >= sevenDaysAgo);

    const summary = {};
    recentMoods.forEach((entry) => {
      summary[entry.mood] = (summary[entry.mood] || 0) + 1;
    });

    let streak = 0;
    let dayPointer = new Date(now);

    while (true) {
      const logged = user.moods.some((m) => {
        const d = new Date(m.date);
        return (
          d.getDate() === dayPointer.getDate() &&
          d.getMonth() === dayPointer.getMonth() &&
          d.getFullYear() === dayPointer.getFullYear()
        );
      });

      if (logged) {
        streak++;
        dayPointer.setDate(dayPointer.getDate() - 1);
      } else {
        break;
      }
    }

    res.render("pages/dashboard.ejs", { todayaffirmation, summary, streak });
  } else res.redirect("/signup");
}