const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}crud-server.8t1odhz.mongodb.net/?appName=CRUD-Server`;

const allowedOrigin = 'https://home-nest-a10.netlify.app/';

app.use(cors({
  origin: [allowedOrigin, 'http://localhost:3000', 'https://home-nest-a10.netlify.app/'],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Home Nest Server Running');
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const database = client.db('home_nest');
        const usersCollection = database.collection('users');
        const propertiesCollection = database.collection('properties');
        
        
        const reviewsCollection = database.collection('reviews');

        
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) {
                res.send({ message: 'user already exist' });
            } else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        });

        
        app.get('/properties/my-properties/:userEmail', async (req, res) => {
            try {
                const userEmail = req.params.userEmail;
                const query = { userEmail: userEmail };
                const properties = await propertiesCollection.find(query).toArray();
                res.status(200).json(properties);
            } catch (error) {
                res.status(500).send({ message: "Error fetching user properties" });
            }
        });

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
            const cursor = propertiesCollection.find().sort({ createdAt: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        
        app.get('/properties/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const propertyQuery = { _id: new ObjectId(id) };
                const property = await propertiesCollection.findOne(propertyQuery);

                if (!property) {
                    return res.status(404).send({ message: "Property not found" });
                }
                
                
                const reviews = await reviewsCollection.find({ propertyId: id }).sort({ reviewDate: -1 }).toArray();
                
                
                const totalRating = reviews.reduce((sum, review) => sum + review.starRating, 0);
                const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

                res.send({
                    ...property,
                    reviews: reviews,
                    averageRating: parseFloat(averageRating),
                    reviewCount: reviews.length
                });

            } catch (error) {
                res.status(500).send({ message: "Error fetching property details", error: error.message });
            }
        });


        app.post('/properties', async (req, res) => {
            const newProduct = req.body;
            const result = await propertiesCollection.insertOne(newProduct);
            res.send(result);
        });

        app.patch('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            try {
                const query = { _id: new ObjectId(id) };

                const update = {
                    $set: {
                        ...updatedData
                    }
                };

                const result = await propertiesCollection.updateOne(query, update);

                if (result.matchedCount === 0) {
                    return res.status(404).send({ message: "Property not found." });
                }

                res.send({
                    success: true,
                    message: "Property updated successfully.",
                    result
                });

            } catch (error) {
                console.error("Error updating property:", error);
                res.status(500).send({ message: "Failed to update property." });
            }
        });

        app.delete('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await propertiesCollection.deleteOne(query);
            res.send(result);
        });
        
        
        app.post('/reviews', async (req, res) => {
            const reviewData = req.body;
            
            reviewData.reviewDate = new Date(); 
            
            
            if (!reviewData.propertyId || !reviewData.reviewerId || !reviewData.starRating || !reviewData.reviewText) {
                return res.status(400).send({ message: "Missing required review fields." });
            }
            
            
            if (reviewData.starRating < 1 || reviewData.starRating > 5) {
                return res.status(400).send({ message: "Star rating must be between 1 and 5." });
            }
            
            try {
                const result = await reviewsCollection.insertOne(reviewData);
                res.status(201).send({ message: "Review submitted successfully.", result });
            } catch (error) {
                console.error("Error submitting review:", error);
                res.status(500).send({ message: "Failed to submit review." });
            }
        });

        
        app.get('/reviews/my-reviews/:reviewerId', async (req, res) => {
            const reviewerId = req.params.reviewerId;
            try {
                const query = { reviewerId: reviewerId };
                
                const reviews = await reviewsCollection.find(query).sort({ reviewDate: -1 }).toArray();
                
                if (reviews.length === 0) {
                    return res.status(200).send([]); // 
                }
                
                res.status(200).send(reviews);
            } catch (error) {
                console.error("Error fetching user reviews:", error);
                res.status(500).send({ message: "Error fetching reviews." });
            }
        });

        // ⭐ REVIEW DELETE ROUTE JOG KORA HOLO
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            try {
                const query = { _id: new ObjectId(id) }; 
                
                const result = await reviewsCollection.deleteOne(query);
                
                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: "Review not found or already deleted." });
                }
                
                res.status(200).send({ 
                    success: true, 
                    message: "Review deleted successfully.",
                    result 
                });
            } catch (error) {
                console.error("Error deleting review:", error);
                res.status(500).send({ message: "Failed to delete review.", error: error.message });
            }
        });


        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    }

    finally {
        // 
    }
}

run().catch(console.dir);


module.exports = app;