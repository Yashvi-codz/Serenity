const express = require("express");
const router = express.Router();

const jarController = require("../controllers/jar.js")

router.route("/").post(jarController.storeJar);
router.route("/open").get(jarController.renderJar);

module.exports = router;