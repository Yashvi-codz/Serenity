let messages = [
  { sender: "bot", text: "Hey, Im Solace 🌸. How are you feeling today?" },
];

module.exports.renderSolace = (req, res) => {
  res.render("pages/solace.ejs", { messages });
};

module.exports.MessageSolace = (req, res) => {
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
};
