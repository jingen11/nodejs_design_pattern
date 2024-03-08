import { promises as fsPromises } from "fs";
import objectPath from "object-path";

class ConfigTemplate {
  async load(file) {
    console.log(`Deserializing from ${file}`);
    this.data = this._deserialize(await fsPromises.readFile(file, "utf-8"));
  }
  async save(file) {
    console.log(`Serializing to ${file}`);
    await fsPromises.writeFile(file, this._serialize(this.data));
  }
  get(path) {
    return objectPath.get(this.data, path);
  }
  set(path, value) {
    return objectPath.set(this.data, path, value);
  }
  _serialize() {
    throw new Error("_serialize() must be implemented");
  }
  _deserialize() {
    throw new Error("_deserialize() must be implemented");
  }
}

class JsonConfig extends ConfigTemplate {
  _deserialize(data) {
    return JSON.parse(data);
  }
  _serialize(data) {
    return JSON.stringify(data, null, "  ");
  }
}

import ini from "ini";
class IniConfig extends ConfigTemplate {
  _deserialize(data) {
    return ini.parse(data);
  }
  _serialize(data) {
    return ini.stringify(data);
  }
}
