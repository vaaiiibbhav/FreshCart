import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import path from "path"

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

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
})

const ASSETS = [
  { key: "apples", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80" },
  { key: "carrots", url: "https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800&auto=format&fit=crop&q=80" },
  { key: "milk", url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&auto=format&fit=crop&q=80" },
  { key: "cookies", url: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80" },
  { key: "chips", url: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&auto=format&fit=crop&q=80" },
  { key: "bread", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80" },
]

async function run() {
  console.log("Uploading assets to Cloudinary...")
  const results: Record<string, string> = {}
  for (const asset of ASSETS) {
    try {
      console.log(`Uploading ${asset.key}...`)
      const res = await cloudinary.uploader.upload(asset.url, {
        folder: "urbangrocer",
        public_id: asset.key,
        overwrite: true,
      })
      results[asset.key] = res.secure_url
      console.log(`✅ Uploaded ${asset.key}: ${res.secure_url}`)
    } catch (err) {
      console.error(`❌ Failed to upload ${asset.key}:`, err)
    }
  }

  const outputPath = path.resolve(process.cwd(), "scripts/cloudinary-assets.json")
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2))
  console.log(`Saved assets config to ${outputPath}`)
}

run()
