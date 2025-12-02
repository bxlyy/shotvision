// app/api/clerk-webhook/route.ts
import { verifyWebhook } from "@clerk/backend/webhooks";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const event = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SECRET!,
    });

    const client = await clientPromise;
    const db = client.db("shotvision");
    const users = db.collection("users");

    if (event.type === "user.created") {
      const user = event.data;
      const existing = await users.findOne({ clerkId: user.id });
      if (!existing) {
        await users.insertOne({
          clerkId: user.id,
          fullName: `${user.first_name} ${user.last_name}`,
          email: user.email_addresses?.[0]?.email_address || null,
          createdAt: new Date(),
        });
      }
    }

    if (event.type === "user.updated") {
      const user = event.data;
      await users.updateOne(
        { clerkId: user.id },
        {
          $set: {
            fullName: `${user.first_name} ${user.last_name}`,
            email: user.email_addresses?.[0]?.email_address || null,
            updatedAt: new Date(),
          },
        }
      );
    }

    if (event.type === "user.deleted") {
      await users.deleteOne({ clerkId: event.data.id });
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook verification failed", err);
    return new Response("Unauthorized", { status: 401 });
  }
}
