const{allMoods} = require("../public/js/moodQuestions.js");
const{moodStyles} = require("../public/js/moodStyles.js")
const{moodActivities} = require("../public/js/moodActivities.js")
const {moodHeadings,moodDescription} = require("../public/js/moodHeadings.js")


module.exports.renderChooseMood = (req, res) => {
  res.render("pages/mood.ejs");
};
module.exports.chooseMood = (req, res) => {
  let mood = req.body.mood;
  res.redirect(`/mood/${mood}`);
};

module.exports.renderMoodQues = (req, res) => {
  let mood = req.params.moodName;
  let myMood = allMoods[mood];
  let myMoodStyle = moodStyles[mood];
  res.render("pages/reasons.ejs", { mood, myMood, myMoodStyle });
};
module.exports.moodQues = (req, res) => {
  let mood = req.params.moodName;
  res.redirect(`/mood/${mood}/activities`);
};
module.exports.renderMoodActivities = (req, res) => {
  let mood = req.params.moodName;
  let myMoodStyle = moodStyles[mood];
  let myMoodActivities = moodActivities[mood];
  let activityPageHeading = moodHeadings[mood];
  let activityPageDescription = moodDescription[mood];
  res.render("pages/activities.ejs", {
    mood,
    myMoodStyle,
    myMoodActivities,
    activityPageHeading,
    activityPageDescription,
  });
};
