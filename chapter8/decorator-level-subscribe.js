function levelSubscribe(db) {
  db.subscribe = (pattern, listener) => {
    db.on("put", (key, val) => {
      const match = Object.keys(pattern).every((k) => pattern[k] === val[k]);

      if (match) {
        listener(key, val);
      }
    });
  };

  return db;
}

import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { Level } from "level";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbPath = join(__dirname, "db");
const db = new Level(dbPath, { valueEncoding: "json" });
levelSubscribe(db);

db.subscribe({ doctype: "tweet", language: "en" }, (k, val) =>
  console.log(val)
);
db.put("1", {
  doctype: "tweet",
  text: "Hi",
  language: "en",
});
db.put("2", {
  doctype: "company",
  name: "ACME Co.",
});
