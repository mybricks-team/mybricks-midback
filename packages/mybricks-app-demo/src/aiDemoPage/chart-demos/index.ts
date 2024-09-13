export default [
  {
    title: '多 X 轴',
    image: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAQEBAQEBAQEBAQGBgUGBggHBwcHCAwJCQkJCQwTDA4MDA4MExEUEA8QFBEeFxUVFx4iHRsdIiolJSo0MjRERFwBBAQEBAQEBAQEBAYGBQYGCAcHBwcIDAkJCQkJDBMMDgwMDgwTERQQDxAUER4XFRUXHiIdGx0iKiUlKjQyNEREXP/CABEIAOEBLAMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAgQFAQMI/9oACAEBAAAAAPuYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAByJ2QAAAAHJ3LEuRqU5AAAADl62BHN8wAAAEdKwAczfIAAAC1ecrV1myOY0gAAAjs9Z9cemn0o1QAAA9dN5ZgL9khkSAAAFy4rUAe2kMSYAAA0LCtQBY0BjdAAAF+yhlAvLPWJMAAAe2k5m+Qa3lV0IZMgAABHZ65m+Q9L/AHtKuAAACzfOeVfnrZ6jjyAAABHRsgHMgAAAAjcu9B5ZgAAAAF309Vet4SAAAAAR4mAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//EABQBAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/xAA2EAACAQIDBQQIBQUAAAAAAAABAgMAEQQSMSAhQEFREBMycQUUIjBCYYGRIzNDULFSYnCAof/aAAgBAQABPwD/ACdcDU0XXrWccgazjoaDqef7AWC6mkgmmsQMinmajwMQ8V389woRxr4UA7CAdRT4XDP8Av1XdT4BgC0D3A1DUSyNlkUg8aSSQiC7GoMIqWeSzP8A8HuHjjkBVxep8M+GN97RE+LpxbHQKLkmsNAIRc2Mh1PuiAQQRWKw/qsnsm8ZO75fI8VgY9/rDDqE7SQASakxQFxGt/maM8xPit5C1esTD9Q1HjnG5xcdRrSsHAZTu2JEEiFGG41Zo3eJ9VNuIILlY11YgUqhFCLuAA7Z5jISAfYGzFI0TXH1FKwZQy8xfYx8YBSZdL5TxGEXPiC3JV/ntxT5Y8o1bbwUjXaIc9+xNH3kMqWucppDdRw/o/wzk82At5duPsJEUcl24CRKv1Gyoyl0HJiOH9Hsow8qnUyH+B2+kLGRCOltvCrmnjH12TYyzkad4388P6LcKcQh6g9uKTPDmUWCnbwqbi557hUk88bC9svK2lRyCRAw3crdqG5ZupJ4fBOI8Wt9GBGxNGYnI5cjtREGNMp5AVi2Hd2OuYWqGcxAra6k3NKwZQynUViXEcErc7ZR5mlFlHDtcZXXVSCPMVE4eNXX4h2yIJAVOnI1LC8R3jdyI02Y2kBtGTf5VHDvzynM/wBxU8UbKcqjMATcbtKgQrEAdx18qxsmZ44R8PtN5nicDP3LmF/CxupPI89ggEEGpMLGT+GxFeqS78tjQwkxBNhS4Tm7/akjSPwgdssggjLv9B1oXJZ3N2JuTxLAGsNie8URSm0g0P8AUPdO6xqzsbAVJI0752FlHhHQcWQDUGMy+xiPow5+dAggEHblxEcPiPtclGtO7zMGk0Gi8aRekaWL8pyBzHI0vpJifx4939ulLisO36oHmDQniOkifehPh495lUn5Gmx0Q8N28qfFTyXCgIPuaC6k3J/YSoNd2vSsi9KAHT/Rz//EABQRAQAAAAAAAAAAAAAAAAAAAID/2gAIAQIBAT8ADv8A/8QAFBEBAAAAAAAAAAAAAAAAAAAAgP/aAAgBAwEBPwAO/wD/2Q==`,
    code: `const colors = ['#5470C6', '#EE6666'];
option = {
  color: colors,
  tooltip: {
    trigger: 'none',
    axisPointer: {
      type: 'cross'
    }
  },
  legend: {},
  grid: {
    top: 70,
    bottom: 50
  },
  xAxis: [
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        onZero: false,
        lineStyle: {
          color: colors[1]
        }
      },
      axisPointer: {
        label: {
          formatter: function (params) {
            return (
              'Precipitation  ' +
              params.value +
              (params.seriesData.length ? '：' + params.seriesData[0].data : '')
            );
          }
        }
      },
      // prettier-ignore
      data: ['2016-1', '2016-2', '2016-3', '2016-4', '2016-5', '2016-6', '2016-7', '2016-8', '2016-9', '2016-10', '2016-11', '2016-12']
    },
    {
      type: 'category',
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        onZero: false,
        lineStyle: {
          color: colors[0]
        }
      },
      axisPointer: {
        label: {
          formatter: function (params) {
            return (
              'Precipitation  ' +
              params.value +
              (params.seriesData.length ? '：' + params.seriesData[0].data : '')
            );
          }
        }
      },
      // prettier-ignore
      data: ['2015-1', '2015-2', '2015-3', '2015-4', '2015-5', '2015-6', '2015-7', '2015-8', '2015-9', '2015-10', '2015-11', '2015-12']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: 'Precipitation(2015)',
      type: 'line',
      xAxisIndex: 1,
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      data: [
        2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
      ]
    },
    {
      name: 'Precipitation(2016)',
      type: 'line',
      smooth: true,
      emphasis: {
        focus: 'series'
      },
      data: [
        3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7
      ]
    }
  ]
};`
  },
  {
    title: '折柱混合',
    image: `https://echarts.apache.org/examples/data/thumb/mix-line-bar.webp?_v_=1724900876815`,
    code: `option = {
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      crossStyle: {
        color: '#999'
      }
    }
  },
  toolbox: {
    feature: {
      dataView: { show: true, readOnly: false },
      magicType: { show: true, type: ['line', 'bar'] },
      restore: { show: true },
      saveAsImage: { show: true }
    }
  },
  legend: {
    data: ['Evaporation', 'Precipitation', 'Temperature']
  },
  xAxis: [
    {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisPointer: {
        type: 'shadow'
      }
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: 'Precipitation',
      min: 0,
      max: 250,
      interval: 50,
      axisLabel: {
        formatter: '{value} ml'
      }
    },
    {
      type: 'value',
      name: 'Temperature',
      min: 0,
      max: 25,
      interval: 5,
      axisLabel: {
        formatter: '{value} °C'
      }
    }
  ],
  series: [
    {
      name: 'Evaporation',
      type: 'bar',
      tooltip: {
        valueFormatter: function (value) {
          return value + ' ml';
        }
      },
      data: [
        2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3
      ]
    },
    {
      name: 'Precipitation',
      type: 'bar',
      tooltip: {
        valueFormatter: function (value) {
          return value + ' ml';
        }
      },
      data: [
        2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
      ]
    },
    {
      name: 'Temperature',
      type: 'line',
      yAxisIndex: 1,
      tooltip: {
        valueFormatter: function (value) {
          return value + ' °C';
        }
      },
      data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
    }
  ]
};`
  }
]