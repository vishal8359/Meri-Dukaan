/**
 * Onboarding Routes
 *
 * POST   /api/onboarding/upload   — Upload Aadhaar + Selfie + UPI (multipart)
 * GET    /api/onboarding/status   — Real-time processing status
 * PUT    /api/onboarding/review   — Submit edited data + accept terms
 * GET    /api/onboarding/result   — Final decision with scores
 */
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { protect } from "../../middleware/auth.js";
import validate from "../../middleware/validate.js";
import asyncHandler from "../../lib/asyncHandler.js";
import { uploadSchema, reviewSchema } from "./onboarding.schema.js";
import * as ctrl from "./onboarding.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "..", "uploads", "onboarding");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config — store files temporarily on disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 4, // max 4 files (aadhaar + selfie + pan + license)
  },
});

const uploadFields = upload.fields([
  { name: "aadhaar", maxCount: 1 },
  { name: "selfie", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "drivingLicense", maxCount: 1 },
]);

const uploadSingle = upload.single("file");

const router = Router();

// All routes require authentication
router.use(protect);

// Upload documents and start AI pipeline
router.post(
  "/upload",
  uploadFields,
  validate(uploadSchema),
  asyncHandler(ctrl.upload)
);

// Get real-time processing status
router.get("/status", asyncHandler(ctrl.status));

// Submit reviewed/edited data with terms acceptance
router.put("/review", validate(reviewSchema), asyncHandler(ctrl.review));

// Get final decision and scores
router.get("/result", asyncHandler(ctrl.result));

// Update specific detail
router.patch(
  "/update-detail",
  uploadSingle,
  asyncHandler(ctrl.updateDetail)
);

// Cancel ongoing onboarding process manually
router.post("/cancel", asyncHandler(ctrl.cancel));

export default router;
