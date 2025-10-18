import instance from './axios'; 
import { z } from 'zod'

const getWallets = () => instance.get(`/wallets`);