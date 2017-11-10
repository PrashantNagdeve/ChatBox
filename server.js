
//mongo client allow us to have a connection with database;
var mongo = require('mongodb').MongoClient;
//var client=require('socket.io').listen(3000).sockets;
var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080);

//handler used in createserver
function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

//connected to mongodb
//chatData is my mongoDB name which I use to store the data
mongo.connect("mongodb://localhost:27017/chatData", function (err, db) {
    
      if(err) throw err;
 
      //Write databse Insert/Update/Query code here..
      //when the connection is eastablished
      io.on('connection', function (socket) {
        console.log('Someone has connected');
        var col=db.collection('messages');

       //we will show all the messages already available at the db
       //Emit all messages
       col.find().limit(50).sort({_id:1}).toArray((err,res)=>{
           if(err) throw err;
           console.log("Res is : "+res);
           socket.emit('output',res);
       });
       


        //setting status
        sendStatus=function(status){
              socket.emit('status',status);
        };

       //inserting data in mongodb  
      socket.on('input',(data)=>{
          //declaring message and name variable
         var name=data.name;
         var message=data.message;
         //Checking for white spacing using regular expression
         var pattern=/^\s*$/;

         if(pattern.test(name) || pattern.test(message))
         {
             console.log("Invalid name or Data");
             sendStatus("Invalid name or Data");
         }
         else
         {
            col.insert({name:name,message:message},function(){
                console.log("Inserted successfully");
               //show old stored messages to all client
               console.log("Print data  "+data.name);
               io.emit('output',[data]);

                //sending data back to client to show in textbox
                sendStatus({
                   message:"Message sent",
                   clear:true
                });
            })
         }

        
      }) 
    });
 });
