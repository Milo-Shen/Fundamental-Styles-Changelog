// Import Configuration
const config = require("./config");

const { exec } = require("child_process");

/**
 * function: traversal all inner dom nodes
 * @param _dom
 * @param domCallback
 * @returns {[]}
 */
function traversal(_dom, domCallback) {
  const result = [];
  const dom = _dom.children;
  (function _inner(dom) {
    const len = dom.length;
    let d = null;
    for (let i = 0; i < len; i++) {
      d = dom[i];
      result.push(d);
      domCallback && domCallback(d);
      if (d.children) {
        _inner(d.children);
      }
    }
  })(dom);
  return result;
}

/**
 * exec shell commands
 * @param command
 * @returns {Promise<unknown>}
 */
function execCommand(command) {
  return new Promise((resolve, reject) =>
    exec(command, (error, stdout, stderr) => {
      const _error = error || stderr;
      if (_error) {
        console.error(`exec error: ${_error}`);
        reject(_error);
        return;
      }
      resolve(stdout);
    }),
  );
}

function geMinVersion(version) {
  let min_version = config.Min_fundamental_Version;
  let version_num = version.split(".").map((x) => ~~x);
  let min_version_num = min_version.split(".").map((x) => ~~x);

  for (let i = 0; i < 3; i++) {
    if (version_num[i] === min_version_num[i]) {
      continue;
    }

    return version_num[i] > min_version_num[i];
  }

  return true;
}

module.exports = {
  traversal,
  execCommand,
  geMinVersion,
};
