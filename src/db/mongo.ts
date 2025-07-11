import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URI!
const dbName = process.env.DB_NAME!

let db: Db;

export async function connectToMongo(): Promise<Db> {
  if (db) return db;

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  console.log(`Connected to MongoDB: ${dbName}`);
  return db;
}
