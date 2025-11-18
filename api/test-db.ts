import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGODB_URI);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db("spendsmart");

    const collections = await db.listCollections().toArray();

    res.status(200).json({
      success: true,
      collections: collections.map(c => c.name),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
