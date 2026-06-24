const router = require("express").Router();
const c = require("../controllers/invoiceController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getInvoices);
router.post("/", requireRole("vendor"), c.createInvoice);
router.get("/:id", c.getInvoice);
router.patch("/:id/review", requireRole("organizer"), c.reviewInvoice);

module.exports = router;
