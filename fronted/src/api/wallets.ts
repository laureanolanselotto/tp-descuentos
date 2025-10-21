import instance from './axios'; 

const getWallets = () => instance.get(`/wallets`);


export { getWallets };
