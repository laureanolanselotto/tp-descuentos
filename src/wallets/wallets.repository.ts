import { Repository } from "../shared/repository.js";
import { wallet as Wallet } from "./wallets.entity.js";
import { db } from "../shared/db/conn.js";
import { ObjectId } from "mongodb";

const wallets = db.collection<Wallet>("wallets");

export class WalletsRepository implements Repository<Wallet> {
    public async findAll(): Promise<Wallet[] | undefined> {
        return await wallets.find().toArray();
    }
    public async findOne(params: { id: string }): Promise<Wallet | undefined> {
        const _id = new ObjectId(params.id);
        return (await wallets.findOne({ _id })) || undefined;
    }
    public async add(entity: Wallet): Promise<Wallet | undefined> {
        (await wallets.insertOne(entity)).insertedId;
        return entity;
    }
    public async update(entity: Wallet): Promise<Wallet | undefined> {
        const { id, ...walletInput } = entity;
        const _id = new ObjectId(entity.id);
        return (
            (await wallets.findOneAndUpdate(
                { _id },
                { $set: walletInput },
                { returnDocument: 'after' }
            )) || undefined
        ) as any;
    }
    public async delete(params: { id: string }): Promise<Wallet | undefined> {
        const _id = new ObjectId(params.id);
        return (await wallets.findOneAndDelete({ _id })) || undefined;
    }
}

