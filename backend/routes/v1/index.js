const express =require("express");
const authRoutes = require("./authRoutes");

const router = express.Router();

router.use("/user" , authRoutes)
router.get("/", (req, res) => {
    res.json({ message: "Api working" });
});

module.exports = router;