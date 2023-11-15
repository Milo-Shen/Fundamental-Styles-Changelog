export function process_analyze_data(data) {
  let root = { key: "root", label: "root", children: [] };

  for (let pair_key in data) {
    const pair = data[pair_key];
    let pair_tree = { key: pair_key, label: pair_key, children: [] };
    root.children.push(pair_tree);
    single_analyze_data(pair, root, [pair_key]);
  }

  return root;
}

function single_analyze_data(data, result, path) {
  if (typeof data === "object" && data.exist === undefined) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];

      let root = result;
      for (let j = 0; j < path.length; j++) {
        root = root.children.find((x) => x.label === path[j]);
      }

      if (!root.children.find((x) => x.label === key)) {
        root.children.push({
          key: [...path, key].join("_"),
          label: key,
          children: [],
        });
      }

      single_analyze_data(data[key], result, [...path, key]);
    }
  } else {
    let root = result;
    for (let j = 0; j < path.length; j++) {
      root = root.children.find((x) => x.label === path[j]);
    }
    root.content = data;
    delete root.children;
  }
}

export function fetchFile(url) {
  return new Promise((resolve) => {
    fetch(url)
      .then((r) => r.text())
      .then((text) => {
        resolve(text);
      });
  });
}
