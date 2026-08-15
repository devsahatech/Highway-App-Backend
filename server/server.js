require("dotenv").config();

const http = require("http");

const app = require("./app");

const { Server } = require("socket.io");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.set("io", io);

require("./socket/socketHandler")(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
