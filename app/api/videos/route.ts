import { b2 } from "@/lib/b2";
import clientPromise from "@/lib/mongodb";
import { GetObjectCommand } from "@aws-sdk/client-s3"; // <--- NEW IMPORT
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // <--- NEW IMPORT
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("myapp");

  // 1. Get the video metadata from MongoDB
  const videos = await db
    .collection("videos")
    .find({ owner: userId })
    .sort({ createdAt: -1 })
    .toArray();

  // 2. Generate a signed URL for EACH video
  // We use Promise.all because we are doing multiple async operations in a loop
  const videosWithUrls = await Promise.all(
    videos.map(async (video) => {
      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET!,
        Key: video.key, // Using the key we stored in DB
      });

      // Generate a URL that expires in 1 hour (3600 seconds)
      const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });

      return {
        ...video,
        url: signedUrl, // Attach the temporary URL to the video object
      };
    })
  );

  return NextResponse.json({ videos: videosWithUrls });
}
