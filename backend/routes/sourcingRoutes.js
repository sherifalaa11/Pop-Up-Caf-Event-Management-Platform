const router = require("express").Router();
const c = require("../controllers/sourcingController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getRequests);
router.post("/", requireRole("organizer"), c.createRequest);
router.get("/:id", c.getRequest);
router.patch("/:id/respond", requireRole("vendor"), c.respondRequest);
router.patch("/:id/delivery", requireRole("vendor"), c.updateDelivery);
router.patch("/:id/arrived", requireRole("staff", "organizer"), c.markArrived);

module.exports = router;
