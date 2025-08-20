const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const bodyParser = require("body-parser");

const{affirmations} = require("./public/js/affirmations.js");
const moodRouter = require("./routes/mood.js")

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/getstarted");
});

app.get("/getstarted", (req, res) => {
  res.render("pages/getStarted.ejs");
});


let messages = [
  { sender: "bot", text: "Hey, Im Solace 🌸. How are you feeling today?" }
];

app.get("/dashboard", (req, res) => {
  // messages = [
  // { sender: "bot", text: "Hey, Im Solace 🌸. How are you feeling today?" }
  // ];
  let randomIndex = Math.floor(Math.random()*affirmations.length);
  let todayaffirmation = affirmations[randomIndex]
  res.render("pages/dashboard.ejs",{todayaffirmation});
});

app.use("/mood",moodRouter);

app.get("/solace", (req, res) => {
  res.render("pages/solace.ejs", { messages });
});

app.post("/solace/send", (req, res) => {
  const userMsg = req.body.message;
  messages.push({ sender: "me", text: userMsg });

  // fake reply from backend array
  const replies = [
    "I hear you 💙. That must feel tough. Do you want me to be comforting, motivating, or just a quiet listener?",
    "You are not alone in this, and it is okay to take it slow 💜.Sometimes talking helps—do you want to tell me whats been weighing on you?",
  ];
  const reply = replies[Math.floor(Math.random() * replies.length)];
  messages.push({ sender: "bot", text: reply });

  res.redirect("/solace");
});


app.listen(8000, (req, res) => {
  console.log("Server is listening to port 8000");
});