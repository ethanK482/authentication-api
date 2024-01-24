import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app from "../app";
import request from "supertest"
let mongo:any;
beforeAll(async()=>{
     mongo = await MongoMemoryServer.create();
    const mongoUri =  mongo.getUri();
    await mongoose.connect(mongoUri,{})
})

beforeEach(async()=>{
    const collections = await  mongoose.connection.db.collections();
    
    for(let collection of collections){
        await collection.deleteMany({})
    }
})

afterAll(async()=>{
    if(mongo){
        await mongo.stop();
    }
    await mongoose.connection.close();
})
export const getCookie = async():Promise<string[]>=>{
    const email = "test@example.com";
    const password = "12345213126689";
    const response = await request(app.app)
    .post("/api/auth/register")
    .send({
        email,
        password
    })
    .expect(201);

    const cookie = response.get("Set-Cookie");
    return cookie;
}