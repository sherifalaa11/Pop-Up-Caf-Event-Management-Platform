const router = require("express").Router();
const c = require("../controllers/feedbackController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getFeedback);
router.get("/trends/:eventId", c.getTrends);
router.post("/", c.submitFeedback); // guest
router.post("/request", requireRole("organizer"), c.requestFeedback);

module.exports = router;
