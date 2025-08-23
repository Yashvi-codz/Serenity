const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboard.js")

router.route("/").get(dashboardController.renderDashboard);

module.exports = router;
