import jsonOverTcp from "json-over-tcp-2";
const server = jsonOverTcp.createServer({ port: 8000 });
server.on("connection", (socket) => {
  socket.on("data", (data) => {
    console.log("Client data", data);
  });
});

server.listen(8000, () => console.log("Server started"));
