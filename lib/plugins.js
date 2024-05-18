const path = require("path");
const fs = require("fs");
const syntaxerror = require("syntax-error");

class Collection extends Map {
  find(fn = (value, key, collection) => {}, thisArgs) {
    if (typeof thisArgs !== "undefined") fn = fn.bind(thisArgs);
    for (const [key, val] of this) {
      if (fn(val, key, this)) return val;
    }
  }

  findKey(fn = (value, key, collection) => {}, thisArgs) {
    if (typeof thisArgs !== "undefined") fn = fn.bind(thisArgs);
    for (const [key, val] of this) {
      if (fn(val, key, this)) return key;
    }
  }

  sort(compareFunction = this.defaultSort) {
    const entries = [...this.entries()];
    entries.sort((a, b) => compareFunction(a[0], b[0]));
    super.clear();
    for (const [key, value] of entries) super.set(key, value);
    return this;
  }

  map(fn = (value, key, collection) => {}, thisArgs) {
    const iter = this.entries();
    return Array.from({ length: this.size }, () => {
      const [key, value] = iter.next().value;
      return fn(value, key, this);
    });
  }

  defaultSort(firstKey, secondKey) {
    return Number(firstKey > secondKey) || Number(firstKey === secondKey) - 1;
  }
}

const watchPlugins = (folderPath) => {
  fs.watch(folderPath, { recursive: true }, (eventType, filename) => {
    if (eventType === "change") {
      console.log(`Plugin changed: ${filename}`);
      reloadPlugin(folderPath, filename);
    } else if (eventType === "rename") {
      console.log(`Plugin deleted or added: ${filename}`);
      deletePlugins(folderPath, filename);
    }
  });
};

const deletePlugins = (folderPath, filename) => {
  const filePath = path.join(folderPath, filename);
  if (fs.existsSync(filePath)) {
    reloadPlugin(filePath, filename);
  } else {
    console.log(`Plugin deleted: ${filePath}`);
    global.plugins.delete(filePath);
  }
};

const reloadPlugin = (folderPath, filename) => {
  const filePath = path.join(folderPath, filename);

  const pluginFilter = (filename) => /\.js$/.test(filename);
  if (pluginFilter(filename)) {
    if (fs.existsSync(filePath)) {
      if (filePath in require.cache) {
        delete require.cache[require.resolve(filePath)];
        console.log(`Reloaded plugin '${filePath}'`);
      } else {
        console.log(`Loaded new plugin '${filePath}'`);
      }

      let err = syntaxerror(fs.readFileSync(filePath), filename);
      if (err) {
        console.error(`Syntax error while loading '${filename}'\n${err}`);
      } else {
        delete require.cache[require.resolve("../" + filePath)];
        const module = require("../" + filePath);
        global.plugins.set(filePath, module);
      }
    } else {
      console.log(`Plugin deleted: ${filePath}`);
    }
  }
};

module.exports = {
  Collection,
  watchPlugins,
  reloadPlugin,
  deletePlugins,
};
