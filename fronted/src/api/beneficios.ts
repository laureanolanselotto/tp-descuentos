import instance from './axios'; 

const getBeneficios = () => instance.get(`/beneficios`);

export { getBeneficios };