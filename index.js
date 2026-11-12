import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swagger.config.js";
import router from "./src/routes/route.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import { connectDB } from "./src/config/db.config.js";
import { config } from "./src/config/env.config.js";

const app = express();

app.use(express.json());

app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Backend Basic API Docs",
    swaggerOptions: { displayRequestDuration: true, validatorUrl: null },
  }),
);

app.use("/api", router);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  app.listen(config.app.port, () => {
    console.log(`Server is running on port ${config.app.port}`);
  });
};

startServer();
