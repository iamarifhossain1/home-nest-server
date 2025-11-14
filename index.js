const express = require ('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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


 // Users APIs
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

    

    app.get('/properties', async (req, res) => {
        
        const { sort, search } = req.query; 
        
        let sortCriteria = {}; 
        let query = {}; 

        
        if (search) {
            
            const searchRegex = { $regex: search, $options: 'i' }; 
            
           
            query.$or = [
                { propertyName: searchRegex },
                { location: searchRegex },
                { type: searchRegex }
            ];
        }
        

        switch (sort) {
            case 'price-asc':
                sortCriteria = { price: 1 }; 
                break;
            case 'price-desc':
                sortCriteria = { price: -1 }; 
                break;
            case 'date-recent':
                sortCriteria = { createdAt: -1 }; 
                break;
            case 'date-old':
                sortCriteria = { createdAt: 1 }; 
                break;
            default:
                sortCriteria = { createdAt: -1 }; 
        }
        
        try {
            
            const cursor = propertiesCollection.find(query).sort(sortCriteria);
            const result = await cursor.toArray();
            res.send(result);
        } catch (error) {
            console.error("Error fetching sorted/searched properties:", error);
            res.status(500).send({ message: "Error fetching properties" });
        }
    });


 app.get('/featured-properties', async (req, res) => {
  const cursor = propertiesCollection.find().sort({
createdAt: -1}).limit(6);
  const result = await cursor.toArray();
  res.send(result);
 })


app.get('/properties/:id', async (req, res) => {
 const id = req.params.id;
 const query = {_id: new ObjectId(id)};
 
 const result = await propertiesCollection.findOne(query); 
 
 if (!result) {
  return res.status(404).send({ message: "Property not found" });
 }
 
 res.send(result); 
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