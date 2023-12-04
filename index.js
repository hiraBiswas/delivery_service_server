const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: [
       'https://delivery-service-5ba45.web.app',
       'https://delivery-service-5ba45.firebaseapp.com',
    ],
    credentials: true
  }));
  
app.use(express.json());

console.log(process.env.DB_USER)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://delivery_service:vJ99SbNGNQpc9cEf@cluster0.eogwfq1.mongodb.net/?retryWrites=true&w=majority";
// const uri = `mongodb+srv://${encodeURIComponent(process.env.DB_USER)}:${encodeURIComponent(process.env.DB_PASS)}@cluster0.swu9d.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
     // Connect the client to the server	(optional starting in v4.7)
   

     const userCollection = client.db("deliveryServiceDB").collection("users");
     const bookingsCollection = client.db("deliveryServiceDB").collection("bookings");

     app.post('/users', async (req, res) => {
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

      app.get('/users',  async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });
      
      app.patch('/users/admin/:id',  async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            type: 'Admin'
          }
        }
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      })
      
      app.patch('/users/deliveryman/:id',  async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            type: 'Deliveryman'
          }
        }
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      })
      
      app.post('/bookings', async (req, res) => {
        const newBooking = req.body;
        console.log(newBooking);
        const result = await bookingsCollection.insertOne(newBooking)
        res.send(newBooking)
      })

      app.get('/bookings',  async (req, res) => {
        const result = await bookingsCollection.find().toArray();
        res.send(result);
      });


     // Send a ping to confirm a successful connection
     await client.db("admin").command({ ping: 1 });
     console.log("Pinged your deployment. You successfully connected to MongoDB!");
  

  }
  finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('delivery service is connecting')
})

app.listen(port, () => {
  console.log(`delivery service is sitting on port ${port}`);
})
