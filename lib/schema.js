const fs = require("fs");
const { join } = require("path");

module.exports = class Database {
  constructor(path) {
    this.file = join(process.cwd(), path ? path : "tmp/database.json");
  }
  read = () => {
    if (!fs.existsSync(this.file)) return {};
    const json = JSON.parse(fs.readFileSync(this.file, "utf-8"));
    return json;
  };
  write = (data) => {
    const database = data ? data : global.db;
    fs.writeFileSync(this.file, JSON.stringify(database, null, 3));
  };
  connect = async () => {
    let content = await this.read();
    if (!content || Object.keys(content).length === 0) {
      global.db = {
        users: {},
        chats: {},
        settings: {},
      };
      await this.write();
    } else {
      global.db = content;
    }
  };
};
