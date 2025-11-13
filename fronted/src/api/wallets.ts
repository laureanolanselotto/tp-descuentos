import instance from './axios'; 

const getWallets = () => instance.get(`/wallets`);

const getWalletById = (id: string) => instance.get(`/wallets/${id}`);

const createWallet = (data: Record<string, unknown>) => instance.post(`/wallets`, data);

const updateWallet = (id: string, data: Record<string, unknown>) => instance.patch(`/wallets/${id}`, data);

const deleteWallet = (id: string) => instance.delete(`/wallets/${id}`);

export { getWallets, getWalletById, createWallet, updateWallet, deleteWallet };
