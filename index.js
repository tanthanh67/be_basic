import express from "express";
import { readData } from "./src/repository/readData.js";
import router from "./src/routes/route.js";

const app = express();

app.use(express.json());
app.use("/api", router);

app.use((req, res, next) => {
  console.log("Global middleware executed");

  next();
});

app.use(
  "/test",
  (req, res, next) => {
    console.log("Test middleware executed");
  },
  (req, res) => {
    res.send("Test api");
  },
);

app.use(
  "/divide",
  (req, res, next) => {
    const { a, b } = req.query;
    if (b === "0") {
      throw new Error("Division by zero is not allowed");
    }
    next();
  },
  (req, res) => {
    res.send(`Result: ${req.query.a / req.query.b}`);
  },
);

app.use((err, req, res, next) => {
  console.log(err.message);
  res.send("Internal Server Error");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
