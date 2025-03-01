import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db"; // Ensure this points to your DB connection

export const config = {
  api: {
    bodyParser: false, // Required for formidable to work
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "public/uploads/qr-codes/");
  form.keepExtensions = true;

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: "File upload failed" });
    }

    const { ownerId, type } = fields;
    const file = files.file as formidable.File;

    if (!ownerId || !type || !file) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const filePath = `/uploads/qr-codes/${file.newFilename}`;

    try {
      if (type === "khalti") {
        await db.query("UPDATE user SET khalti_qr = ? WHERE id = ?", [filePath, ownerId]);
      } else if (type === "esewa") {
        await db.query("UPDATE user SET esewa_qr = ? WHERE id = ?", [filePath, ownerId]);
      } else {
        return res.status(400).json({ message: "Invalid QR type" });
      }

      return res.status(200).json({ message: "QR uploaded successfully", filePath });
    } catch (error) {
      return res.status(500).json({ message: "Database error", error });
    }
  });
}
