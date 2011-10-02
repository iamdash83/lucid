var Lucid = require("./lib/Lucid");

new Lucid({
    config: process.argv[2] || "config/main.json",
    rootPath: __dirname
});
