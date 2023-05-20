import express from "express";
const router = express.Router();

router.get("/users", (req, res) => {
  res.send("GET /users");
});
router.get("/user/:id", (req, res) => {
  res.send(`GET /user/${req.params.id}`);
});
router.patch("/user/:id", (req, res) => {
  res.send(`PATCH /user/${req.params.id}`);
});
router.delete("/user/:id", (req, res) => {
  res.send(`DELETE /user/${req.params.id}`);
});

router.post("/signup", (req, res) => {
  res.send("POST /signup");
});
router.post("/login", (req, res) => {
  res.send("POST /login");
});

export default router;
