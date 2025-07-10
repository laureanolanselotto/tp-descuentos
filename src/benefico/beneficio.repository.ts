
import { BeneficioRepository } from "../shared/repository.js";
import { Beneficio } from "./beneficio.entity.js";

const beneficios = [
    new Beneficio(
        'descuento10',
        15,
        'Descuento válido para compras superiores a $1000',
        '2024-01-01',
        '2024-12-31',
        ['tarjeta', 'qr','tajeta de credito'],
        'sin tope',
        '12345678-1234-1234-1234-123456789012'
    ),
];

export class BeneficioRepository implements Repository<Beneficio> {
    public findAll(): Beneficio[] | undefined {
        return beneficios;
    }
    public findOne(params: { id: string }): Beneficio | undefined {
        return beneficios.find((beneficio) => beneficio.id === params.id);
    }
    public add(beneficio: Beneficio): Beneficio | undefined {
        beneficios.push(beneficio);
        return beneficio;
    }
    public update(beneficio: Beneficio): Beneficio | undefined {
        const index = beneficios.findIndex((b) => b.id === beneficio.id);
        if (index !== -1) {
            beneficios[index] = { ...beneficios[index], ...beneficio };
            return beneficios[index];
        }
        return undefined;
    }
    public delete(params: { id: string }): Beneficio | undefined {
        const index = beneficios.findIndex((b) => b.id === params.id);
        if (index !== -1) {
            const deleted = beneficios[index];
            beneficios.splice(index, 1);
            return deleted;
        }
        return undefined;
    }
}
