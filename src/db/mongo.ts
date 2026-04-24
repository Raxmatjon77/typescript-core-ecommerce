import { MongoClient, Db } from "mongodb";

export interface MongoConnection {
  client: MongoClient;
  db: Db;
  close(): Promise<void>;
}

export async function createMongoConnection(
  uri: string,
  dbName: string
): Promise<MongoConnection> {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  return {
    client,
    db,
    close: () => client.close(),
  };
}
