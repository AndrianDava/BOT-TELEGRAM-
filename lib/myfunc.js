const axios = require("axios");
const fetch = require("node-fetch");
const fs = require("fs");
const mimes = require("mime-types");
const { fromBuffer } = require("file-type");

module.exports = class Function {
  async getFileId(ctx) {
    let mediaMessage = ctx.message;

    if (ctx.message.reply_to_message && ctx.message.reply_to_message.photo) {
      mediaMessage = ctx.message.reply_to_message;
    }

    if (mediaMessage.photo) {
      const photo = mediaMessage.photo[0];
      return photo.file_id;
    } else if (mediaMessage.video) {
      const video = mediaMessage.video;
      return video.file_id;
    } else if (mediaMessage.audio) {
      const audio = mediaMessage.audio;
      return audio.file_id;
    } else {
      return null;
    }
  }

async toTime(ms) {
      let h = Math.floor(ms / 3600000)
      let m = Math.floor(ms / 60000) % 60
      let s = Math.floor(ms / 1000) % 60
      return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
   }
  
  async getFile(PATH, save) {
    try {
      let filename = null;
      let data = await this.fetchBuffer(PATH);

      if (data?.data && save) {
        filename = path.join(
          process.cwd(),
          "temp",
          Date.now() + "." + data.ext,
        );
        fs.promises.writeFile(filename, data?.data);
      }
      return {
        filename: data?.name ? data.name : filename,
        ...data,
      };
    } catch (e) {
      throw e;
    }
  }

  async fetchJson(url, options = {}) {
    try {
      let data = await axios.get(url, {
        headers: {
          ...(!!options.headers ? options.headers : {}),
        },
        responseType: "json",
        ...options,
      });

      return await data?.data;
    } catch (e) {
      throw e;
    }
  }

  async fetchText(url, options = {}) {
    try {
      let data = await axios.get(url, {
        headers: {
          ...(!!options.headers ? options.headers : {}),
        },
        responseType: "text",
        ...options,
      });

      return await data?.data;
    } catch (e) {
      throw e;
    }
  }

  formatSize(bytes, si = true, dp = 2) {
    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return `${bytes} B`;
    }
  }

  fetchBuffer(string, options = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (/^https?:\/\//i.test(string)) {
          let data = await axios.get(string, {
            headers: {
              ...(!!options.headers ? options.headers : {}),
            },
            responseType: "arraybuffer",
            ...options,
          });
          let buffer = await data?.data;
          let name = /filename/i.test(data.headers?.get("content-disposition"))
            ? data.headers
                ?.get("content-disposition")
                ?.match(/filename=(.*)/)?.[1]
                ?.replace(/["';]/g, "")
            : "";
          let mime =
            mimes.lookup(name) ||
            data.headers.get("content-type") ||
            (await fromBuffer(buffer))?.mime;
          resolve({
            data: buffer,
            size: Buffer.byteLength(buffer),
            sizeH: this.formatSize(Buffer.byteLength(buffer)),
            name,
            mime,
            ext: mimes.extension(mime),
          });
        } else if (/^data:.*?\/.*?;base64,/i.test(string)) {
          let data = Buffer.from(string.split`,`[1], "base64");
          let size = Buffer.byteLength(data);
          resolve({
            data,
            size,
            sizeH: this.formatSize(size),
            ...((await fromBuffer(data)) || {
              mime: "application/octet-stream",
              ext: ".bin",
            }),
          });
        } else if (fs.existsSync(string) && fs.statSync(string).isFile()) {
          let data = fs.readFileSync(string);
          let size = Buffer.byteLength(data);
          resolve({
            data,
            size,
            sizeH: this.formatSize(size),
            ...((await fromBuffer(data)) || {
              mime: "application/octet-stream",
              ext: ".bin",
            }),
          });
        } else if (Buffer.isBuffer(string)) {
          let size = Buffer?.byteLength(string) || 0;
          resolve({
            data: string,
            size,
            sizeH: this.formatSize(size),
            ...((await fromBuffer(string)) || {
              mime: "application/octet-stream",
              ext: ".bin",
            }),
          });
        } else if (/^[a-zA-Z0-9+/]={0,2}$/i.test(string)) {
          let data = Buffer.from(string, "base64");
          let size = Buffer.byteLength(data);
          resolve({
            data,
            size,
            sizeH: this.formatSize(size),
            ...((await fromBuffer(data)) || {
              mime: "application/octet-stream",
              ext: ".bin",
            }),
          });
        } else {
          let buffer = Buffer.alloc(20);
          let size = Buffer.byteLength(buffer);
          resolve({
            data: buffer,
            size,
            sizeH: this.formatSize(size),
            ...((await fromBuffer(buffer)) || {
              mime: "application/octet-stream",
              ext: ".bin",
            }),
          });
        }
      } catch (e) {
        reject(new Error(e?.message || e));
      }
    });
  }
};
