import axios from "axios";

const MODEL = "openai/gpt-4o-mini-2024-07-18";

function extendUserFirstPrompt(userPrompt: string) {
  return `你是一个专业的Web开发人员，专门从事组件开发。
          根据用户需求使用 recharts 组件库实现图表组件
          组件应该只有 index.jsx 文件的代码，不要出现任何其他文件。
          组件代码遵循最佳实践和代码规范。
          不要假设组件可以从外部获取任何数据，所有必需的数据都应该包含在生成的代码中。

          对于图表组件具有以下需求
          1. 请确保Y轴具有单位信息。
          2. 同时展示多种数据时，需要判断数据的单位，如果单位不同则需要使用不同的Y轴。
          3. 同时展示多种数据，需要使用 ComposedChart
          4. 请确保Y轴使用合适的起点和相等的间隔。
          5. 图例尽量使用中文并保证可读性。
          6. 一种数据只用一种方式展示，不要重复展示

          在生成代码前，请先回答以下问题
          1. 用户需求里要展示哪些数据，并预估真实情况下最可能的数据范围。
          2. 每种数据分别最适合使用那种单位。
          3. 每种数据分别最适合用那种图表展示。

          以下是用户需求：
          \`\`\`
          ${userPrompt}
          \`\`\`

          请确保生成的代码是可运行的。`
}

function extendUserContinuePrompt(userPrompt: string) {
  return `
    ${userPrompt}

    请返回修改后的 jsx 代码
  `
}

function extractJSX(content) {
  const regex = /```jsx([\s\S]*?)```/g; // 匹配三个反引号中的内容
  const matches = content.match(regex);

  if (matches) {
    return matches.map(match => match.replace(/```jsx|```/g, '').trim()); // 去掉标记并清理空格
  }
  return [];
}

export default class AIGenerate {
  messages: {
    role: string;
    content: string;
  }[] = [];

  resultComponent: {
    "index.jsx": string;
    "index.less": string;
    "deps": string[];
  } = {
      "index.jsx": "",
      "index.less": "",
      "deps": []
    }

  async talk(prompt: string) {
    // 计时
    const startTime = Date.now();

    this.messages.push({
      role: 'user',
      content: prompt
    })

    console.log('开始询问');
    const res1 = await axios.post("https://ai.mybricks.world/code", {
      "model": MODEL,
      "messages": this.messages,
    });
    const data = res1.data;
    console.log('询问结果', data);

    const endTime = Date.now();
    console.log(`总耗时: ${endTime - startTime}ms`);

    const output = data.choices[0].message.content;

    this.messages.push({
      role: 'assistant',
      content: output
    })

    try {
      console.log(`output JD==> `, output);

      const componentCode = extractJSX(output);
      this.resultComponent = {
        "index.jsx": componentCode[0],
        "index.less": "",
        "deps": []
      };
    } catch (e) {
      console.error('解析失败', e);
    }
  }

  constructor() { }

  async initGenerateComponent(userPrompt: string) {
    await this.talk(extendUserFirstPrompt(userPrompt));
  }

  async fixComponent(errorMsg: string) {
    // await this.talk(getFixComponentQuestion(errorMsg));
  }

  async userContinueTalk(userPrompt: string) {
    await this.talk(extendUserContinuePrompt(userPrompt));
  }
}