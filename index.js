import express from "express";
import router from "./src/routes/route.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import { connectDB } from "./src/config/db.config.js";
import { config } from "./src/config/env.config.js";

const app = express();

app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(config.app.port, () => {
    console.log(`Server is running on port ${config.app.port}`);
  });
};

startServer();
