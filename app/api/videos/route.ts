import { b2 } from "@/lib/b2";
import clientPromise from "@/lib/mongodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("shotvision");

  // Get the video metadata from MongoDB
  const videos = await db
    .collection("videos")
    .find({ owner: userId })
    .sort({ createdAt: -1 })
    .toArray();

  // Generate a signed URL for each video
  // Use Promise.all since doing multiple async operations in a loop
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the data sent from the frontend
    const { key, title } = await req.json();

    const client = await clientPromise;
    const db = client.db("shotvision");

    // Save to MongoDB
    const result = await db.collection("videos").insertOne({
      owner: userId,
      key: key, // The file path in Backblaze
      title: title, // The original filename
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}
