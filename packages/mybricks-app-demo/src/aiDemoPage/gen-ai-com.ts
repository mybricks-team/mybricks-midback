import axios from "axios";

function getGenerateComponenetQuestion(userPrompt: string) {
  return `你是一名专业的前端开发人员。你来完成用户的需求。
开发一个 React 组件，在 React@18 的工程中运行。
基础要求：
1. 组件只包含 index.tsx 和 index.less 两个文件
2. 类型、常量等都定义在 index.tsx 文件中，不要额外增加文件
3. 对于用户需求，尽量使用最受欢迎的三方库来实现，可以使用高级一些的库，而不是基础库
  a. 如用户需要拖拽功能，不要直接用拖拽库实现，而是直接使用已经带有拖拽功能的相关三方组件
  b. 如果用户要某个图表，不要自己用 canvas 画出来，而是直接 @ant-design/charts 这个库
4. 不接受入参，所有需要的数据都在组件内部管理、模拟
5. 请确保代码有良好的注释，并且处理可能的错误情况
6. 不要省略任何代码
7. 不要假设存在什么组件，保证代码可运行
8. 展示的文案使用中文
9. 在使用一些基础组件时，如表单、表格、按钮，建议使用 antd
10. 样式必须使用 less 写，不能使用 tailwindcss 这些三方样式库

按照指定格式返回代码，不要省略任何代码
返回格式:
\`\`\`
{
"index.tsx":"xxx",
"index.less":"xxx",
"deps":["依赖组件1@1.0.0", "依赖组件2@3.0.0"]
}
\`\`\`
只需要按照指定 JSON 返回格式返回 index.tsx、index.less 的代码和依赖三方包列表，不要其他信息
确保返回值是JSON格式，没有任何多余的符号（如空白符、换行符）

下面是用户需求:
\`\`\`
${userPrompt}
\`\`\`
`
}

function getFixComponentQuestion(errorMsg: string) {
  return `组件运行时遇到以下报错：
\`\`\`
${errorMsg}
\`\`\`
请修复这个报错

按照指定格式返回代码，不要省略任何代码
返回格式:
\`\`\`
{
"index.tsx":"xxx",
"index.less":"xxx",
"deps":["依赖组件1@1.0.0","依赖组件2@3.0.0"]
}
\`\`\`
只需要按照指定 JSON 返回格式返回 index.tsx、index.less 的代码和依赖三方包列表，不要其他信息
确保返回值是JSON格式，没有任何多余的符号（如空白符、换行符）`
}

function getUserFixComponentQuestion(userPrompt: string) {
  return `基于前面生成的代码，用户给出了更多的建议
下面是用户建议
\`\`\`
${userPrompt}
\`\`\`
请参考用户建议修改代码

按照指定格式返回代码，不要省略任何代码
返回格式:
\`\`\`
{
"index.tsx":"xxx",
"index.less":"xxx",
"deps":["依赖组件1@1.0.0","依赖组件2@3.0.0"]
}
\`\`\`
只需要按照指定 JSON 返回格式返回 index.tsx、index.less 的代码和依赖三方包列表，不要其他信息
确保返回值是JSON格式，没有任何多余的符号（如空白符、换行符）`
}

// const model = "anthropic/claude-3.5-sonnet:beta";
// const model = "deepseek/deepseek-coder";
const model = "openai/gpt-4o-mini-2024-07-18";
// const model = "gryphe/mythomax-l2-13b";

export default class AIGenerate {
  messages: {
    role: string;
    content: string;
  }[] = [];

  resultComponent: {
    "index.tsx": string;
    "index.less": string;
    "deps": string[];
  } = {
      "index.tsx": "",
      "index.less": "",
      "deps": []
    }

  async talk(prompt: string) {
    // 计时
    const startTime = Date.now();

    this.messages.push({ role: 'user', content: prompt });

    console.log('开始询问');
    const res1 = await axios.post("https://ai.mybricks.world/code", {
      "model": model,
      "messages": this.messages,
    });
    const data = res1.data;
    console.log('询问结果', data);
    this.messages.push({ role: 'assistant', content: data.choices[0].message.content });

    console.log(`messages JD==> `, this.messages);

    const endTime = Date.now();
    console.log(`总耗时: ${endTime - startTime}ms`);

    const output = data.choices[0].message.content;

    try {
      this.resultComponent = JSON.parse(output);
    } catch (e) {
      console.error('解析失败', e);
    }
  }

  constructor() { }

  async initGenerateComponent(userPrompt: string) {
    await this.talk(getGenerateComponenetQuestion(userPrompt));
  }

  async fixComponent(errorMsg: string) {
    await this.talk(getFixComponentQuestion(errorMsg));
  }

  async userFixComponent(userPrompt: string) {
    await this.talk(getUserFixComponentQuestion(userPrompt));
  }
}