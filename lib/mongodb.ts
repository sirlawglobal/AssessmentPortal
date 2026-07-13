import mongoose from "mongoose";
import { env } from "./env";

const cached = globalThis as typeof globalThis & {
  mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

export async function connectToDatabase() {
  if (!env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI");
  }

  if (cached.mongoose?.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose?.promise) {
    cached.mongoose = {
      conn: null,
      promise: mongoose.connect(env.MONGODB_URI, {
        dbName: "assessment",
      }),
    };
  }

  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}
