// Import Nodejs
const fs = require("fs");
const os = require("os");
const path = require("path");

// Import Third Party Libs
const chalk = require('chalk');
const git = require("simple-git")();

// Import self code
const IO = require("./io");
const { execCommand } = require("./util");


// Paths
const build_version = +new Date();
const dirname = path.dirname(__dirname);
const fundamental_repo = "https://github.com/SAP/ui5-webcomponents.git";
const fundamental_folder = path.resolve(dirname, "fundamental-styles");

// Constant
const EOL = os.EOL;
const encoding = "utf8";

(function (){})()
