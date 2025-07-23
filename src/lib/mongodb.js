// src/lib/mongodb.js (Modifié pour exporter une fonction Mongoose connectDB)

import mongoose from 'mongoose'; // Assurez-vous que mongoose est bien importé
import { MongoClient } from 'mongodb'; // On peut toujours garder MongoClient si vous en avez besoin pour d'autres usages bas niveau, sinon on peut l'enlever.

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;

// Utilisation du cache pour Mongoose
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Fonction pour se connecter à Mongoose
async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      // Supprimez useNewUrlParser et useUnifiedTopology si vous êtes sur une version récente de Mongoose
      // car ils sont obsolètes et par défaut à true.
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      // Retourne l'instance de mongoose après connexion
      return mongooseInstance;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB; // Exportation par défaut de la fonction connectDB