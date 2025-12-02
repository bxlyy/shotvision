import { b2 } from "@/lib/b2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get file details from query params
  const searchParams = req.nextUrl.searchParams;
  const fileType = searchParams.get("fileType") || "video/mp4";

  // Generate unique key (folder/user-id/timestamp-filename)
  const key = `videos/${userId}/${Date.now()}.mp4`;

  // Create command
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET!,
    Key: key,
    ContentType: fileType,
    ChecksumAlgorithm: undefined,
  });

  // Generate signed URL
  const uploadUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });

  return NextResponse.json({ uploadUrl, key });
}
