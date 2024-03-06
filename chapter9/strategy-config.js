import { promises as fs } from "fs";
import objectPath from "object-path";

class Config {
  constructor(formatStrategy) {
    this.data = {};
    this.formatStrategy = formatStrategy;
  }

  get(configPath) {
    return objectPath.get(this.data, configPath);
  }

  set(configPath, value) {
    return objectPath.set(this.data, configPath, value);
  }

  async load(filePath) {
    console.log(`Deserializing from ${filePath}`);
    this.data = this.formatStrategy.deserialize(
      await fs.readFile(filePath, "utf-8")
    );
  }

  async save(filePath) {
    console.log(`Serializing to ${filePath}`);
    await fs.writeFile(filePath, this.formatStrategy.serialize(this.data));
  }
}

import ini from "ini";

const iniStrategy = {
  deserialize: (data) => ini.parse(data),
  serialize: (data) => ini.stringify(data),
};

const jsonStrategy = {
  deserialize: (data) => JSON.parse(data),
  serialize: (data) => JSON.stringify(data, null, "    "),
};
