import express from "express";
import { readData } from "./src/repository/readData.js";
import router from "./src/routes/route.js";
import errorHandler from "./src/middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use("/api", router);
app.use(errorHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
