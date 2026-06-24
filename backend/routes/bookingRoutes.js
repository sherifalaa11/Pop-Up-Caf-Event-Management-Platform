const router = require("express").Router();
const c = require("../controllers/bookingController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getBookings);
router.post("/", requireRole("organizer"), c.createBooking);
router.get("/:id", c.getBooking);
router.patch("/:id/respond", requireRole("venueOwner"), c.respondBooking);
router.patch("/:id/cancel", requireRole("organizer"), c.cancelBooking);
router.post("/:id/messages", c.addMessage);

module.exports = router;
