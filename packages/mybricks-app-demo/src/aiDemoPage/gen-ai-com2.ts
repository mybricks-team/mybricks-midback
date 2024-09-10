import axios from "axios";

// const MODEL = "openai/gpt-4o";
const MODEL = "openai/gpt-4o-mini";
// const MODEL = "openai/gpt-4o-mini-2024-07-18";
const CODE_FORMAT_PROMPT = `按指定格式返回代码，不要省略任何代码
返回格式：
\`\`\`
{
"index.tsx":"xxx",
"index.less":"xxx",
"deps":["dependency1", "dependency2"]
}
\`\`\``;

const SYSTEM_PROMPT = `
你是一个专业的Web开发人员，专门从事组件开发。
你的工作是接受模糊的需求，然后将需求转化为使用TypeScript编写的组件代码。
组件应该只包含 index.tsx 和 index.less 文件的代码，并且不要包含任何其他文件。
组件代码遵循最佳实践和代码规范。
不要假设组件可以从外部获取任何数据，所有必需的数据都应该包含在生成的代码中。

为了风格统一，表单、表格、按钮等基础组件建议使用 antd 组件库，不要使用原生HTML标签。
图表组件建议使用 @antv/g2 组件库。

请确保生成的代码是可运行的。
`

const getContinueTalkSystemPrompt = (codes: string, userMessages: string) => `
你是一个专业的Web开发人员，专门从事组件开发。
你的工作是维护一个组件的代码，满足用户提过来的需求。
组件应该只包含 index.tsx 和 index.less 文件的代码，并且不要包含任何其他文件。
组件代码遵循最佳实践和代码规范。
不要假设组件可以从外部获取任何数据，所有必需的数据都应该包含在生成的代码中。
你现在在维护一个组件的代码，代码如下:
\`\`\`
${codes}
\`\`\`

前面为了生成这段代码使用的指令如下(作为参考):
\`\`\`
${userMessages}
\`\`\`

请根据用户的反馈或者新需求修改代码，满足用户。
`

function getGenerateComponentQuestion(userPrompt) {
  return `需求描述：
${userPrompt}

在生成代码之前，请确保你已经识别出所有可能用到的组件。
当你识别到所有组件后，请立即调用我提供的 \`getDocs(keywords)\` 函数来搜索这些组件的文档，其中 \`keywords\` 是搜索这些组件的关键词或者短语的列表。
请优先使用更详细的关键词，如 '表格'、'按钮' 等，而不是库名如 'antd'。
例如，如果你需要搜索表格组件，请使用 '表格' 作为关键词，而不是 'antd'。
再例如，如果你需要搜索颜色选择器组件，请使用 '颜色选择器' 作为关键词，而不是 'react-color'。
再例如，如果你需要搜索二维码组件，请使用 '二维码' 作为关键词，而不是 'qrcode.react'。
关键词的详细性非常重要，因为它直接影响文档搜索的准确性。
在调用 \`getDocs(keywords)\` 函数之前，请确认并展示你将要使用的关键词。
例如，如果你使用 'antd' 作为关键词，可能会导致搜索结果不准确，因为 'antd' 是一个库名，而不是具体的组件。

务必确保你已经识别出所有可能用到的组件，包括表单相关的、展示相关的、交互相关的等等！
如果有弹窗、抽屉，弹窗、抽屉里面可能用的组件也要识别出来！

只能调用一次 \`getDocs(keywords)\`，不要多次调用。

${CODE_FORMAT_PROMPT}`;
}

const tools = {
  // 判断数组中是否包含某个字符串
  partialOrIncludes(strArr, keywords) {
    const allStr = strArr.join(', ');

    for (const keyword of keywords) {
      if (allStr.includes(keyword)) return true;
    }
    return false;
  },
  // 判断数组中是否包含某个字符串
  partialAndIncludes(strArr, keywords) {
    const allStr = strArr.join(', ');

    for (const keyword of keywords) {
      if (!allStr.includes(keyword)) return false;
    }
    return true;
  }
}

