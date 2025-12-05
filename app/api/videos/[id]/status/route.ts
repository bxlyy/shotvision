import { b2 } from "@/lib/b2";
import clientPromise from "@/lib/mongodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Props) {
  try {
    const { id } = await params;
    
    // 1. Fetch Video Metadata
    const client = await clientPromise;
    const db = client.db("shotvision");
    const video = await db.collection("videos").findOne({ _id: new ObjectId(id) });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // 2. Determine which file we want to watch
    // If complete, we want the AI result. If processing, we want the raw upload.
    const targetKey = video.status === "completed" ? video.annotatedKey : video.key;
    let signedUrl = null;

    // 3. Generate the Signed URL securely on the server
    if (targetKey) {
      try {
        const command = new GetObjectCommand({
          Bucket: process.env.B2_BUCKET!,
          Key: targetKey,
        });
        // URL expires in 1 hour
        signedUrl = await getSignedUrl(b2, command, { expiresIn: 3600 });
      } catch (err) {
        console.error("Failed to sign URL:", err);
      }
    }

    // 4. Return the video data WITH the playable URL
    return NextResponse.json({
      ...video,
      url: signedUrl, 
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}