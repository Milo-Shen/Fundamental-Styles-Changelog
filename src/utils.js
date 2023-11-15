export function process_analyze_data(data, result, path) {
  let root = { key: "root", label: "root", children: [] };
  for (let pair_key in data) {
    const pair = data[pair_key];
    let pair_tree = { key: pair_key, label: pair_key, children: [] };
    root.children.push(pair_tree);
    single_analyze_data(pair, root, [pair_key]);
  }
}

function single_analyze_data(data, result, path) {
  if (typeof data === "object" && data.exist === undefined) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      console.log(key, path);

      let current = result;
      for (let j = 0; j < path.length; j++) {
        let level = current.children.find((x) => x.key === path[j]);
        debugger;
      }

      single_analyze_data(data[key], result, [...path, key]);
    }
  } else {
    console.log(data, path);
  }
}
