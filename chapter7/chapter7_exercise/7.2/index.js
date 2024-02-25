import https from "https";

class RequestBuilder {
  setMethod(method) {
    this.method = method.toUpperCase();
    return this;
  }
  setUrl(hostname, path) {
    this.hostname = hostname;
    this.path = path;
    return this;
  }
  setQuery(queries) {
    this.queries = "";

    for (let q in queries) {
      if (this.queries === "") {
        this.queries += `?${q}=${queries[q]}`;
      } else {
        this.queries += `?${q}=${queries[q]}`;
      }
    }

    return this;
  }
  setHeader(headers) {
    this.headers = { ...headers };
    return this;
  }
  setBody(body) {
    if (
      this.method !== "POST" &&
      this.method !== "PATCH" &&
      this.method !== "PUT"
    ) {
      throw new Error("invalid body. Only POST and PATCH/PUT");
    }
    this.body = body;
    return this;
  }
  invoke() {
    const postData = this.body ? JSON.stringify(this.body) : "";
    const queries = this.queries || "";

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: this.hostname,
          path: `/${this.path}${queries}`,
          method: this.method,
          headers: {
            ...this.headers,
            "content-length": Buffer.byteLength(postData),
          },
        },
        (res) => {
          console.log(res.statusCode);
          res.setEncoding("utf8");
          res.on("data", (chunk) => {
            console.log(chunk);
          });
          res.on("end", () => resolve());
        }
      );

      req.write(postData);
      req.end();

      req.on("error", (err) => reject(err));
    });
  }
}

await new RequestBuilder()
  .setMethod("POST")
  .setUrl("jsonplaceholder.typicode.com", "posts")
  .setHeader({ "Content-Type": "application/json" })
  .setBody({
    title: "foo",
    body: "bar",
    userId: 1,
  })
  .invoke();
