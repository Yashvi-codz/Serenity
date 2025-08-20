const express = require("express");
const router = express.Router();

const moodControllers = require("../controllers/mood.js");

router
  .route("/")
  .get(moodControllers.renderChooseMood)
  .post(moodControllers.chooseMood);

router
  .route("/:moodName")
  .get(moodControllers.renderMoodQues)
  .post(moodControllers.moodQues);

router.route("/:moodName/activities").get(moodControllers.renderMoodActivities);

module.exports = router