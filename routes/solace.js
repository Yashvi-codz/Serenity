const express = require("express");
const router = express.Router();

const solaceControllers = require("../controllers/solace.js");

router.route("/").get(solaceControllers.renderSolace);
router.route("/send").post(solaceControllers.MessageSolace);

module.exports = router