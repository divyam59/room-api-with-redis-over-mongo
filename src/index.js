//this is the main file which consist all endpoints
//before starting have mongo db and redis installed and running

const express = require('express')
const chalk = require('chalk')


//attach mongo and redis
const client = require('./db/start_redis')
require('./db/start_mongo')


//to access room model
const room = require('./models/rooms')

const app = express();
//In many environments (e.g. Heroku), and as a convention, you can 
//set the environment variable PORT to tell your web server what port to listen on
const port = process.env.PORT||3000

//to convert data from json to object form automatically(express.json())
//so that we can extract details from request in object form
app.use(express.json())

//To create room 
app.post('/rooms',(req,res)=>
{
    const new_room = new room(req.body)
    new_room.save().then(()=>{
         console.log(typeof(new_room._id.toString()))
        //  HMSET myhash field1 "Hello" field2 "World"
        // client_conn.hmset('test',{'demo2': 'example3','demo3': 'example4','demo4': 'example5'});
         client.hmset(new_room._id.toString(), {'name':new_room.name,'title':new_room.title_of_meet, 'duration':new_room.duration} ,(err,resu)=>{

        // client.set(new_room._id.toString(),`{name:${new_room.name},title:${new_room.title_of_meet},duration:${new_room.duration}}`,(err,resu)=>{
            if(err)
            res.status(400).send('Error', err)
            
            res.status(201).send(resu)
        })
        //  res.status(201).send(new_room)
    }).catch((e)=>{
        //400 status code: Bad request, not provided all fields that are required
        res.status(400).send(e)
    })
})
// to read data of all rooms
app.get('/rooms',(req,res)=>{
    client.keys('*', (err, keys) => {
        if(err)throw err
        res.send(keys)
      });
})

app.get('/rooms/:id',(req,res)=>{
    //req.params.id will fetch id from request and store it in _id
    const _id = req.params.id
    client.get(_id.toString(), (err, data) => {
        if(err) throw err
        else if(data === null)
        {
            console.log('not present in redis finding in mongo');
            const _id = req.params.id
            room.findOne({_id}).then((target)=>{
                if(!target)
                res.status(404).send('room not present in both databases')
                else
                {
                    client.set(target._id.toString(),`{name:${target.name},title:${target.title_of_meet},duration:${target.duration}}`)
                    console.log('data added to redis succesfully');
                    res.send(target)
                }
            }).catch((e)=>{
                res.status(500).send(e)
            })
            
        }
        else
        res.send(data)
      });
})

//To fire up the server
app.listen(port,() => console.log(chalk.blue('Server Up and running on '+port)))