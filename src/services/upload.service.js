import {
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { BadRequestError, NotFoundError } from "../core/error.response.js";
import path from "path";
import { randomUUID } from "crypto";
import { config } from "../config/env.config.js";
import { r2Client } from "../config/r2.config.js";
import * as uploadRepository from "../repository/upload.repository.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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

const PRESIGNED_URL_TTL = 5 * 60;

export const getPresignedUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn: PRESIGNED_URL_TTL });
};

export const getFileUrl = async (uploadId) => {
  const upload = await uploadRepository.findById(uploadId);

  if (!upload) {
    throw new NotFoundError("File not found");
  }

  const url = await getPresignedUrl(upload.r2_key);

  return {
    id: upload.id,
    originalName: upload.original_name,
    mimeType: upload.mime_type,
    url,
    expiresIn: PRESIGNED_URL_TTL,
  };
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

  return { key };
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
  const { key } = await uploadR2(file, "image");

  try {
    const record = await uploadRepository.create({
      key,
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
      const { key } = await uploadR2(file, "documents");

      uploaded.push({
        key,
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
