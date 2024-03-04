// 8.1 HTTP client cache: Write a proxy for your favorite HTTP client library that caches the response of a given HTTP request, so that if you make the same request again, the response is immediately returned from the local cache, rather than being fetched from the remote URL. If you need inspiration, you can check out the superagent-cache module (nodejsdp. link/superagent-cache).
import superagent from "superagent";

export const superagentCache = new Proxy(superagent, {
  get(target, propKey, receiver) {
    if (propKey === "get") {
      return function (...args) {
        // args is the usual writable.write args
        const [url, callback] = args;

        if (!(url in cache)) {
          cache[url] = {};

          return superagent.get(url, (err, res) => {
            if (err) {
              return callback(err);
            }
            cache[url].headers = res.headers;
            cache[url].body = res.body;
            cache[url].statusCode = res.statusCode;
            cache[url].text = res.text;
            cache[url].status = res.status;
            cache[url].ok = res.ok;
            callback(err, cache[url]);
          });
        } else {
          process.nextTick(() => callback(null, cache[url]));
          return;
        }
      };
    }

    return target[propKey];
  },
});

const cache = {};

superagentCache.get(
  "https://jsonplaceholder.typicode.com/posts/1",
  (err, res) => {
    console.log(err);
    console.log(res.body);

    superagentCache.get(
      "https://jsonplaceholder.typicode.com/posts/1",
      (err, res) => {
        console.log(err);
        console.log(res.body);
      }
    );

    console.log("next tick 2");
  }
);

console.log("next tick 1");
