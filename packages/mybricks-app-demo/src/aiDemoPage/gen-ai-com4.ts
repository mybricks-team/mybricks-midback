import { message } from "antd";
import axios from "axios";

const MODEL = "openai/gpt-4o-mini";
// const MODEL = "openai/o1-mini";

const OPENROUTER_API_KEY = `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`;

async function postAI(options: any) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": MODEL,
      ...options
    })
  }).then(response => response.json());
  console.log(`response JD==> `, response);
  return response
}

function extractJSX(content) {
  const regex = /```jsx([\s\S]*?)```/g; // 匹配三个反引号中的内容
  const matches = content.match(regex);

  if (matches) {
    return matches.map(match => match.replace(/```jsx|```/g, '').trim()); // 去掉标记并清理空格
  }
  return [];
}

function extractJSON(content) {
  const regex = /```json([\s\S]*?)```/g; // 匹配三个反引号中的内容
  const matches = content.match(regex);

  if (matches) {
    return matches
      .map(match => match.replace(/```json|```/g, '').trim()) // 去掉标记并清理空格
      .map(str => JSON.parse(str));
  }
  return [];
}

async function analysisUserFirstPrompt(userPrompt: string) {
  const prompt = `你是一个专业的Web开发人员，专门从事组件开发。
          请分析用户的需求是要”图表“还是”表格“。
          再分析实现这个需求可能需要参考哪些文档，提供一些关键词。

          以下是用户需求：
          ===
          ${userPrompt}
          ===
            
          返回格式如下
          \`\`\`json
          {
            "type": "图表",
            "keywords": ["柱状图", "折线图", "趋势"]
          }
          \`\`\`
          `

  const response = await postAI({ messages: [{ role: 'user', content: prompt }] })
  const output = response.choices[0].message.content;

  return extractJSON(output) as { type: '图表' | '表格', keywords: string[] };
}

async function extendUserFirstPrompt(userPrompt: string, keywords: string[]) {
  const suggestAndDemo = await getSuggestAndDemo(keywords);

  return `你是一个专业的Web开发人员，专门从事组件开发。
          根据用户需求使用 recharts 组件库实现图表组件
          组件应该只有 index.jsx 文件的代码，不要出现任何其他文件，不要从相对路径引入任何内容。
          组件代码遵循最佳实践和代码规范。
          不要假设组件可以从外部获取任何数据，所有必需的数据都应该包含在生成的代码中。

          在生成代码前，请先回答以下问题
          1. 用户需求里要展示哪些数据，并预估真实情况下最可能的数据范围。
          2. 每种数据分别最适合使用那种单位。
          3. 每种数据分别最适合用那种图表展示。

          以下是可以参考的文档和建议
          ####
          ${suggestAndDemo}
          ####

          以下是用户需求：
          ####
          ${userPrompt}
          ####

          请确保生成的代码是可运行的。`
}

function extendUserContinuePrompt(userPrompt: string) {
  return `
    ${userPrompt}

    请返回修改后的 jsx 代码
  `
}



