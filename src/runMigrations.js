const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const url = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "yourDatabaseName";

async function runMigrations() {
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db(dbName);
    const migrationsCollection = db.collection("migrations");

    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    let migrationCount = 0;
    for (const fileName of migrationFiles) {
      const migration = require(path.join(migrationsDir, fileName));

      const migrationRecord = await migrationsCollection.findOne({ name: fileName });
      if (migrationRecord) {
        continue; // Skip if migration has already been run
      }

      // Run the migration
      await migration(db);

      // Record the migration
      await migrationsCollection.insertOne({ name: fileName, runAt: new Date().toISOString() });
      migrationCount++;
    }

    if (migrationCount > 0) {
      console.warn(`Ran ${migrationCount} migrations`);
    } else {
      console.warn("No new migrations to run");
    }
  } catch (err) {
    console.error("Error running migrations:", err);
  } finally {
    await client.close();
  }
}

module.exports = runMigrations;
