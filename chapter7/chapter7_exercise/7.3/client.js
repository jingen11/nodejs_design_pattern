import { request } from "http";

const socket = request({
  port: 3000,
  hostname: "localhost",
  method: "POST",
});
socket.on("response", (response) => {
  //Emitted when a response is received to this request. This event is emitted only once.
  console.log("dads");
  response.on("data", (chunk) => console.log(chunk.toString()));
  response.on("end", () => console.log("finish response"));
  // console.log(chunk.toString());
});
socket.on("finish", () => {
  // Emitted when the request has been sent. More specifically, this event is emitted when the last segment of the response headers and body have been handed off to the operating system for transmission over the network. It does not imply that the server has received anything yet.
  console.log("socket end");
});
socket.on("close", () => {
  //Indicates that the request is completed, or its underlying connection was terminated prematurely (before the response completion).
  console.log("socket closed");
});
socket.write("abc");
socket.end(); // Finishes sending the request. If any parts of the body are unsent, it will flush them to the stream. If the request is chunked, this will send the terminating '0\r\n\r\n'.
