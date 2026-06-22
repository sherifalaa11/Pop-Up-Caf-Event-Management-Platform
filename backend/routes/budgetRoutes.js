const router = require("express").Router();
const c = require("../controllers/budgetController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/event/:eventId", c.getBudgetForEvent);
router.put("/event/:eventId", requireRole("organizer"), c.setBudget);
router.post("/event/:eventId/expense", requireRole("organizer"), c.addExpense);
router.put("/expense/:id", requireRole("organizer"), c.updateExpense);
router.delete("/expense/:id", requireRole("organizer"), c.deleteExpense);

module.exports = router;
