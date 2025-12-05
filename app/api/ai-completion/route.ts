import { b2 } from "@/lib/b2";
import clientPromise from "@/lib/mongodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { calculateSwingScore } from "@/lib/scoring";

// AI calls this when finished
export async function POST(req: Request) {
  try {
    // Verify secret for security (ensure only AI worker can call this)
    const secret = req.headers.get("x-secret");
    if (secret !== process.env.AI_SERVICE_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId, annotatedKey, analysis, rawKey, status } =
      await req.json();
    const finalStatus = status || "completed";

    const client = await clientPromise;
    const db = client.db("shotvision");

    // Exit here if failed
    if (finalStatus !== "completed") {
      await db
        .collection("videos")
        .updateOne(
          { _id: new ObjectId(videoId) },
          { $set: { status: "failed" } }
        );
      return NextResponse.json({ success: true });
    }

    // Call swing score script /lib/scoring.ts
    const swingScore = calculateSwingScore(analysis);

    // Update MongoDB
    // Set status to completed, save the new file paths
    await db.collection("videos").updateOne(
      { _id: new ObjectId(videoId) },
      {
        $set: {
          status: "completed",
          annotatedKey: annotatedKey,
          analysis: analysis,
          score: swingScore,
          // Remove the reference to the raw key so UI never tries to load deleted file again
          key: null,
        },
      }
    );

    // Delete unprocessed raw video from B2
    if (rawKey) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.B2_BUCKET!,
          Key: rawKey,
        });
        await b2.send(deleteCommand);
        console.log(`Deleted raw file: ${rawKey}`);
      } catch (err) {
        console.error("Failed to delete raw video from B2:", err);
        // Don't fail the request here since DB update was successful
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
