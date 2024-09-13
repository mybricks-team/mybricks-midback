import React from "react";
import { message, Modal, Select } from "antd";
import ChartDemos from  "./chart-demos";

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
  console.log(`response JD==> `,response);
  const output = response.choices[0].message.content;
  console.log(`output JD==> `,output);

  return extractJSON(output)[0] as { type: '图表' | '表格', keywords: string[] };
}

async function extendUserFirstPrompt(userPrompt: string, userDemo: string) {
  return `你是一个专业的Web开发人员，专门从事组件开发。
          根据用户需求使用 echarts 组件库实现图表组件
          组件应该只有 index.jsx 文件的代码，不要出现任何其他文件，不要从相对路径引入任何内容。
          组件代码遵循最佳实践和代码规范。
          不要假设组件可以从外部获取任何数据，所有必需的数据都应该包含在生成的代码中。

          在生成代码前，请先回答以下问题
          1. 用户需求里要展示哪些数据，并预估真实情况下最可能的数据范围。
          2. 每种数据分别最适合使用那种单位。
          3. 每种数据分别最适合用那种图表展示。

          以下是用户选择的Demo示例：
          ####
          ${userDemo}
          ####

          以下是用户需求：
          ####
          ${userPrompt}
          ####

          请确保生成的代码是 jsx 且可运行。`
}

function extendUserContinuePrompt(userPrompt: string) {
  return `
    ${userPrompt}

    请返回修改后的 jsx 代码
  `
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

    this.messages.push({ role: 'user', content: prompt })

    console.log('开始询问');
    const response = await postAI({ messages: this.messages });
    console.log('询问结果', response);

    const endTime = Date.now();
    console.log(`总耗时: ${endTime - startTime}ms`);

    const output = response.choices[0].message.content;

    this.messages.push({ role: 'assistant', content: output })

    try {
      console.log(`output JD==> `, output);

      const componentCode = extractJSX(output);
      this.resultComponent = {
        "index.jsx": componentCode[0],
        "index.less": "",
        "deps": ["echarts-for-react", "echarts"]
      };
    } catch (e) {
      console.error('解析失败', e);
    }
  }

  constructor() { }

  async initGenerateComponent(userPrompt: string) {
    // const { type } = await analysisUserFirstPrompt(userPrompt);
    const type = '图表';
    if (type !== '图表') {
      message.warning(`您可能想要生成${type}，但是当前只支持生成图表组件`);
      return;
    }

    const userDemo = await getUserDemo();

    const firstPrompt = await extendUserFirstPrompt(userPrompt, userDemo);
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

async function getUserDemo(): Promise<string> {
  return await new Promise((resolve) => {
    let selectedDemo = '';

    Modal.confirm({
      title: '推测您想要生成图表，请选择和预期相近的图表样式',
      width: 1200,
      content: (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {ChartDemos.map((demo, index) => (
            <div 
              key={index} 
              style={{ 
                cursor: 'pointer', 
                border: '2px solid transparent',
                padding: '5px',
                borderRadius: '5px'
              }}
              onClick={() => {
                selectedDemo = demo.code;
                // @ts-ignore
                document.querySelectorAll('.chart-demo-item').forEach(el => el.style.border = '2px solid transparent');
                // @ts-ignore
                document.getElementById(`chart-demo-${index}`).style.border = '2px solid #1890ff';
              }}
            >
              <img 
                id={`chart-demo-${index}`}
                className="chart-demo-item"
                src={demo.image} 
                alt={demo.title} 
                style={{ width: '240px', height: '172px', objectFit: 'cover' }} 
              />
              <p style={{ textAlign: 'center', marginTop: '5px' }}>{demo.title}</p>
            </div>
          ))}
        </div>
      ),
      onOk: () => {
        if (selectedDemo) {
          resolve(selectedDemo);
        } else {
          message.warning('请选择一个图表类型');
          return Promise.reject();
        }
      },
      onCancel: () => {
        resolve('');
      },
    });
  });
}
