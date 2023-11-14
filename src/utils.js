export function process_analyze_data(data, result, temp) {
  if (typeof data === "object" && data.exist === undefined) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      process_analyze_data(data[key], result, key);
    }
  } else {
    console.log(data, temp);
  }
}
