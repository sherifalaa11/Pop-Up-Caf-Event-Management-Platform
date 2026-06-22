const router = require("express").Router();
const c = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", c.getMessages);
router.get("/contacts", c.getContacts);
router.get("/thread/:userId", c.getThread);
router.post("/", c.sendMessage);
router.patch("/:id/read", c.markRead);

module.exports = router;
