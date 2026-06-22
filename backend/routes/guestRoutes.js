const router = require("express").Router();
const c = require("../controllers/guestController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getGuests);
router.get("/mine", c.getMyInvitations); // guest
router.post("/", requireRole("organizer"), c.inviteGuest);
router.get("/:id", c.getGuest);
router.put("/:id", requireRole("organizer"), c.updateGuest);
router.patch("/:id/rsvp", c.rsvp); // guest or organizer
router.patch("/:id/checkin", requireRole("staff", "organizer"), c.checkIn);
router.delete("/:id", requireRole("organizer"), c.deleteGuest);

module.exports = router;
