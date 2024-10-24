import React, { useEffect, lazy, useState, Suspense } from "react";
import ReactDOM from "react-dom";
import { RenderComCDN } from "./constants";
import { Divider, message, Button } from "antd";
import RendererUrlCom from "./RenderUrlCom";
import "@m-ui/react/dist/@m-ui/react.css";
import "@m-ui/react/dist/@m-ui/react.less";
import RenderCom from './render-com'
import { deps, getLocalDeps } from "./constants";

// DemoUrl resourceCode=Button_Wed_1

// 发布后的UMD 资源链接
const demo4 =
  "https://f2.eckwai.com/kos/nlav12333/unpkg/lz/Form_demo_g2/1.0.0/index.umd.js";

  const DemoUrl = 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/Button_Wed0.34476.js'

// 搭建地址 https://lingzhu.staging.kuaishou.com/sketch/lowCode/designer/?appKey=yzj_letter_com_group&outAppKey=letter_com_group&tenant=yzj&orderId=2428901041503&resourceCode=local_btn_1&use-declare=1
const DemoUrl2 = 'https://w1.beckwai.com/kos/nlav12333/cdm-thumbnai/local_btn0.49611.js'

const demo3 = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-15/1728995191592.102ca58d6b6a91ec.js'


const  RenderComType = 'https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-24/1729759199008.0ac9ef7df537fd42.js'
const button ='https://cdnfile.corp.kuaishou.com/kc/files/a/kael-mui-demo/chrome-plugin-upload/2024-10-14/1728914111742.253c11471b90d5b1.js'
ReactDOM.render(<MyApp />, document.getElementById("root"));
function MyApp() {
  return <RendererDemo />;
}

function RendererDemo() {
  let newDeps = getLocalDeps(deps, {});

  const [Com, setCom] = useState(undefined);

  let cloudRef, cloudRenderRef, cloudDemoUrl2Ref, cloudRef4;

  const [props1, setProps1] = useState({
    formReady: (form) => {
      form.setFieldsValue({
        name: "标签名字",
        sex: "man",
        num: 1100,
      });
    },
    label: "选项",
    options: [
      {
        label: "电商",
        value: "电商",
      },
      {
        label: "商业化",
        value: "商业化",
      },
    ],
    submit(data) {
      message.success("提交数据 本地调用1:" + JSON.stringify(data));
    },
    getRef: (ref) => {
      cloudRef4 = ref;
    },
  });

  const handleClick = () => {
    const val = Math.random().toFixed(2);
    setProps1((prev) => ({
      ...prev,
      label: "更新后的标签" + Math.random().toFixed(1),
      options: [
        { label: "更新label" + val, value: "更新label" + val },
        { label: "AAA" + val, value: "AAA" + val },
      ],
    }));
  };

  const callInner = () => {
    cloudRef4.click()
    message.success('内部数据config'+ JSON.stringify(cloudRef4.config))
  }
  return (
    <div>
      <div>Hello 渲染云组件 Demo </div>
      <Button onClick={handleClick}> 点击demo组件的label options属性</Button>
      {/* <RendererUrlCom url={demo4} comProps={props1} /> */}
      <button onClick={callInner}>调用云组件内部click</button>

      {/* <RendererUrlCom url={RenderComCDN} comProps={props1}  />
      <Divider />
      <RendererUrlCom url={DemoUrl} comProps={{}}  /> */}
      <Divider />
      {/* <RendererUrlCom url={button} comProps={{label: 'AAA'}}  /> */}
      <RendererUrlCom url={RenderComType} comProps={{ label: 'AAa'}} />
      <RenderCom  />
    </div>
  );
}
