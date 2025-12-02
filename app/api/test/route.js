// app/api/test/route.js
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("shotvision");

  const collections = await db.listCollections().toArray();

  return new Response(JSON.stringify({ connected: true, collections }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
