var Lucid = require("./lib/Lucid");

lucid = new Lucid({
    config: process.argv[2] || "config/main.json",
    rootPath: __dirname
});
