import app from "./app";

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`⚡️[server]: Server is listening at http://localhost:${port}`);
});
