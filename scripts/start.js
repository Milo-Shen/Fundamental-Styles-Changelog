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

  // download each version of fundamental-styles to work folder
  IO.mkFolderSyncRecursive(work_folder);

  for (let i = 0; i < released_versions.length; i++) {
    // switch to the specify tag
    const tag = `v${released_versions[i]}`;
    await gitToTag(tag);

    const versioned_story_folder = path.resolve(work_folder, tag);
    if (fs.existsSync(versioned_story_folder)) {
      continue;
    }

    IO.copyFileRecursive(fiori_stories, versioned_story_folder);

    IO.walk(versioned_story_folder, (_path) => {
      const extname = path.extname(_path);
      const relative_path = path.relative(dirname, _path);
      const formatter = Config.Formatter[extname.substring(1)];
      const file = fs.readFileSync(_path, encoding);
      try {
        const formatted_file = prettier.format(file, formatter);
        fs.writeFileSync(_path, formatted_file, encoding);
        console.log(chalk.bold.green(`Info: file ${relative_path} has been formatted !`));
      } catch (e) {
        console.log(chalk.bold.yellow(`Warning: file ${relative_path} has format issue...`));
      }
    });
  }
})();
