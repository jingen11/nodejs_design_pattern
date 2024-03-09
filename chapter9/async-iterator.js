import superagent from "superagent";

class CheckUrls {
  constructor(urls) {
    this.urls = urls;
  }

  [Symbol.asyncIterator]() {
    const urlsIterator = this.urls[Symbol.iterator]();

    return {
      async next() {
        const iteratorResult = urlsIterator.next();

        if (iteratorResult.done) {
          return { done: true };
        }

        const url = iteratorResult.value;

        try {
          const checkResult = await superagent.head(url).redirects(2);
          return {
            done: false,
            value: `${url} is up, status: ${checkResult.status}`,
          };
        } catch (error) {
          return {
            done: false,
            value: `${url} is down, error: ${err.message}`,
          };
        }
      },
    };
  }

  async *[Symbol.asyncIterator]() {
    for (const url of this.urls) {
      try {
        const checkResult = await superagent.head(url).redirects(2);
        yield `${url} is up, status: ${checkResult.status}`;
      } catch (error) {
        yield `${url} is down, error: ${err.message}`;
      }
    }
  }
}
