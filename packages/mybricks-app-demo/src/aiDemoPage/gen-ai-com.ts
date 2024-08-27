import axios from "axios";

// const userPrompt = `开发一个可编辑的任务列表，用户可以添加、删除和修改任务。每个任务应有截止日期和优先级标记，并且可以拖拽排序。`
// const userPrompt = `展示一个班级的多个学生成绩随时间变化的折线图，需要展示横纵坐标。每根折线鼠标移动上去会显示学习的姓名等信息`
// “开发一个可过滤的产品列表，用户可以通过输入关键词或选择类别来筛选产品。每个产品项点击后能展开显示更多详情。”

function getQuestion(userPrompt: string) {
  const q1 = `扩展和完善用户需求，设想用户可能附加的需求
只设想一些实现成本较小的需求，保证需求可以在组件内用较少的代码实现
需求需要专注于组件本身功能的实现
不考虑多端适配
不考虑强依赖外部实现的需求，如：电子邮件通知
用户需求:
\`\`\`
${userPrompt}
\`\`\` `;

  const q2 = `你是一名专业的前端开发人员。
基于上述已经完善的用户需求，开发一个适用于使用 antd@4 的项目的 React 组件。注意：由于某些 antd 组件不接受 ref，请尽量避免将 ref 直接传递给这些组件。
基础要求：
1. 组件只包含 index.tsx 和 index.less 两个文件
2. 类型、常量等都定义在 index.tsx 文件中，不要额外增加文件
3. 组件不接受任何 props，所有的数据都在组件内部定义
4. 请确保代码有良好的注释，并且处理可能的错误情况
5. 不要省略任何代码
6. 不要假设存在什么组件，保证代码可运行
现在让我们一步一步地思考，从而开发出这个组件，满足上述已经完善的用户需求`;

  const q3 = `改造此组件代码，组件增加入参 inputs 和 outputs，不接受其他入参

如果需要接收外部数据，请用 inputs['属性名'](获取数据的回调) 的形式来获取
\`\`\` 
inputs['userData'](callback);
\`\`\` 
这里的 callback 是一个函数，用于处理获取到的数据。

如果需要往组件外部吐出数据，请用 outputs['属性名'](属性值) 的形式吐出
\`\`\` 
outputs['result'](42);
\`\`\`
这里的 42 是您希望输出的数据值。

请确保数据管理是在组件内部
不强制要求用户传入 inputs 和 outputs, 不传入组件也能正常使用

代码示例：
\`\`\`
import { useState, useEffect } from 'react';
import './index.less';

interface InputsType {
  setTitle: (callback: (title: string) => void) => void;
}

interface OutputsType {
  click: (value: any) => void;
}

interface Props {
  inputs: InputsType;
  outputs: OutputsType;
}

const Com: React.FC<Props> = ({ inputs, outputs }) => {
  const [title, setTitle] = useState("标题");

  useEffect(() => {
    inputs['setTitle']((title) => {
      setTitle(title);
    })
  }, [])

  const handleClick = () => {
    outputs['click']();
  }

  return (
    <div className={styles.component} onClick={handleClick}>
      我是自定义渲染的组件，<span>{title}</span>
    </div>
  );
}
\`\`\` `;

  const q4 = `请基于前面你给出的组件代码做以下操作：
1. 检查组件代码中是否使用了未被引入的组件，如果存在则引入缺少的组件。
2. 修复TS类型报错。
3. 修复语法错误。
4. 文案修改为中文
最后按照指定格式返回代码，不要省略任何代码
返回格式:
\`\`\`
<filename>index.tsx</filename>
<code>
import React from 'react';
import './MyComponent.less';

const MyComponent: React.FC = () => {
    return (
        <div className="my-component">
            <h1>你好世界</h1>
        </div>
    );
};

export default MyComponent;
</code>

<filename>index.less</filename>
<code>
.my-component {
    background-color: #f0f0f0;
    h1 {
        color: #333;
    }
}
</code>
\`\`\`
只需要按照指定返回格式返回 index.tsx 和 index.less 的代码，不要其他信息`

  return {
    q1,
    q2,
    q3,
    q4
  }
}

// const model = "anthropic/claude-3.5-sonnet:beta";
// const model = "deepseek/deepseek-coder";
const model = "openai/gpt-4o-mini-2024-07-18";
// const model = "gryphe/mythomax-l2-13b";

export default async function (userPrompt: string) {
  const { q1, q2, q3, q4 } = getQuestion(userPrompt);

  // 计时
  const startTime = Date.now();

  const messages = [] as { role: string; content: string }[];
  messages.push({ role: 'user', content: q1 });

  console.log('开始执行第一次询问');
  const res1 = await axios.post("https://ai.mybricks.world/code", {
    "model": model,
    "messages": messages,
  });
  const data = res1.data;
  console.log('第一次询问结果', data);
  messages.push({ role: 'assistant', content: data.choices[0].message.content });

  console.log('开始执行第二次询问');
  messages.push({ role: 'user', content: q2 });
  const res2 = await axios.post("https://ai.mybricks.world/code", {
    "model": model,
    "messages": messages,
  });
  const data2 = res2.data;
  console.log('第二次询问结果', data2);
  messages.push({ role: 'assistant', content: data2.choices[0].message.content });

  console.log('开始执行第三次询问');
  messages.push({ role: 'user', content: q3 });
  const res3 = await axios.post("https://ai.mybricks.world/code", {
    "model": model,
    "messages": messages,
  });
  const data3 = res3.data;
  console.log('第三次询问结果', data3);
  messages.push({ role: 'assistant', content: data3.choices[0].message.content });

  console.log('开始执行第四次询问');
  messages.push({ role: 'user', content: q4 });
  const res4 = await axios.post("https://ai.mybricks.world/code", {
    "model": model,
    "messages": messages,
  });
  const data4 = res4.data;
  console.log('第四次询问结果', data4);
  messages.push({ role: 'assistant', content: data4.choices[0].message.content });

  console.log(`messages JD==> `, messages);

  const endTime = Date.now();
  console.log(`总耗时: ${endTime - startTime}ms`);

  const output = data4.choices[0].message.content;

  const filenamePattern = /<filename>(.*?)<\/filename>/g;
  const codePattern = /<code>(.*?)<\/code>/gs;

  let match;
  const filenames = [] as string[];
  const codes = [] as string[];

  while ((match = filenamePattern.exec(output)) !== null) {
    filenames.push(match[1]);
  }

  while ((match = codePattern.exec(output)) !== null) {
    codes.push(match[1]);
  }

  const res = {} as Record<string, string>;
  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    const code = codes[i];
    res[filename] = code;
  }

  console.log(`res JD==> `,res);

  return res as { "index.tsx": string, "index.less": string };
}