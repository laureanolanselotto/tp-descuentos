import { persona } from "./personas.entity.js";
import { Repository } from "../shared/repository.js";
import { getDatabase } from "../shared/db/conn.js";
import { ObjectId } from "mongodb";
const personasArray = [
  new persona(
    "lauerano",
    "lanselotto",
    "laureano@gmail.com",
    123456789,
    44931516,
    "12345678-1234-1234-1234-123456789012"
  ),
];

export class PersonasRepository implements Repository<persona> {
  private async getCollection() {
    const db = await getDatabase();
    return db.collection<persona>("personas");
  }

  public async findAll(): Promise<persona[] | undefined> {
    const personas = await this.getCollection();
    return await personas.find().toArray();
  }
  public async findOne(nombre: { id: string }): Promise<persona | undefined> {
    const personas = await this.getCollection();
    const _id = new ObjectId(nombre.id);
    return (await personas.findOne({ _id })) || undefined; // Esto busca en la base de datos usando el id como ObjectId
    // Si no se encuentra, devuelve undefined

    // return await personasArray.find((persona)=> persona.id === nombre.id);
  }
  public async add(nombre: persona): Promise<persona | undefined> {
    const personas = await this.getCollection();
    (await personas.insertOne(nombre)).insertedId;
    return nombre;
  }
  public async update(nombre: persona): Promise<persona | undefined> {
    const personas = await this.getCollection();
    const { id, ...personasInput } = nombre; // Desestructuramos para obtener el id y el resto de los campos
    const _id = new ObjectId(nombre.id);
    return (
      (await personas.findOneAndUpdate(
        { _id },
        { $set: personasInput },
        { returnDocument: "after" }
      )) || undefined
    ); // no poner llaves alrededor de nombre//
  } // findOneAndUpdate busca un documento y lo actualiza, devolviendo el documento actualizado
  // Si no se encuentra, devuelve undefined
  public async delete(nombre: { id: string }): Promise<persona | undefined> {
    const personas = await this.getCollection();
    const _id = new ObjectId(nombre.id);
    return (await personas.findOneAndDelete({ _id })) || undefined; // Esto busca en la base de datos usando el id como ObjectId
    // Si no se encuentra, devuelve undefined
  }
}
