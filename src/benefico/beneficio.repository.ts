import { Repository } from "../shared/repository.js";
import { beneficio as Beneficio } from "./beneficio.entity.js";
import { db } from "../shared/db/conn.js";
import { ObjectId } from "mongodb";

const beneficios = db.collection<Beneficio>("beneficios");

export class BeneficioRepository implements Repository<Beneficio> {
    public async findAll(): Promise<Beneficio[] | undefined> {
        return await beneficios.find().toArray();
    }
    public async findOne(params: { id: string }): Promise<Beneficio | undefined> {
        const _id = new ObjectId(params.id);
        return (await beneficios.findOne({ _id })) || undefined;
    }
    public async add(beneficio: Beneficio): Promise<Beneficio | undefined> {
        (await beneficios.insertOne(beneficio)).insertedId;
        return beneficio;
    }
    public async update(beneficio: Beneficio): Promise<Beneficio | undefined> {
        const { id, ...beneficioInput } = beneficio;
        const _id = new ObjectId(beneficio.id);
        return (
            (await beneficios.findOneAndUpdate(
                { _id },
                { $set: beneficioInput },
                { returnDocument: "after" }
            )) || undefined
        ) as any;
    }
    public async delete(params: { id: string }): Promise<Beneficio | undefined> {
        const _id = new ObjectId(params.id);
        return (await beneficios.findOneAndDelete({ _id })) || undefined;
    }
}

