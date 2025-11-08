import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please add MONGODB_URI to .env.local");
}

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  clientPromise = global._mongoClient.connect();
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
