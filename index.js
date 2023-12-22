const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors')
require('dotenv').config()

//middleware
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7xouwts.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const taskCollection = client.db('taskDb').collection('tasks') 
        const userCollection = client.db('taskDb').collection('users') 
        //users related api
        app.post('/users', async(req, res) => {
            const user = req.body
            console.log(user)
            //checking user exist or not
            const query = { email: user.email }
            const existingUser = await userCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: 'user already exist', insertedId: null })
            }
            const result = await userCollection.insertOne(user)
            res.send(result)
        })

        //task related api
        app.post('/addTask', async(req,res)=>{
            const task = req.body
            const result = await taskCollection.insertOne(task)
            res.send(result)
        })
        app.get('/getAllTask',async(req,res)=>{
            const email =req.query.email
            const pending = {status:'pending',email:email}
            const ongoing = {status:'ongoing',email:email}
            const completed = {status:'completed',email:email}
            const pendingTask = await taskCollection.find(pending).toArray()
            const ongoingTask = await taskCollection.find(ongoing).toArray()
            const completedTask = await taskCollection.find(completed).toArray()
            const result ={pendingTask,ongoingTask,completedTask}
            res.send(result)
        })
        app.delete('/deleteTask/:id',async(req,res)=>{
            const id =req.params.id
            console.log(id)
            const query ={_id: new ObjectId(id)}
            const result = await taskCollection.deleteOne(query)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
       // await client.close();
    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('task-manager is running')
})
app.listen(port,()=>{
    console.log(`Task manager is running on port ${port}`)
})
