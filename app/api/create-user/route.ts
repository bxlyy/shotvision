import clientPromise from "@/lib/mongodb";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json(); // optional extra fields?

  const client = await clientPromise;
  const db = client.db("shotvision");
  const users = db.collection("users");

  // only insert user if not in db already
  const existing = await users.findOne({ clerkId: user.id });
  if (existing)
    return new Response(
      JSON.stringify({ success: true, message: "Already exists" })
    );

  const result = await users.insertOne({
    clerkId: user.id,
    fullName: user.fullName,
    email: user.emailAddresses?.[0]?.emailAddress || null,
    createdAt: new Date(),
    ...body, // optional extra fields
  });

  return new Response(
    JSON.stringify({ success: true, insertedId: result.insertedId }),
    { status: 201 }
  );
}
