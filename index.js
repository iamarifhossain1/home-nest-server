const express = require('express');
const cors = require ('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.port || 3000;

const uri = "mongodb+srv://home-nest:Dcz6J8BpVbC8p503@crud-server.8t1odhz.mongodb.net/?appName=CRUD-Server";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Middleware

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Home Nest Server is Running')
})

async function run () {
    try {
        await client.connect();

        const database = client.db('home_nest')
        const propertiesCollection = database.collection('properties')

        app.get('/properties', async (req, res) => {
            const cursor = propertiesCollection.find().sort({price: -1}).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await propertiesCollection.findOne(query);
            res.send(result);
        })

        app.post('/properties', async(req, res) => {
            const newProduct = req.body;
            const result = await propertiesCollection.insertOne(newProduct);
            res.send(result);
        })

        app.patch('/properties/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const updatePropeties = req.body
            const update = {
                $set: {
                    name: updatePropeties.name,
                    Phone: updatePropeties.phone,
                 }
            }
            const result = await propertiesCollection.updateOne(query, update);
            res.send(result)
        })

        app.delete('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await propertiesCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ping: 1})
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }

    finally{

    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log(`Server Running on Port: ${port}` );
    
})


// Another Method

// client.connect()
// .then(() => {
//     app.listen(port, () => {
//     console.log(`Server Running on Port: ${port}` );  
// })
// })

// .catch(() => {
//     console(console.dir)
// })

// DB Username: home-nest
// DB Password: Dcz6J8BpVbC8p503