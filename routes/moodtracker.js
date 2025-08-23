const express = require("express");
const router = express.Router();

const trackerController = require("../controllers/moodTracker.js")

router.route("/moodtracker").get(trackerController.renderTracker);
router.route("/api/mood-data").get(trackerController.renderData);

module.exports = router