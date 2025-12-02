import { b2 } from "@/lib/b2"; // Your existing B2 config
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 1. Authenticate User
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Get file details from query params (e.g., ?fileType=video/mp4)
  const searchParams = req.nextUrl.searchParams;
  const fileType = searchParams.get("fileType") || "video/mp4";

  // 3. Generate a unique key (folder/user-id/timestamp-filename)
  const key = `videos/${userId}/${Date.now()}.mp4`;

  // 4. Create the command
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  // 5. Generate Signed URL
  const uploadUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });

  return NextResponse.json({ uploadUrl, key });
}
