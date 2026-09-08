require("dotenv").config();

const path = require("path");

const config = {
  mongodb: {
    url: process.env.MONGODB_URI,
  },
  migrationsDir: path.join(__dirname, "src", "migrations"),
  changelogCollectionName: "changelog",
  lockCollectionName: "changelog_lock",
  lockTtl: 0,
  migrationFileExtension: ".ts",
  moduleSystem: "commonjs",
};

module.exports = config;
