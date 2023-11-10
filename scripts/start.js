// Import Nodejs
const fs = require("fs");
const os = require("os");
const path = require("path");

// Import Third Party Libs
const chalk = require("chalk");
const simpleGit = require("simple-git");

// Import self code
const IO = require("./io");
const { execCommand, geMinVersion } = require("./util");

// Paths
const build_version = +new Date();
const dirname = path.dirname(__dirname);
const fundamental_repo = "https://github.com/SAP/fundamental-styles.git";
const fundamental_folder = path.resolve(dirname, "fundamental-styles");
const fiori_stories = path.resolve(fundamental_folder, "packages/styles/stories");
console.log(fiori_stories);
const work_folder = path.resolve(dirname, "work_folder");

// Constant
const EOL = os.EOL;
const encoding = "utf8";

const gitToTag = (tag) => {
  process.chdir(fundamental_folder);
  simpleGit().checkout(`v${tag}`);
  simpleGit().clean(simpleGit.CleanOptions.FORCE);
  process.chdir(dirname);
};

(async function () {
  // git clone fundamental style repo
  const git = simpleGit();
  const isFundamentalAvailable = fs.existsSync(fundamental_folder);

  if (!isFundamentalAvailable) {
    await git.clone(fundamental_repo, fundamental_folder);
    console.log(chalk.bold.green(`git clone ${fundamental_repo} successfully !`));
  }

  // get released fundamental style lib versions from public NPM server
  let released_versions = await execCommand("npm view fundamental-styles versions --json");
  released_versions = JSON.parse(released_versions);
  released_versions = released_versions.filter((x) => !x.includes("rc"));
  released_versions = released_versions.filter(geMinVersion);
  console.log(released_versions);

  // download each version of fundamental-styles to work folder

  IO.mkFolderSyncRecursive(work_folder);
})();
