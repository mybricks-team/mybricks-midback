import servicePlugin, {
  call as callConnectorHttp,
  mock as connectorHttpMock,
} from '@mybricks/plugin-connector-http'


const getPlugins = () => {
  return [
    servicePlugin({
      // isPrivatization: 
    }),
  ]
}

export default getPlugins