import { b2 } from "@/lib/b2";
import clientPromise from "@/lib/mongodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { validateAppSource } from "@/lib/custom-header";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!validateAppSource(req)) {
    return NextResponse.json(
      { error: "Forbidden: Direct access denied" },
      { status: 403 }
    );
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
      const targetKey =
        video.status === "completed" ? video.annotatedKey : video.key;
      // If something went wrong and have no video file, return metadata without URL
      if (!targetKey) {
        return {
          ...video,
          _id: video._id.toString(),
          url: null,
          status: video.status || "failed",
          analysis: null, // Store analysis JSON straight in MongoDB
        };
      }
      const command = new GetObjectCommand({
        Bucket: process.env.B2_BUCKET!,
        Key: targetKey,
        ResponseContentType: "video/mp4",
      });

      // Generate a URL that expires in 1 hour (3600 seconds)
      const signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });

      return {
        ...video,
        _id: video._id.toString(),
        url: signedUrl, // Attach the temporary URL to the video object
        analysis: video.analysis || null,
        // Pass processing status so frontend can show that video is processing (if video isn't processed yet)
        status: video.status,
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

    if (!validateAppSource(req)) {
      return NextResponse.json(
        { error: "Forbidden: Direct access denied" },
        { status: 403 }
      );
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
      status: "queued", // So UI knows to show that it is waiting to be processed by model
      annotatedKey: null,
      analysis: null,
    });

    const videoId = result.insertedId.toString();

    // Generate download URL for the AI
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET!,
      Key: key,
    });
    const downloadUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });

    // Call model to do analysis
    fetch(process.env.AI_WORKER_URL + "/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret": process.env.AI_SERVICE_SECRET!,
      },
      body: JSON.stringify({
        videoId: videoId,
        userId: userId,
        videoUrl: downloadUrl,
        // Pass raw key so the AI (or webhook) knows what to DELETE later
        rawKey: key,
      }),
    }).catch((err) => console.error("AI Trigger Failed:", err));

    return NextResponse.json({ success: true, id: videoId });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json(
      { error: "Failed to save video" },
      { status: 500 }
    );
  }
}
