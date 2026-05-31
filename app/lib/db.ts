import mongoose from "mongoose"

const mongodbURL = process.env.MONGODB_URL || ""

if(!mongodbURL){
  throw new Error("Please provide MONGODB_URL in the environment variables")
}

let cached = global.mongoose

if(!cached){
  cached = global.mongoose = {
    conn    : null,
    promise : null
  }
}

// connect with database
const connectDB = async () => {
  if(cached.conn){
    return cached.conn
  }
  if(!cached.promise){
    cached.promise = mongoose.connect(mongodbURL).then((conn) => conn.connection)
  }
  try{
    const conn = await cached.promise
    return conn
  }catch(err){
    console.log(err)
  }
}

export default connectDB