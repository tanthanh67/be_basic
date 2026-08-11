import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("<a href='/about'>Hello</a>");
});

app.get("/about", (req, res) => {
  res.send("Hello, I'm Tan");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
