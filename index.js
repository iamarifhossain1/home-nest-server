const express = require ('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;

// MiddleWare

app.use(cors());
app.use(express.json());


const uri = "mongodb+srv://home-nest-user:ddGheCFGCAWzU3Gl@crud-server.8t1odhz.mongodb.net/?appName=CRUD-Server";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
    res.send('HomeNest')
})


async function run () {
  
  try {
    await client.connect();
    const database = client.db("homenest_db")
    const flatCollection = database.collection("flats")

    app.post('/flats', async (req, res) => {
      const newProduct = req.body;
      const result = await flatCollection.insertOne(newProduct);
      res.send(result)
    })


    await client.db("admin").command({ping: 1});
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }

  finally {

  }

}

run().catch(console.dir);



// Listen Port

app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
    
})