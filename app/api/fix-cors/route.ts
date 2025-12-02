// Created this to correct B2 settings

import { b2 } from "@/lib/b2";
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log(
      "Attempting to update CORS rules for bucket:",
      process.env.B2_BUCKET
    );

    const command = new PutBucketCorsCommand({
      Bucket: process.env.B2_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            // Allow all headers (needed for Content-Type)
            AllowedHeaders: ["*"],
            // Allow PUT (for uploads) and GET (for viewing)
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            // Allow your localhost (or "*" for least headaches)
            AllowedOrigins: ["*"],
            // Allow the browser to see the ETag (useful for success checks)
            ExposeHeaders: ["ETag"],
            // Cache this rule for 1 hour so browser doesn't keep asking
            MaxAgeSeconds: 3600,
          },
        ],
      },
    });

    await b2.send(command);

    return NextResponse.json({
      success: true,
      message: "CORS Rules Updated Successfully!",
    });
  } catch (error: any) {
    console.error("Failed to update CORS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
