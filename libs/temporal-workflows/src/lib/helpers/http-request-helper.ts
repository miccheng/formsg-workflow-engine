import axios from 'axios';

export const postRequest = async (url: string, data: any): Promise<any> => {
  const response = await axios.post(url, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};
