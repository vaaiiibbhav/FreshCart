const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const port = process.env.PORT || 4000;
const rawBaseUrl = process.env.NEXT_BASE_URL || "http://localhost:3000";
const allowedOrigins = rawBaseUrl.split(",").map(url => url.trim());

// In-memory mapping from socket.id to userId
const socketToUserMap = new Map();

const server = http.createServer((req, res) => {
  // CORS configuration for HTTP requests
  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes("*"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigins[0] || "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle `/notify` endpoint for server-to-client notifications
  if (req.method === "POST" && req.url === "/notify") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { event, data } = JSON.parse(body);
        console.log(`[HTTP Notify] event=${event}, data=`, data);
        
        // Broadcast event to all connected sockets
        io.emit(event, data);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        console.error("[HTTP Notify] Error parsing body:", err.message);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload" }));
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket] Connected: ${socket.id}`);

  // 1. Identity event - links userId to socket connection
  socket.on("identity", async (userId) => {
    if (!userId) return;
    console.log(`[Socket Identity] socket.id=${socket.id} -> userId=${userId}`);
    socketToUserMap.set(socket.id, userId);

    try {
      const response = await fetch(`${clientUrl}/api/socket/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, socketId: socket.id, isOnline: true }),
      });
      const data = await response.json();
      console.log(`[Socket Identity] Backend response:`, data);
    } catch (err) {
      console.error(`[Socket Identity] Error connecting userId ${userId}:`, err.message);
    }
  });

  // 2. Update Location event - broadcasts coordinates and persists them in DB
  socket.on("updateLocation", async (data) => {
    const { userId, latitude, longitude } = data;
    if (!userId || typeof latitude !== "number" || typeof longitude !== "number") {
      return;
    }
    console.log(`[Socket updateLocation] userId=${userId} (lat=${latitude}, lng=${longitude})`);

    const payload = {
      userId,
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON order: [longitude, latitude]
      },
    };

    // Broadcast coordinates to clients
    io.emit("update-deliveryBoy-location", payload);

    // Persist coordinates to MongoDB via backend route
    try {
      const response = await fetch(`${clientUrl}/api/socket/update-location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await response.json();
      console.log(`[Socket updateLocation] Backend response:`, resData);
    } catch (err) {
      console.error(`[Socket updateLocation] Error updating DB location:`, err.message);
    }
  });

  // 3. Room Management
  socket.on("join-room", (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`[Socket join-room] Socket ${socket.id} joined room ${roomId}`);
  });

  // 4. Send Message event - saves to DB first, then broadcasts to the room
  socket.on("send-message", async (message) => {
    if (!message || !message.roomId) return;
    const roomId = message.roomId.toString();
    console.log(`[Socket send-message] Room ${roomId} message from ${socket.id}`);

    try {
      const response = await fetch(`${clientUrl}/api/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: message.senderId,
          text: message.text,
          roomId: message.roomId,
          time: message.time,
        }),
      });
      const savedMessage = await response.json();
      
      // Broadcast the saved message (with its MongoDB _id) to all clients in the room
      io.to(roomId).emit("send-message", savedMessage);
    } catch (err) {
      console.error(`[Socket send-message] Error saving/broadcasting:`, err.message);
    }
  });

  // 5. Disconnect event
  socket.on("disconnect", async () => {
    console.log(`[Socket] Disconnected: ${socket.id}`);
    const userId = socketToUserMap.get(socket.id);
    if (userId) {
      socketToUserMap.delete(socket.id);
      console.log(`[Socket Disconnect] Cleaning up userId: ${userId}`);

      try {
        const response = await fetch(`${clientUrl}/api/socket/connect`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, socketId: null, isOnline: false }),
        });
        const data = await response.json();
        console.log(`[Socket Disconnect] Backend response:`, data);
      } catch (err) {
        console.error(`[Socket Disconnect] Error updating offline status:`, err.message);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Socket Server running on port ${port}`);
});
