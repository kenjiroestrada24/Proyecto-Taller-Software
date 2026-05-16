import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const getStores = async () => {
  const response = await axios.get(`${API_URL}/stores`);
  return response.data;
};

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/categories`);
  return response.data;
};

export const getStoreById = async (id: string | number) => {
  const response = await axios.get(`${API_URL}/stores/${id}`);
  return response.data;
};

export const getProductsByStore = async (storeId: string | number) => {
  const response = await axios.get(`${API_URL}/products/store/${storeId}`);
  return response.data;
};

export const createSale = async (saleData: any) => {
  const response = await axios.post(`${API_URL}/sales`, saleData);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};

export const createProduct = async (productData: any) => {
  const response = await axios.post(`${API_URL}/products`, productData);
  return response.data;
};

export const updateProduct = async (id: number, productData: any) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

export const deleteStore = async (id: number) => {
  const response = await axios.delete(`${API_URL}/stores/${id}`);
  return response.data;
};

export const createStore = async (storeData: any) => {
  const response = await axios.post(`${API_URL}/stores`, storeData);
  return response.data;
};

export const updateStore = async (id: number, storeData: any) => {
  const response = await axios.put(`${API_URL}/stores/${id}`, storeData);
  return response.data;
};

export const registerStore = async (registrationData: any) => {
    const response = await axios.post(`${API_URL}/register-store`, registrationData);
    return response.data;
};

export const login = async (credentials: any) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
};

export const getGlobalStats = async () => {
  const response = await axios.get(`${API_URL}/stats/global`);
  return response.data;
};

export const getStoreStats = async (storeId: number) => {
  const response = await axios.get(`${API_URL}/stats/store/${storeId}`);
  return response.data;
};
