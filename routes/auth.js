const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.js");
const passport = require("passport");

router
  .route("/signup")
  .get(authController.renderSignUp)
  .post(authController.signUp);

router
  .route("/signin")
  .get(authController.renderSignIn)
  .post(
    passport.authenticate("local", { failureRedirect: "/login" }),
    authController.signIn
  );

router.get("/logout", authController.logout);

module.exports = router;
