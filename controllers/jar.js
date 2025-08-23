const SecretNote = require("../models/secretNote.js");

function ym(d = new Date()) {
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return tz.toISOString().slice(0, 7);
}
function endOfMonth(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
}

module.exports.renderJar = async (req, res) => {
  const month = ym();
  const lockedUntil = endOfMonth(month);
  const isLocked = new Date() < lockedUntil;
  const notes = await SecretNote.find({ userId: req.user._id, month })
    .sort({ createdAt: 1 })
    .lean();
  res.render("pages/jarView.ejs", { month, isLocked, lockedUntil, notes });
};

module.exports.storeJar = async (req, res) => {
  const text = (req.body.text || "").trim().slice(0, 500);
  if (!text) return res.redirect("back");
  await SecretNote.create({ userId: req.user._id, month: ym(), text });
  res.redirect("/dashboard");
};
