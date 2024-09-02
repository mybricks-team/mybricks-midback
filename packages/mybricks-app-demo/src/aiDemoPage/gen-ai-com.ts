import axios from "axios";

// const userPrompt = `开发一个可编辑的任务列表，用户可以添加、删除和修改任务。每个任务应有截止日期和优先级标记，并且可以拖拽排序。`
// const userPrompt = `展示一个班级的多个学生成绩随时间变化的折线图，需要展示横纵坐标。每根折线鼠标移动上去会显示学习的姓名等信息`
// “开发一个可过滤的产品列表，用户可以通过输入关键词或选择类别来筛选产品。每个产品项点击后能展开显示更多详情。”
// 用甘特图来规划软件开发过程中的迭代周期、任务分配和测试时间等。

function getQuestion(userPrompt: string) {
  return `你是一名专业的前端开发人员。你来完成用户的需求。
开发一个 React 组件。
基础要求：
1. 组件只包含 index.tsx 和 index.less 两个文件
2. 类型、常量等都定义在 index.tsx 文件中，不要额外增加文件
3. 对于用户需求，尽量使用最受欢迎的三方库来实现，可以使用高级一些的库，而不是基础库
  a. 如用户需要拖拽功能，不要直接用拖拽库实现，而是直接使用已经带有拖拽功能的相关三方组件
  b. 如果用户要某个图表，不要自己用 canvas 画出来，而是直接使用相关的三方图表组件
4. 不接受入参，所有需要的数据都在组件内部管理、模拟
5. 请确保代码有良好的注释，并且处理可能的错误情况
6. 不要省略任何代码
7. 不要假设存在什么组件，保证代码可运行
8. 展示的文案使用中文

按照指定格式返回代码，不要省略任何代码
返回格式:
\`\`\`
<filename>index.tsx</filename>
<code>
  xxx
</code>

<filename>index.less</filename>
<code>
  xxx
</code>

<deps>["依赖组件1@1.0.0", "依赖组件2@3.0.0"]</deps>
\`\`\`
只需要按照指定返回格式返回 index.tsx、index.less 的代码和依赖组件列表，不要其他信息

下面是用户需求:
\`\`\` 
${userPrompt}
\`\`\`
`
}

// const model = "anthropic/claude-3.5-sonnet:beta";
// const model = "deepseek/deepseek-coder";
const model = "openai/gpt-4o-mini-2024-07-18";
// const model = "gryphe/mythomax-l2-13b";

export default async function (userPrompt: string) {
  const q = getQuestion(userPrompt);

  // 计时
  const startTime = Date.now();

  const messages = [] as { role: string, content: string }[];
  messages.push({ role: 'user', content: q });

  console.log('开始询问');
  const res1 = await axios.post("https://ai.mybricks.world/code", {
    "model": model,
    "messages": messages,
  });
  const data = res1.data;
  console.log('询问结果', data);
  messages.push({ role: 'assistant', content: data.choices[0].message.content });

  console.log(`messages JD==> `, messages);

  const endTime = Date.now();
  console.log(`总耗时: ${endTime - startTime}ms`);

  const output = data.choices[0].message.content;

  const filenamePattern = /<filename>(.*?)<\/filename>/g;
  const codePattern = /<code>(.*?)<\/code>/gs;
  const depsPattern = /<deps>(.*?)<\/deps>/gs;

  let match;
  const filenames = [] as string[];
  const codes = [] as string[];

  while ((match = filenamePattern.exec(output)) !== null) {
    filenames.push(match[1]);
  }

  while ((match = codePattern.exec(output)) !== null) {
    codes.push(match[1]);
  }

  const res = {} as { "index.tsx": string, "index.less": string, "deps": string[] };
  if ((match = depsPattern.exec(output)) !== null) {
    try {
      res.deps = JSON.parse(match[1]);
    } catch (e) {
      res.deps = [];
      console.error('deps 解析失败', e);
    }
  }

  for (let i = 0; i < filenames.length; i++) {
    const filename = filenames[i];
    const code = codes[i];
    res[filename] = code;
  }



  return res as { "index.tsx": string, "index.less": string, "deps": string[] };
}