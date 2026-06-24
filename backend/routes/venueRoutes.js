const router = require("express").Router();
const c = require("../controllers/venueController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getVenues);
router.get("/mine", requireRole("venueOwner"), c.getMyVenues);
router.get("/shortlist", requireRole("organizer"), c.getShortlist);
router.post("/", requireRole("venueOwner"), c.createVenue);
router.get("/:id", c.getVenue);
router.put("/:id", requireRole("venueOwner"), c.updateVenue);
router.delete("/:id", requireRole("venueOwner"), c.deleteVenue);
router.post("/:id/shortlist", requireRole("organizer"), c.toggleShortlist);

module.exports = router;
