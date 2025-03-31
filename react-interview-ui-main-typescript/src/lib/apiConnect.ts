import axios from 'axios';

const BASE_URL = 'http://localhost:9000';

export interface Widget {
  name: string;
  description: string;
  price: number;
}

export const fetchAllWidgets = (): Promise<Widget[]> =>
  axios.get(`${BASE_URL}/v1/widgets`).then(response => response.data);

export const createWidget = (widget: Widget): Promise<Widget> =>
  axios.post(`${BASE_URL}/v1/widgets`, widget, {
    headers: {
      'Content-Type': 'application/json', // ✅ Ensures correct JSON format
    },
  }).then(response => response.data);


  export const deleteWidget = (widgetName: string): Promise<void> =>
    axios.delete(`${BASE_URL}/v1/widgets/${encodeURIComponent(widgetName)}`)
      .then(() => console.log(`Widget '${widgetName}' deleted successfully`))
      .catch((error) => {
        console.error(`Error deleting widget '${widgetName}':`, error);
        throw error;
      });

      export const updateWidget = (widgetName: string, updatedWidget: Widget): Promise<Widget> =>
        axios.put(`${BASE_URL}/v1/widgets/${encodeURIComponent(widgetName)}`, updatedWidget, {
          headers: {
            'Content-Type': 'application/json',
          },
        }).then(response => response.data);
      
        export const searchWidgetByName  = (widgetName: string): Promise<Widget> =>
          axios.get(`${BASE_URL}/v1/widgets/${encodeURIComponent(widgetName)}`)
            .then(response => response.data)
            .catch((error) => {
              console.error(`Error fetching widget '${widgetName}':`, error);
              throw error;
            });