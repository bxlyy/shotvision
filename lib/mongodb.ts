// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // For dev environment: persist MongoClient across hot reloads
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Added for debugging, since sometimes connection fails
// Pretty sure it fails when connecting on UCLA_WEB
clientPromise
  .then((client) => {
    console.log("Successfully connected to MongoDB");
    return client;
  })
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    throw err;
  });

export default clientPromise;
