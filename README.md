
# Elyxsha-Bot

Simpel Base Telegram Bot


### Install

1. Clone the repository:

```bash
git clone https://github.com/KhrlMstfa/elyxsha-bot.git
cd elyxsha-bot
```

2. install module

```bash
npm install
```

#### If npm install failed, try using yarn instead of npm

```bash
npm install -g yarn
yarn install
```

3. Start Bot

```bash
node .
```

## License

This project is licensed under the [MIT License](LICENSE), which means you are free to use, modify, and distribute the code, but you must include the original copyright and license notice in any copy of the project or substantial portion of it.



## Contoh membuat plugin
```js
export default {
    //kosongkan saja jika ingin mematikan
    command: [""],
    help: [""],
    tags: [""],
    use: "",

    //ubah ke true jika ingin menyalakan
    admin: false,
    group: false,
    owner: false,

    run: async (bot, { client }) => {
        //your script code
    }
}
```


## Authors

- [@Irull2nd](https://www.github.com/khrlmstfa)
- [@Arifzyn](https://www.github.com/Arifzyn19)

