const router = require("express").Router();
const c = require("../controllers/taskController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getTasks);
router.get("/mine", c.getMyTasks); // staff
router.post("/", requireRole("organizer"), c.createTask);
router.put("/:id", requireRole("organizer"), c.updateTask);
router.patch("/:id/assign", requireRole("organizer"), c.assignTask);
router.patch("/:id/status", c.updateStatus); // staff or organizer
router.delete("/:id", requireRole("organizer"), c.deleteTask);

module.exports = router;
