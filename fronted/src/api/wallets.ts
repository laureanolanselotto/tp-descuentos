import instance from './axios'; 

const getWallets = () => instance.get(`/wallets`);

const getWalletById = (id: string) => instance.get(`/wallets/${id}`);

export { getWallets, getWalletById };
