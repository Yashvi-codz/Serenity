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

const { affirmations } = require("./public/js/affirmations.js");
const moodRouter = require("./routes/mood.js");
const solaceRouter = require("./routes/solace.js");
const User = require("./models/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(bodyParser.urlencoded({ extended: true }));

const dbURL = process.env.ATLASDB_URL;

async function main() {
  await mongoose.connect(dbURL);
}

main()
  .then(() => {
    console.log("Connected to DataBase");
  })
  .catch((err) => console.log(err));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get("/", (req, res) => {
  res.redirect("/getstarted");
});

app.get("/getstarted", (req, res) => {
  res.render("pages/getStarted.ejs");
});

app.get("/signup", (req, res) => {
  res.render("pages/signup.ejs");
});

app.post("/signup", async (req, res) => {
  let { username, age, email, password } = req.body;
  const newUser = new User({ username, email, age });
  await User.register(newUser, password);
  res.redirect("/dashboard");
});

app.get("/signin", (req, res) => {
  res.render("pages/signin.ejs");
});

app.post(
  "/signin",
  passport.authenticate("local", { failureRedirect: "/login" }),
  async (req, res) => {
    res.redirect("/dashboard");
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      next(err);
    }
  });
  res.redirect("/getStarted");
});

app.get("/dashboard", async (req, res) => {
  if (req.isAuthenticated()) {
    let randomIndex = Math.floor(Math.random() * affirmations.length);
    let todayaffirmation = affirmations[randomIndex];

    const userId = req.user._id;
    const user = await User.findById(userId);

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // filter moods in last 7 days
    const recentMoods = user.moods.filter((m) => m.date >= sevenDaysAgo);

    // count frequency of moods
    const summary = {};
    recentMoods.forEach((entry) => {
      summary[entry.mood] = (summary[entry.mood] || 0) + 1;
    });

    // --- streak counter ---
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

    res.render("pages/dashboard.ejs", { todayaffirmation,summary, streak });
  } else res.redirect("/signup");
});

async function resolveCurrentUser(req) {
  if (req.session && req.session.userId) {
    return await User.findById(req.user._id);
  }
  if (req.query && req.query.username) {
    return await User.findOne({ username: req.query.username });
  }
  return await User.findOne({});
}

app.get("/moodtracker", async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) {
      return res.render("pages/moodTracker", {
        username: "No User",
        hasUser: false,
      });
    }
    res.render("pages/moodTracker", { username: user.username, hasUser: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.get("/api/mood-data", async (req, res) => {
  try {
    const user = await resolveCurrentUser(req);
    if (!user) return res.json({ moods: [] });
    res.json({ moods: user.moods || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ moods: [] });
  }
});

app.use("/mood", moodRouter);

app.use("/solace", solaceRouter);

app.listen(8000, (req, res) => {
  console.log("Server is listening to port 8000");
});
