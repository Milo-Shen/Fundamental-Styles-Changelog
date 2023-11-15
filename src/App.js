// Import React Framework
import React from "react";

// Import Third Party Lib
import { Layout, Menu, theme } from "antd";

// Import Customized Component
import DiffComponent from "./component/DiffComponent/DiffComponent";

// Import analyze data
import analyze_lite from "./analyze/analyze_lite.json";

// Import Utils
import { process_analyze_data } from "./utils";

// Import CSS
import "./index.css";

const { Header, Content, Footer, Sider } = Layout;

const processed_lite = process_analyze_data(analyze_lite);

const App = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["4"]} items={processed_lite.children} />
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
                prevData: "app",
                newData: "ppp",
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
          Ant Design ©2023 Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