function getDocs(keywords) {
  console.log(`获取以下关键词相关文档: ${keywords.join(', ')}`);

  const docsArr = [] as string[];

  if (tools.partialOrIncludes(keywords, ["二维码", "qrcode"])) {
    docsArr.push(`## Usage

\`qrcode.react\` exports two components, supporting rendering as SVG or Canvas. SVG is generally recommended as it is more flexible, but Canvas may be preferable.

All examples are shown using modern JavaScript modules and syntax. CommonJS \`require('qrcode.react')\` is also supported.

### \`QRCodeSVG\`

\`\`\`js
import ReactDOM from 'react-dom';
import {QRCodeSVG} from 'qrcode.react';

ReactDOM.render(
  <QRCodeSVG value="https://reactjs.org/" />,
  document.getElementById('mountNode')
);
\`\`\`

### \`QRCodeCanvas\`

\`\`\`js
import ReactDOM from 'react-dom';
import {QRCodeCanvas} from 'qrcode.react';

ReactDOM.render(
  <QRCodeCanvas value="https://reactjs.org/" />,
  document.getElementById('mountNode')
);
\`\`\`

## Available Props

Below is a condensed type definition of the props \`QRCodeSVG\` and \`QRCodeCanvas\` accept.

\`\`\`ts
type QRProps = {
  /**
   * The value to encode into the QR Code.
   */
  value: string;
  /**
   * The size, in pixels, to render the QR Code.
   * @defaultValue 128
   */
  size?: number;
  /**
   * The Error Correction Level to use.
   * @see https://www.qrcode.com/en/about/error_correction.html
   * @defaultValue L
   */
  level?: 'L' | 'M' | 'Q' | 'H';
  /**
   * The background color used to render the QR Code.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
   * @defaultValue #FFFFFF
   */
  bgColor?: string;
  /**
   * The foregtound color used to render the QR Code.
   * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color_value
   * @defaultValue #000000
   */
  fgColor?: string;
  /**
   * Whether or not a margin of 4 modules should be rendered as a part of the
   * QR Code.
   * @deprecated Use \`marginSize\` instead.
   * @defaultValue false
   */
  includeMargin?: boolean;
  /**
   * The number of _modules_ to use for margin. The QR Code specification
   * requires \`4\`, however you can specify any number. Values will be turned to
   * integers with \`Math.floor\`. Overrides \`includeMargin\` when both are specified.
   * @defaultValue 0
   */
  marginSize?: number;
  /**
   * The title to assign to the QR Code. Used for accessibility reasons.
   */
  title?: string;
  /**
   * The minimum version used when encoding the QR Code. Valid values are 1-40
   * with higher values resulting in more complex QR Codes. The optimal
   * (lowest) version is determined for the \`value\` provided, using \`minVersion\`
   * as the lower bound.
   * @defaultValue 1
   */
  minVersion?: number;
  /**
   * The settings for the embedded image.
   */
  imageSettings?: {
    /**
     * The URI of the embedded image.
     */
    src: string;
    /**
     * The height, in pixels, of the image.
     */
    height: number;
    /**
     * The width, in pixels, of the image.
     */
    width: number;
    /**
     * Whether or not to "excavate" the modules around the embedded image. This
     * means that any modules the embedded image overlaps will use the background
     * color.
     */
    excavate: boolean;
    /**
     * The horiztonal offset of the embedded image, starting from the top left corner.
     * Will center if not specified.
     */
    x?: number;
    /**
     * The vertical offset of the embedded image, starting from the top left corner.
     * Will center if not specified.
     */
    y?: number;
    /**
     * The opacity of the embedded image in the range of 0-1.
     * @defaultValue 1
     */
    opacity?: number;
    /**
     * The cross-origin value to use when loading the image. This is used to
     * ensure compatibility with CORS, particularly when extracting image data
     * from QRCodeCanvas.
     * Note: \`undefined\` is treated differently than the seemingly equivalent
     * empty string. This is intended to align with HTML behavior where omitting
     * the attribute behaves differently than the empty string.
     */
    crossOrigin?: 'anonymous' | 'use-credentials' | '' | undefined;
  };
};
\`\`\`
`);
  }

  if (tools.partialOrIncludes(keywords, ["折线图"])) {
    docsArr.push(`## Usage
    \`\`\`JSX
    import { Chart } from '@antv/g2';

const data = [
  { year: '1991', value: 3 },
  { year: '1992', value: 4 },
  { year: '1993', value: 3.5 },
  { year: '1994', value: 5 },
  { year: '1995', value: 4.9 },
  { year: '1996', value: 6 },
  { year: '1997', value: 7 },
  { year: '1998', value: 9 },
  { year: '1999', value: 13 },
];

const chart = new Chart({
  container: 'container',
  autoFit: true,
});

chart
  .data(data)
  .encode('x', 'year')
  .encode('y', 'value')
  .scale('x', {
    range: [0, 1],
  })
  .scale('y', {
    domainMin: 0,
    nice: true,
  });

chart.line().label({
  text: 'value',
  style: {
    dx: -10,
    dy: -12,
  },
});

chart.point().style('fill', 'white').tooltip(false);

chart.render();
    \`\`\`
    `)
  }

  if (tools.partialAndIncludes(keywords, ["表格", "拖拽"])) {

    docsArr.push(`
    ## 拖拽表格参考代码
    \`\`\`jsx
    import React, { useState } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Table } from 'antd';
const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Age',
    dataIndex: 'age',
  },
  {
    title: 'Address',
    dataIndex: 'address',
  },
];
const Row = (props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  });
  const style = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging
      ? {
          position: 'relative',
          zIndex: 9999,
        }
      : {}),
  };
  return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
};
const App = () => {
  const [dataSource, setDataSource] = useState([
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address:
        'Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text',
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    },
  ]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 1,
      },
    }),
  );
  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setDataSource((prev) => {
        const activeIndex = prev.findIndex((i) => i.key === active.id);
        const overIndex = prev.findIndex((i) => i.key === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };
  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={dataSource.map((i) => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          components={{
            body: {
              row: Row,
            },
          }}
          rowKey="key"
          columns={columns}
          dataSource={dataSource}
        />
      </SortableContext>
    </DndContext>
  );
};
export default App;
    \`\`\`
    `);
  }

  if (tools.partialOrIncludes(keywords, ['词云'])) {
    return `# Simple usage

Download the latest \`wordcloud2.js\` file from the \`src\` folder in this repository.

Load \`wordcloud2.js\` script to the web page, and run:

    WordCloud(document.getElementById('my_canvas'), { list: list } );

where \`list\` is an array that look like this: \`[['foo', 12], ['bar', 6]]\`.

## Demo
\`\`\`TSX
import React, { useEffect, useRef } from 'react';
import WordCloud from 'wordcloud';

const WordCloudComponent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      WordCloud(canvasRef.current, {
        "gridSize": 8,
        "weightFactor": 16,
        "fontFamily": "Hiragino Mincho Pro, serif",
        "color": "random-dark",
        "backgroundColor": "#f0f0f0",
        "rotateRatio": 0,
        "list": [
          ['人工', 6],
          ['商家', 3],
          ['运费', 3],
          ['退款', 2],
          ['发货', 2],
          ['解决', 1],
          ['售后', 1],
        ]
      });
    }

    return () => {
      WordCloud.stop();
    };
  }, []);

  return <canvas ref={canvasRef} className='word-cloud-canvas' width={600} height={400} />;
};

export default WordCloudComponent;
\`\`\`

# wordcloud2.js APIs

## Feature detection

    WordCloud.isSupported

will evaluates to \`false\` if the browser doesn't supply necessary functionalities for wordcloud2.js to run.

## Minimum font size

Some browsers come with restrictions on minimum font size preference on, and the preference will also impact canvas.
wordcloud2.js works around it by scaling the canvas, but you may be interested to know value of the preference. The value detected is accessible at

	WordCloud.minFontSize

## Stop the renderring

Sometimes we need to stop wordcloud2.js renderring, to optimize the component renderring performance, especially in some FE libraries like 'React'.
In this scenario, you can just call the function below

	WordCloud.stop

\`\`\`js
useEffect(() => {
  ...
  return () => {
    // stop the renderring
    WordCloud.stop();
  };
}, [deps]);
\`\`\`

## Usage

    WordCloud(elements, options);

\`elements\` is the DOM Element of the canvas, i.e. \`document.getElementById('my_canvas')\` or \`$('#my_canvas')[0]\` in jQuery.
It can be also an array of DOM Elements. If a \`<canvas>\` element is passed, Word Cloud would generate an image on it; if it's some other element, Word Cloud would create \`<span>\` elements and fill it.

Depend on the application, you may want to create an image (high fidelity but interaction is limited) or create the "cloud" with DOM to do further styling.

## Option

Available options as the property of the \`options\` object are:

### Presentation

* \`list\`: List of words/text to paint on the canvas in a 2-d array, in the form of \`[word, size]\`.
	* e.g. \`[['foo', 12], ['bar', 6]]\`
	* Optionally, you can send additional data as array elements, in the form of \`[word, size, data1, data2, ... ]\` which can then be used in the callback functions of \`click\`, \`hover\` interactions and fontWeight, color and classes callbacks.
	* e.g. \`[['foo', 12, 'http://google.com?q=foo'], ['bar', 6, 'http://google.com?q=bar']]\`. 
* \`fontFamily\`: font to use.
* \`fontWeight\`: font weight to use, can be, as an example, \`normal\`, \`bold\` or \`600\` or a \`callback(word, weight, fontSize, extraData)\` specifies different font-weight for each item in the list. 
* \`color\`: color of the text, can be any CSS color, or a \`callback(word, weight, fontSize, distance, theta)\` specifies different color for each item in the list.
  You may also specify colors with built-in keywords: \`random-dark\` and \`random-light\`. If this is a DOM cloud, color can also be \`null\` to disable hardcoding of
  color into span elements (allowing you to customize at the class level).
* \`classes\`: for DOM clouds, allows the user to define the class of the span elements. Can be a normal class string,
  applying the same class to every span or a \`callback(word, weight, fontSize, extraData)\` for per-span class definition.
  In canvas clouds or if equals \`null\`, this option has no effect.
* \`minSize\`: minimum font size to draw on the canvas.
* \`weightFactor\`: function to call or number to multiply for \`size\` of each word in the list.
* \`clearCanvas\`: paint the entire canvas with background color and consider it empty before start.
* \`backgroundColor\`: color of the background.

### Dimension

* \`gridSize\`: size of the grid in pixels for marking the availability of the canvas — the larger the grid size, the bigger the gap between words.
* \`origin\`: origin of the “cloud” in \`[x, y]\`.
* \`drawOutOfBound\`: set to \`true\` to allow word being draw partly outside of the canvas. Allow word bigger than the size of the canvas to be drawn.
* \`shrinkToFit\`: set to \`true\` to shrink the word so it will fit into canvas. Best if \`drawOutOfBound\` is set to \`false\`. :warning: This word will now have lower \`weight\`.

### Mask

* \`drawMask\`: visualize the grid by draw squares to mask the drawn areas.
* \`maskColor\`: color of the mask squares.
* \`maskGapWidth\`: width of the gaps between mask squares.

### Timing

* \`wait\`: Wait for *x* milliseconds before start drawn the next item using \`setTimeout\`.
* \`abortThreshold\`: If the call with in the loop takes more than *x* milliseconds (and blocks the browser), abort immediately.
* \`abort\`: callback function to call when abort.

### Rotation

* \`minRotation\`: If the word should rotate, the minimum rotation (in rad) the text should rotate.
* \`maxRotation\`: If the word should rotate, the maximum rotation (in rad) the text should rotate. Set the two value equal to keep all text in one angle.
* \`rotationSteps\`: Force the use of a defined number of angles. Set the value equal to 2 in a -90°/90° range means just -90, 0 or 90 will be used. 

### Randomness

* \`shuffle\`: Shuffle the points to draw so the result will be different each time for the same list and settings.
* \`rotateRatio\`: Probability for the word to rotate. Set the number to 1 to always rotate.

### Shape

* \`shape\`: The shape of the "cloud" to draw. Can be any polar equation represented as a callback function, or a keyword present.
Available presents are \`circle\` (default), \`cardioid\` (apple or heart shape curve, the most known polar equation), \`diamond\`, \`square\`, \`triangle-forward\`, \`triangle\`, (alias of \`triangle-upright\`), \`pentagon\`, and \`star\`.
* \`ellipticity\`: degree of "flatness" of the shape wordcloud2.js should draw.

### Interactive

* \`hover\`: callback to call when the cursor enters or leaves a region occupied by a word. The callback will take arguments \`callback(item, dimension, event)\`, where \`event\` is the original \`mousemove\` event.
* \`click\`: callback to call when the user clicks on a word. The callback will take arguments \`callback(item, dimension, event)\`, where \`event\` is the original \`click\` event.

## Events

You can listen to those custom DOM events filed from the canvas element, instead of using callbacks for taking the appropriate action.
Cancel the first two events causes the operation to stop immediately.

* \`wordcloudstart\`
* \`wordclouddrawn\`
* \`wordcloudstop\`
* \`wordcloudabort\`

wordcloud2.js itself will stop at \`wordcloudstart\` event.`
  }

  if (tools.partialOrIncludes(keywords, ['折线图', 'lineChart'])) {
    return `import React, { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

export default class Example extends PureComponent {
  static demoUrl = 'https://codesandbox.io/p/sandbox/line-chart-width-xaxis-padding-8v7952';

  render() {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
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
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
`
  }

  return docsArr.join("\n");
}

