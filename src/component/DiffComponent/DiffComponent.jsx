// diffDataList 对比文件列表数据 [ {...diffDataItem} ]
// diffDataItem:
// {
//   prevData: any(string、json), // 旧数据
//   newData: any(string、json),  // 新数据
//   isYaml?: boolean,            // 是否 yaml 文件
//   isJson?: boolean,            // 是否j son
//   fileName?: string,           // 文件名
//   oldHeader?: string,          // 重命名，旧文件名
//   newHeader?: string           // 重命名，新文件名
// },
// outputFormat diff格式，line-by-line || side-by-side
// isUseUi 是否使用 Diff2HtmlUI
// id Diff2HtmlUI 挂载 html的id，多实例的情况下，各个实例需要唯一 id，防止页面冲突
// fileListToggle Diff2HtmlUI 文件目录概要是否要隐藏，true 显示，false 隐藏

import React, { useEffect, useState } from "react";
import { createPatch } from "diff";
import { html, parse } from "diff2html";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui";
import yaml from "js-yaml";
import "highlight.js/styles/googlecode.css";
import "diff2html/bundles/css/diff2html.min.css";

const DiffComponent = ({ diffDataList, outputFormat, isUseUi, id, fileListToggle }) => {
  const [diffData, setDiffData] = useState("");

  useEffect(() => {
    createDiffData(diffDataList);
  }, [diffDataList]);

  const createDiffData = (fileList) => {
    let diffJsonList = [];
    fileList.forEach((item) => {
      let { fileName, oldHeader, newHeader, prevData, newData, isJson, isYaml } = item;
      let oldString = prevData || "";
      let newString = newData || "";
      // 特定需求处理
      if (isYaml) {
        // 将json转化为yaml格式
        oldString = yaml.dump(prevData);
        newString = yaml.dump(newData);
      } else if (isJson) {
        // 格式化json
        oldString = JSON.stringify(prevData, null, 2);
        newString = JSON.stringify(newData, null, 2);
      }
      let args = [fileName || "", oldString, newString, oldHeader || "", newHeader || "", { context: 99999 }];
      // 对比差异
      const diffStr = createPatch(...args);
      // 差异json化
      const diffJson = parse(diffStr);
      diffJsonList.push(diffJson[0]);
    });
    if (isUseUi) {
      // 使用 diff2html-ui
      const targetElement = document.getElementById(id);
      const configuration = {
        drawFileList: true,
        matching: "lines",
        highlight: true,
        outputFormat,
      };
      const diff2htmlUi = new Diff2HtmlUI(targetElement, diffJsonList, configuration);

      //绘制页面
      diff2htmlUi.draw();

      // 高亮数据
      diff2htmlUi.highlightCode();

      // 是否折叠概要
      diff2htmlUi.fileListToggle(fileListToggle);
    } else {
      // 使用html方法
      const diffHtml = html(diffJsonList, {
        drawFileList: true,
        matching: "lines",
        showFiles: true,
        outputFormat,
      });
      setDiffData(diffHtml);
    }
  };

  return isUseUi ? (
    <div id={id || "code-diff-ui"} />
  ) : (
    <div id="code-diff" dangerouslySetInnerHTML={{ __html: diffData }} />
  );
};

export default DiffComponent;
