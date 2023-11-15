// Import React Framework
import React, { useState } from "react";

// Import Third Party Lib
import { Layout, Menu, theme } from "antd";

// Import Customized Component
import DiffComponent from "./component/DiffComponent/DiffComponent";

// Import analyze data
import analyze_lite from "./analyze/analyze_lite.json";

// Import Utils
import { process_analyze_data, fetchFile } from "./utils";

// Import CSS
import "./index.css";

const { Header, Content, Footer, Sider } = Layout;

const processed_lite = process_analyze_data(analyze_lite);

const App = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [code, set_code] = useState(["", ""]);

  return (
    <Layout hasSider>
      <Sider
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["4"]}
          items={processed_lite.children}
          onSelect={async ({ key }) => {
            let path = key.split("_");
            let root = analyze_lite;
            for (let i = 0; i < path.length; i++) {
              root = root[path[i]];
            }

            let { old_ver_path, new_ver_path } = root;
            console.log(old_ver_path, new_ver_path);
            let [old_text, new_text] = await Promise.all([
              await fetchFile(old_ver_path),
              await fetchFile(new_ver_path),
            ]);
            set_code([old_text, new_text]);
          }}
        />
      </Sider>
      <Layout
        className="site-layout"
        style={{
          marginLeft: 200,
        }}
      >
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
          }}
        />
        <Content
          style={{
            margin: "24px 16px 0",
            overflow: "initial",
          }}
        >
          <div>334</div>
          <DiffComponent
            isUseUi={true}
            id={"diff-ui-multi"}
            fileListToggle={true}
            diffDataList={[
              {
                prevData: code[0],
                newData: code[1],
              },
            ]}
            outputFormat="side-by-side"
          />
        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          Created By Hubery
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
