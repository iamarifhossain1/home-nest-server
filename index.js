const express = require('express');
const cors = require ('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.post('/properties', async(req, res) => {
            const newProduct = req.body;
            const result = await propertiesCollection.insertOne(newProduct);
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