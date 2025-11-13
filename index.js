const express = require ('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { use } = require('react');
const port = process.env.PORT || 3000;

// MiddleWare
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
 res.send('Home Nest Server Running');
  
})

const uri = "mongodb+srv://home-nest:nqB8jB2PADweozvT@crud-server.8t1odhz.mongodb.net/?appName=CRUD-Server";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run () {
  try{
    await client.connect();
    const database = client.db('home_nest')
    const usersCollection = database.collection('users')
    const propertiesCollection = database.collection('properties')

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = {email: email};
      const existingUser = await usersCollection.findOne(query);
      if(existingUser) {
        res.send({message:'user already exist'})
      }
      
      else {
        const result = await usersCollection.insertOne(newUser);
      res.send(result);
      }
      
    })

    app.post('/properties', async (req, res) =>{
      const newProduct = req.body;
      const result = await propertiesCollection.insertOne(newProduct);
      res.send(result);
    })

    app.patch('/properties/:id', async (req, res) => {
      const id = req.params.id;
      const updatedProperties = req.body;
      const query = {_id: new ObjectId(id)};
      const update = {
        $set: {
          updatedProperties
        }
      }
      const result = await propertiesCollection.updateOne(query, update);
      res.send(result);
    })

    app.delete('/properties/:id', async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await propertiesCollection.deleteOne(query);
      res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  }

  finally {

  }
}

run().catch(console.dir)


// Listen Port
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
    
})