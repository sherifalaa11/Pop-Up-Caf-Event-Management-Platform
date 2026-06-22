const router = require("express").Router();
const c = require("../controllers/reportController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/attendance/:eventId", c.attendance);
router.get("/financial/:eventId", c.financial);
router.get("/vendor-performance", c.vendorPerformance);
router.post("/vendor-rating/:vendorId", requireRole("organizer"), c.rateVendor);
router.get("/analytics/:eventId", c.analytics);

module.exports = router;
