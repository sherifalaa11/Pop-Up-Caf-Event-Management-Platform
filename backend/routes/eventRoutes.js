const router = require("express").Router();
const c = require("../controllers/eventController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getEvents);
router.get("/mine", c.getMyEvents); // staff: events I'm on
router.get("/dashboard", requireRole("organizer"), c.getDashboard);
router.post("/", requireRole("organizer"), c.createEvent);
router.get("/:id", c.getEvent);
router.put("/:id", requireRole("organizer"), c.updateEvent);
router.delete("/:id", requireRole("organizer"), c.deleteEvent);
router.get("/:id/layout", c.getLayout);
router.put("/:id/layout", requireRole("organizer"), c.saveLayout);
router.put("/:id/team", requireRole("organizer"), c.setTeam);
router.get("/:id/dayof", c.getDayOf);

module.exports = router;
