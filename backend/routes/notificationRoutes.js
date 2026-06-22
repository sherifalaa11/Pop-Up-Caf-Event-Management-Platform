const router = require("express").Router();
const c = require("../controllers/notificationController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/mine", c.getMyNotifications); // guest
router.get("/event/:eventId", requireRole("organizer"), c.getEventNotifications);
router.post("/", requireRole("organizer"), c.sendNotification);
router.post("/followup", requireRole("organizer"), c.followUpUnseen);
router.patch("/:id/seen", c.markSeen);

module.exports = router;
