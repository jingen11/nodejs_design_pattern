import { createServer } from "http";
import httpProxy from "http-proxy";
import Consul from "consul";

const routing = [
  {
    path: "/api",
    service: "api-service",
    index: 0,
  },
  {
    path: "/",
    service: "webapp-service",
    index: 0,
  },
];

const consulClient = new Consul();
const proxy = httpProxy.createProxyServer();

const server = createServer((req, res) => {
  const route = routing.find((route) => req.url.startsWith(route.path));
  console.log(route);
  consulClient.agent.service.list().then(
    (services) => {
      console.log(services);
      const servers = Object.values(services).filter((service) =>
        service.Tags.includes(route.service)
      );

      if (!servers.length) {
        res.writeHead(502);
        return res.end("Bad gateway");
      }

      route.index = (route.index + 1) % servers.length;
      const server = servers[route.index];
      const target = `http://${server.Address}:${server.Port}`;
      proxy.web(req, res, { target });
    },
    (err) => {
      res.writeHead(502);
      return res.end("Bad gateway");
    }
  );
});

server.listen(8080, () => {
  console.log("Load balancer started on port 8080");
});
