import express from "express";
const router = express.Router();

router.get("/notes", (req, res) => {
  res.send("GET /notes");
});
router.get("/note/:id", (req, res) => {
  res.send(`GET /note/${req.params.id}`);
});
router.patch("/note/:id", (req, res) => {
  res.send(`PATCH /note/${req.params.id}`);
});
router.delete("/note/:id", (req, res) => {
  res.send(`DELETE /note/${req.params.id}`);
});

export default router;
