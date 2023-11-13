// Import Nodejs
const fs = require("fs");
const path = require("path");
const diff = require("fast-diff");

// Import Third Party Libs
const chalk = require("chalk");
const prettier = require("prettier");
const simpleGit = require("simple-git");

// Import Self Code
const IO = require("./io");
const { execCommand, geMinVersion } = require("./util");
const Config = require("./config");

// Import Static Files
let analyze = require("../analyze/analyze_detail.json");

// Paths
const build_version = +new Date();
const dirname = path.dirname(__dirname);
const fundamental_repo = "https://github.com/SAP/fundamental-styles.git";
const fundamental_folder = path.resolve(dirname, "fundamental-styles");
const fiori_stories = path.resolve(fundamental_folder, "packages/styles/stories/Components");
const work_folder = path.resolve(dirname, "work_folder");
const analyze_detail = path.resolve(dirname, "analyze/analyze_detail.json");
const analyze_lite = path.resolve(dirname, "analyze/analyze_lite.json");

// Constant
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

const generate_analyze = (new_ver_folder, version_pair) => {
  IO.walk(new_ver_folder, (_path) => {
    const relative_path = path.relative(work_folder, _path);
    const json_level_keys = relative_path.split(path.sep);

    const version = version_pair;
    analyze[version] = analyze[version] || {};

    let [old_ver, new_ver] = version_pair.split("-");
    const old_path = _path.replace(new_ver, old_ver);
    let is_exist = fs.existsSync(old_path);
    let has_diff = false;

    if (is_exist) {
      const new_file = fs.readFileSync(_path, encoding);
      const old_file = fs.readFileSync(old_path, encoding);
      has_diff = diff(old_file, new_file).length !== 1;
    }

    let cur_analyze = analyze[version];
    let json_len = json_level_keys.length;

    for (let i = 1; i < json_len; i++) {
      let key = json_level_keys[i];

      if (cur_analyze[key] === undefined) {
        cur_analyze[key] = {};
      }

      cur_analyze = cur_analyze[key];
    }

    cur_analyze.exist = is_exist;
    cur_analyze.has_diff = has_diff;
    cur_analyze.new_ver_path = _path;
    cur_analyze.old_ver_path = is_exist ? old_path : "";
  });
};

const fileDiff = (source, target) => {};

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
  const versions_count = released_versions.length;

  // get version pair
  let version_pair = {};
  let version_pair_arr = [];
  for (let i = 0; i < versions_count; i++) {
    for (let j = i + 1; j < versions_count; j++) {
      let pair_name = `v${released_versions[i]}-v${released_versions[j]}`;
      version_pair[pair_name] = false;
      version_pair_arr.push(pair_name);
    }
  }

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

    // format the story example
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

  version_pair_arr.length = 1;
  // compare the same example between different released versions
  for (let i = 0; i < version_pair_arr.length; i++) {
    const version_pair = version_pair_arr[i];
    let [old_ver, new_ver] = version_pair.split("-");
    const new_ver_folder = path.resolve(work_folder, new_ver);

    generate_analyze(new_ver_folder, version_pair);

    let formatted_analyze = prettier.format(JSON.stringify(analyze), Config.Formatter.json);
    fs.writeFileSync(analyze_detail, formatted_analyze, encoding);
  }
})();