const docsTool = {
  type: "function",
  function: {
    name: "getDocs",
    description: "搜索并获取关键词列表的相关文档",
    parameters: {
      type: "object",
      properties: {
        keywords: {
          type: "array",
          items: {
            type: "string"
          },
          description: "关键词列表"
        }
      },
      required: ["keywords"]
    }
  }
};

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
  return `前面的指令都已经执行过了，只作为参考，不要执行。
现在基于已有代码，用户给出了更多的建议
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

const model = "openai/gpt-4o-mini-2024-07-18";

export default class AIGenerate {
  messages: {
    role: string;
    content: string;
  }[] = [];

  userMessages = [] as {
    role: string;
    content: string;
  }[];

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

    this.messages = [{
      role: 'system',
      content: getContinueTalkSystemPrompt(JSON.stringify(this.resultComponent), this.userMessages.map(item=>item.content).join("\n"))
    },
    // ...this.userMessages.slice(0, -1),
    {
      role: 'user',
      content: prompt
    }]

    console.log('开始询问');
    const res1 = await axios.post("https://ai.mybricks.world/code", {
      "model": model,
      "messages": this.messages,
    });
    const data = res1.data;
    console.log('询问结果', data);

    const endTime = Date.now();
    console.log(`总耗时: ${endTime - startTime}ms`);

    const output = data.choices[0].message.content;

    try {
      const componentCode = (() => {
        let pruningOutput = output;
        if (pruningOutput.startsWith('```') && pruningOutput.endsWith('```')) {
          pruningOutput = pruningOutput.substring(3, pruningOutput.length - 3);
        }
        if (pruningOutput.startsWith("json")) {
          pruningOutput = pruningOutput.substring(4, pruningOutput.length);
        }
        try {
          return JSON.parse(pruningOutput);
        } catch (error) {
          console.error('解析 AI 返回代码失败:', error);
          return { "index.tsx": "", "index.less": "", "deps": [] };
        }
      })();
      this.resultComponent = componentCode;
    } catch (e) {
      console.error('解析失败', e);
    }
  }

  constructor() { }

  async initGenerateComponent(userPrompt: string) {
    this.userMessages.push({ role: 'user', content: userPrompt });
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: getGenerateComponentQuestion(userPrompt) }
    ] as any[];
    const startTime = Date.now();

    // 步骤1: 把生成组件代码的需求发送给 AI，并通过 function call 获取关键词
    const keywordsResponse = await axios.post("https://ai.mybricks.world/code", {
      "model": MODEL,
      "messages": messages,
      "tools": [docsTool],
      "tool_choice": "auto",
    }).then(res => res.data);
    console.log(`keywordsResponse JD==> `, keywordsResponse);
    messages.push(keywordsResponse.choices[0].message);

    // 步骤2: 基于 AI 返回的关键词，获取相关文档，再把文档发送给 AI，生成组件代码
    let componentResult;
    if (keywordsResponse.choices && keywordsResponse.choices[0].message) {
      console.log('回答 function call，获取文档给到大模型');
      const message = messages[messages.length - 1];

      if (message.tool_calls) {
        for (const call of message.tool_calls) {
          if (call.type === 'function' && call.function.name === 'getDocs') {
            const keywords = JSON.parse(call.function.arguments).keywords;
            const docs = getDocs(keywords);
            messages.push({
              role: 'tool',
              name: 'getDocs',
              tool_call_id: call.id,
              content: JSON.stringify({ docs })
            });
          }
        }
        messages.push({ role: 'user', content: CODE_FORMAT_PROMPT });
        const componentResponse = await axios.post("https://ai.mybricks.world/code", {
          "model": MODEL,
          "messages": messages,
        }).then(res => res.data);
        console.log(`componentResponse JD==> `, componentResponse);
        componentResult = componentResponse.choices[0].message.content
      } else {
        console.log("不需要调用函数，直接生成组件代码");
        const message = messages[messages.length - 1];
        componentResult = message.content;
      }
    }

    console.log(`messages JD==> `, messages);

    // 步骤3: 解析 AI 返回的组件代码，并写入文件
    const componentCode = (() => {
      let pruningOutput = componentResult;
      if (pruningOutput.startsWith('```') && pruningOutput.endsWith('```')) {
        pruningOutput = pruningOutput.substring(3, pruningOutput.length - 3);
      }
      if (pruningOutput.startsWith("json")) {
        pruningOutput = pruningOutput.substring(4, pruningOutput.length);
      }
      try {
        return JSON.parse(pruningOutput);
      } catch (error) {
        console.error('解析 AI 返回代码失败:', error);
        return { "index.tsx": "", "index.less": "", "deps": [] };
      }
    })();
    componentCode.deps = componentCode.deps.map(dep => `${dep}@latest`);

    // this.messages = messages;
    this.resultComponent = componentCode;

    const endTime = Date.now();
    console.log(`总耗时: ${endTime - startTime} 毫秒`);
  }

  async fixComponent(errorMsg: string) {
    await this.talk(getFixComponentQuestion(errorMsg));
  }

  async userContinueTalk(userPrompt: string) {
    this.userMessages.push({ role: 'user', content: userPrompt });
    await this.talk(getUserFixComponentQuestion(userPrompt));
  }
}