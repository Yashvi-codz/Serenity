require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const authRouter = require("./routes/auth.js");
const trackerRouter = require("./routes/moodtracker.js");
const dashboardRouter = require("./routes/dashboard.js");
const moodRouter = require("./routes/mood.js");
const solaceRouter = require("./routes/solace.js");
const jarRouter = require("./routes/jar.js");
const User = require("./models/user.js");

// Middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const dbURL = process.env.MONGO_URL;
async function main() {
  await mongoose.connect(dbURL);
}
main()
  .then(() => console.log("✅ Connected to Database"))
  .catch((err) => console.log("❌ DB Error:", err));

// Session store
const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: { secret: process.env.SESSION_SECRET },
  touchAfter: 24 * 3600,
});
store.on("error", (err) => console.log("❌ Mongo Session Error:", err));

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));

// Passport auth
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.get("/", (req, res) => res.redirect("/getstarted"));
app.get("/getstarted", (req, res) => res.render("pages/getStarted.ejs"));
app.use("/", authRouter);
app.use("/", trackerRouter);
app.use("/dashboard", dashboardRouter);
app.use("/jar", jarRouter);
app.use("/mood", moodRouter);
app.use("/solace", solaceRouter);
app.get("/resources", (req, res) => res.render("pages/resources.ejs"));

// Start server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
