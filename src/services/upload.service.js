import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { BadRequestError } from "../core/error.response.js";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config/env.config.js";
import { r2Client } from "../config/r2.config.js";
import * as uploadRepository from "../repository/upload.repository.js";

const MIME_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
};

export const uploadR2 = async (file, folder = "image") => {
  if (!file || !file.buffer) {
    throw new BadRequestError("No file provided for upload.");
  }

  let extension = path.extname(file.originalname).toLowerCase();

  if (!extension) {
    const mimeType = file.mimetype;
    extension = MIME_EXTENSIONS[mimeType] || ".unknown";
  }

  const filename = `${randomUUID()}${extension}`;

  const key = `${folder}/${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await r2Client.send(command);

  const url = `${config.r2.publicUrl}/${key}`;

  return { key, url };
};

export const deleteImgFromR2 = async (key) => {
  if (!key) {
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });

  await r2Client.send(command);
};

export const uploadImage = async (file, userId) => {
  const { key, url } = await uploadR2(file, "image");

  try {
    const record = await uploadRepository.create({
      key,
      url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      uploadedBy: userId,
    });

    return record;
  } catch (err) {
    try {
      await deleteImgFromR2(key);
    } catch (error) {
      console.error("Failed to clean up R2 object:", key, error);
    }
    throw err;
  }
};

export const uploadDocuments = async (files, userId) => {
  if (!files || files.length === 0) {
    throw new BadRequestError("No file provided for upload");
  }

  const uploaded = [];

  try {
    for (const file of files) {
      const { key, url } = await uploadR2(file, "documents");

      uploaded.push({
        key,
        url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: userId,
      });
    }

    return await uploadRepository.createMany(uploaded);
  } catch (err) {
    throw err;
  }
};
