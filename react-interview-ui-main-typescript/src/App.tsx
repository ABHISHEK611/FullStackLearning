import React from 'react'
import './App.css'
import Stack from '@mui/material/Stack'

import WidgetList from './components/WidgetList'

const App = (): JSX.Element => {
  return (<Stack>
    <WidgetList></WidgetList>
  </Stack>)
}

export default App
