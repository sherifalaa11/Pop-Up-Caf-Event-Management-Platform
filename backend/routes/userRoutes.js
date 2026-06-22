const router = require("express").Router();
const c = require("../controllers/userController");
const { protect, requireRole } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getUsers);
router.post("/", requireRole("organizer"), c.createUser);
router.put("/me", c.updateMe);
router.get("/:id", c.getUser);
router.put("/:id", requireRole("organizer"), c.updateUser);
router.patch("/:id/active", requireRole("organizer"), c.setActive);

module.exports = router;