const getSuggestAndDemoTool = {
  type: "function",
  function: {
    name: "getSuggestAndDemo",
    description: "搜索并获取关键词相关的建议和Demo",
    parameters: {
      type: "object",
      properties: {
        keywords: {
          type: "array",
          items: {
            type: "string"
          },
          description: "关键词列表，如：['折线图', '饼图']"
        }
      },
      required: ["keywords"]
    }
  }
};
async function getSuggestAndDemo(keywords: string[]) {
  console.log("根据关键词获取文档和建议：", keywords)

  let basePrompt = '';

  if (keywords.includes("折线图")) {
    basePrompt = `
      对于折线图组件具有以下建议:
        1. 请确保Y轴具有简短的单位信息。
        2. 同时展示多种数据时，需要判断数据的单位，如果单位不同则需要使用不同的Y轴。
        3. 同时展示多种数据时，需要使用 ComposedChart
        4. 请确保Y轴使用合适的起点和相等的间隔。
        5. 图例尽量使用中文并保证可读性。
        6. 不要重复展示相同的数据

    `;

    // 折线图 Demo1
    basePrompt += `
      下面是折线图组件的参考Demo1(一个普通的折线图，大部分情况下用这种):
      \`\`\`jsx
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={500} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      \`\`\`
    `

    // 折线图 Demo2
    basePrompt += `
      下面是折线图组件的参考Demo2(仅展示趋势，不需要展示其他数据的情况下使用):
      \`\`\`jsx
        <ResponsiveContainer width="100%" height="100%">
          <LineChart width={300} height={100} data={data}>
            <Line type="monotone" dataKey="pv" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      \`\`\`
    `

    // 折线图 Demo3
    basePrompt += `
    下面是折线图组件的参考Demo3(仅展示趋势，不需要展示其他数据的情况下使用):
    \`\`\`jsx
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          width={500}
          height={400}
          data={data}
          margin={{
            top: 20,
            right: 80,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#f5f5f5" />
          <XAxis dataKey="name" label={{ value: 'Pages', position: 'insideBottomRight', offset: 0 }} scale="band" />
          <YAxis label={{ value: 'Index', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
          <Bar dataKey="pv" barSize={20} fill="#413ea0" />
          <Line type="monotone" dataKey="uv" stroke="#ff7300" />
        </ComposedChart>
      </ResponsiveContainer>
    \`\`\`
    `
  }

  if (keywords.includes("柱状图")) {
    basePrompt = `
      对于柱状图组件具有以下建议:
        1. 请确保Y轴具有简短的单位信息。
        2. 同时展示多种数据时，需要判断数据的单位，如果单位不同则需要使用不同的Y轴。
        3. 同时展示多种数据时，需要使用 ComposedChart
        4. 请确保Y轴使用合适的起点和相等的间隔。
        5. 图例尽量使用中文并保证可读性。
        6. 不要重复展示相同的数据

        `

    // 柱状图 Demo1
    basePrompt += `
    下面是柱状图组件的参考Demo1(一个极简的柱状图):
    \`\`\`jsx
      <ResponsiveContainer width="100%" height="100%">
        <BarChart width={150} height={40} data={data}>
          <Bar dataKey="uv" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    \`\`\`
  `
    // 柱状图 Demo2
    basePrompt += `
    下面是柱状图组件的参考Demo2(一个普通的柱状图):
    \`\`\`jsx
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pv" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          <Bar dataKey="uv" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
        </BarChart>
      </ResponsiveContainer>
    \`\`\`
    `
  }
}

export default class AIGenerate {
  messages: {
    role: string;
    content: string;
    tools?: any[];
    tool_choice?: string;
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
    const response = await postAI({
      messages: this.messages,
      // tools: [getSuggestAndDemoTool],
      // tool_choice: "auto",
    });
    console.log('询问结果', response);

    const endTime = Date.now();
    console.log(`总耗时: ${endTime - startTime}ms`);

    const output = response.choices[0].message.content;

    this.messages.push({
      role: 'assistant',
      content: output
    })


    // for (let toolCall of response.choices[0].message.tool_calls) {
    //   const functionName = toolCall.function.name;
    //   const functionArgs = JSON.parse(toolCall.function.arguments);
    //   console.log(`functionName: ${functionName}, functionArgs: ${JSON.stringify(functionArgs)}`);
    //   if (functionName === "getSuggestAndDemo") {
    //     const keywords = functionArgs.keywords as string[];
    //     const demo = await getSuggestAndDemo(keywords);
    //     console.log('demo', demo);
    //   };
    // }

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
    const { type, keywords } = await analysisUserFirstPrompt(userPrompt);
    if (type !== '图表') {
      message.warning('当前只支持生成图表组件');
      return;
    }
    const firstPrompt = await extendUserFirstPrompt(userPrompt, keywords);

    console.log(`firstPrompt JD==> `, firstPrompt);
    await this.talk(firstPrompt);
  }

  async fixComponent(errorMsg: string) {
    // await this.talk(getFixComponentQuestion(errorMsg));
  }

  async userContinueTalk(userPrompt: string) {
    await this.talk(extendUserContinuePrompt(userPrompt));
  }
}