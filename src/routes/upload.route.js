import { Router } from "express";
import { uploadDocs, uploadImg } from "../middlewares/upload.middleware.js";
import * as uploadController from "../controllers/upload.controller.js";

const router = Router();

router.get("/:id/url", uploadController.getFileUrl);
router.post("/", uploadImg.single("image"), uploadController.uploadImage);
router.post(
  "/documents",
  uploadDocs.array("files", 5),
  uploadController.uploadDocuments,
);
router.delete("/", uploadController.deleteImage);

export default router;
