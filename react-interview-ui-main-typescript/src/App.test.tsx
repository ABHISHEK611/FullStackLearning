import { render } from '@testing-library/react'
import App from './App'

import WidgetList from './components/WidgetList'

jest.mock('./components/WidgetList')

describe('App', () => {
  it('renders WidgetList', () => {
    render(<App />)

    expect(WidgetList).toHaveBeenCalled()
  })
})
