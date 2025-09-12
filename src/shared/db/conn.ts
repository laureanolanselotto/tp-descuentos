import { MongoClient, Db } from "mongodb";

const connectionString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/?retryWrites=true&w=majority";

const cl = new MongoClient(connectionString)
await cl.connect();

export let db: Db = cl.db('tp-desuentos');