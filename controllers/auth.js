const User = require("../models/user");

module.exports.renderSignUp = (req, res) => {
  res.render("pages/signup.ejs");
};

module.exports.signUp = async (req, res) => {
  let { username, age, email, password } = req.body;
  const newUser = new User({ username, email, age });
  await User.register(newUser, password);
  res.redirect("/dashboard");
};

module.exports.renderSignIn = (req, res) => {
  res.render("pages/signin.ejs");
};

module.exports.signIn = async (req, res) => {
  res.redirect("/dashboard");
};

module.exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      next(err);
    }
  });
  res.redirect("/getStarted");
};
