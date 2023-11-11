// Import Nodejs
const fs = require("fs");
const os = require("os");
const path = require("path");

// Import Third Party Libs
const chalk = require("chalk");
const prettier = require("prettier");
const simpleGit = require("simple-git");

// Import self code
const IO = require("./io");
const { execCommand, geMinVersion } = require("./util");
const Config = require("./config");

// Paths
const build_version = +new Date();
const dirname = path.dirname(__dirname);
const fundamental_repo = "https://github.com/SAP/fundamental-styles.git";
const fundamental_folder = path.resolve(dirname, "fundamental-styles");
const fiori_stories = path.resolve(fundamental_folder, "packages/styles/stories/Components");
const work_folder = path.resolve(dirname, "work_folder");

// Constant
const EOL = os.EOL;
const encoding = "utf8";

const gitToTag = (tag) => {
  return new Promise((resolve) => {
    process.chdir(fundamental_folder);
    simpleGit().checkout(tag, undefined, () => {
      simpleGit().clean(simpleGit.CleanOptions.FORCE);
      process.chdir(dirname);
      resolve();
    });
  });
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
  IO.resetFolderRecursive(work_folder);

  for (let i = 0; i < released_versions.length; i++) {
    // switch to the specify tag
    const tag = `v${released_versions[i]}`;
    await gitToTag(tag);

    const versioned_story_folder = path.resolve(work_folder, tag);
    IO.copyFileRecursive(fiori_stories, versioned_story_folder);

    IO.walk(versioned_story_folder, (_path) => {
      const extname = path.extname(_path);
      const file = fs.readFileSync(_path, encoding);
      if (extname === ".js") {
        const formatted_file = prettier.format(file, Config.Formatter.js);
        console.log(formatted_file);
      }
    });
  }
})();
