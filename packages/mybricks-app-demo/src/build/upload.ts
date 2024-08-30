import axios from 'axios';

const domain = 'https://my.mybricks.world/central/api';

const namespace = 'mybricks.ai-component.test';
export default async function upload(rawJs: string, version: string) {
  const component = shapeComponent(rawJs, version);
  const res = await publishToCentral(component);
  return res
}

const shapeComponent = (rawJs: string, version = '1.0.0') => {
  const component = {
    title: 'AI生成的组件',
    namespace,
    version,
    description: 'AI生成的组件',
    data: {},
    input: [],
    output: [],
    editors: '() => ({})',
    upgrade: '',
    runtime: encodeURIComponent(`(function(){${rawJs} return MybricksComDef;})()`),
    deps: []
  }

  return {
    sceneType: 'PC', // PC
    name: component.title,
    content: JSON.stringify(component),
    tags: ['react'],
    namespace: component.namespace,
    version: component.version,
    description: component.description,
    type: `component`, // com_lib
    icon: '',
    previewImg: '',
    creatorName: 'AI',
    creatorId: 24
  }
}

async function publishToCentral({
  sceneType, // PC
  name,
  content,
  tags, // ['react']
  namespace,
  version,
  description,
  type, // com_lib
  icon,
  previewImg,
  creatorName,
  creatorId
}) {
  try {
    const res = await axios({
      method: 'post',
      url: domain + '/channel/gateway',
      data: {
        action: 'material_publishVersion',
        payload: {
          namespace,
          version,
          description,
          type,
          icon,
          scene_type: sceneType,
          name,
          content,
          tags,
          preview_img: previewImg,
          creator_name: creatorName,
          creator_id: creatorId,
        }
      }
    });
    console.log(`${namespace}@${version}: `, res);
    const { code, message } = res.data;

    return { code, message }
  } catch (err) {
    throw new Error(err);
  }
}

export const getComponentVersion = async (keyword: string) => {
  const res = await axios({
    method: 'get',
    url: `https://my.mybricks.world/mybricks-material/api/material/list?pageSize=50&page=1&keyword=${encodeURIComponent(keyword)}&scopeStatus=&type=component&tags=react&scene=&userId=24`,
  })
  console.log(`res`, res)
  if (res.data.data.list[0].namespace === namespace) {
    return res.data.data.list[0].version
  }
  return '1.0.1';
}