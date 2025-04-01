import axios from 'axios'
import { mocked } from 'jest-mock'

import { fetchAllWidgets, Widget } from './apiConnect'

jest.mock('axios')

describe('fetchAllWidgets', () => {
  it('returns response data', async () => {
    const widgetList: Widget[] = [{ description: 'Keeps a diary',  name: 'Widget Jones', price: 9.95 }]
    mocked(axios).get.mockResolvedValueOnce({ data: widgetList })

    const result = await fetchAllWidgets()

    expect(result).toEqual(widgetList)
  })

  it('errors on reject', async () => {
    mocked(axios).get.mockRejectedValueOnce({})

    expect(fetchAllWidgets()).rejects.toBeTruthy()
  })
})
