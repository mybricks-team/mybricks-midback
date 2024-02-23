// import {render} from 'react-dom'
import ReactDOM from 'react-dom'

import App from "./App";

// render(
//   <MyApp/>, document.querySelector('#root')
// )

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(<MyApp/>)

function MyApp() {
  return (
    <App/>
  )
}