// uploads video to Backblaze B2

import { b2 } from "@/lib/b2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET() {
  const userId = "TEMP_USER_ID"; // need to figure out Clerk userID

  const key = `videos/${userId}-${Date.now()}.mp4`;

  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET!,
    Key: key,
    ContentType: "video/mp4",
  });

  const uploadUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });

  return Response.json({ uploadUrl, key });
}
