// Run this file manually with 'npx tsx scripts/init-b2.ts'
// Created this to correct B2 settings

import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const { b2 } = await import("@/lib/b2");

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

    console.log("CORS Rules Updated Successfully!");
  } catch (error: any) {
    console.error("Failed to update CORS:", error);
  }
}

main();
