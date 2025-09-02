import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3333/',
});

export async function doGet(url: string) {
  try {
    const response = await apiClient.get(url);
    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    throw new Error('Erro ao buscar os dados');
  }
}

export async function doPost(url: string, data: any) {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.msg || 'Erro inesperado ao tentar criar o produto.';
  }
}

export async function doDelete(url: string) {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.msg || 'Erro ao deletar.';
  }
}

export async function doUpdate(url: string, data: any) {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.msg || 'Erro inesperado ao tentar atualizar o recurso.';
  }
}
