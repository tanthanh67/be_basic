import express from "express";
import router from "./src/routes/route.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import { connectDB } from "./src/config/db.config.js";

const app = express();

app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

startServer();
