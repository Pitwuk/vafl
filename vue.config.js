const fs = require("fs");

module.exports = {
  transpileDependencies: ["vuetify"],
  devServer: {
    https: true,
    // https: {
    //   key: fs.readFileSync("./cert/server-key.pem"),
    //   cert: fs.readFileSync("./cert/server-cert.pem"),
    //   ca: fs.readFileSync("./cert/ca-cert.pem"),
    // },
    // public: "https://localhost:8080/",
  },
};
