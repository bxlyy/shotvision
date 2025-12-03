import clientPromise from "@/lib/mongodb";
import { auth } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { validateAppSource } from "@/lib/custom-header";

const s3Client = new S3Client({
  region: "us-east-005",
  endpoint: process.env.B2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY!,
  },
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("shotvision");

    // Only update video if belongs to current user (since API is public, make sure owner must be logged in)
    const result = await db
      .collection("videos")
      .updateOne(
        { _id: new ObjectId(id), owner: userId },
        { $set: { title: title } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Video not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

// Delete video
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("shotvision");

    // Find video first to get B2 Key
    const video = await db
      .collection("videos")
      .findOne({ _id: new ObjectId(id), owner: userId });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete from Backblaze B2
    if (video.key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.B2_BUCKET,
          Key: video.key,
        });
        await s3Client.send(deleteCommand);
      } catch (b2Error) {
        console.error("Failed to delete from B2:", b2Error);
      }
    }

    // Delete from MongoDB
    const result = await db
      .collection("videos")
      .deleteOne({ _id: new ObjectId(id), owner: userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete from database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
