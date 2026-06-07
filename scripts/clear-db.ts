import fs from "fs"
import path from "path"
import mongoose from "mongoose"

// Load env variables manually from .env.local
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8")
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ""
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1)
      }
      process.env[key] = value.trim()
    }
  })
}

const MONGODB_URL = process.env.MONGODB_URL
if (!MONGODB_URL) {
  console.error("❌ MONGODB_URL is missing in .env.local")
  process.exit(1)
}

async function run() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(MONGODB_URL!)
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Failed to connect to MongoDB database instance")
    }
    console.log(`Connected to database: ${db.databaseName}`)

    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)
    console.log("Existing collections:", collectionNames)

    const targetCollections = ["users", "orders", "deliveryassignmentmodels"]

    for (const name of targetCollections) {
      if (collectionNames.includes(name)) {
        console.log(`Dropping collection: ${name}...`)
        await db.dropCollection(name)
        console.log(`✅ Collection ${name} dropped.`)
      } else {
        console.log(`ℹ️ Collection ${name} does not exist.`)
      }
    }

    console.log("🎉 Database purge completed successfully.")
    process.exit(0)
  } catch (err: unknown) {
    console.error("❌ Purge failed:", err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

run()
