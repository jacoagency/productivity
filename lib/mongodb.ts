import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MONGODB_URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {};

let client: any;
let clientPromise: Promise<any>;

declare global {
  var _mongoClientPromise: Promise<any>;
}

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para mantener la conexión activa
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, es mejor crear una nueva conexión
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise; 