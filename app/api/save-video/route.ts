// save video to each user here

import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  const { key } = await req.json();

  const userId = "TEMP_USER_ID"; // Clerk userID here

  const client = await clientPromise;
  const db = client.db("myapp");

  await db.collection("videos").insertOne({
    owner: userId,
    key,
    createdAt: new Date(),
  });

  return Response.json({ success: true });
}
