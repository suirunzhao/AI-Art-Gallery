let express = require("express");
let app = express();

// //DB - 1 - Connect to mongo DB
// const { Database } = require("quickmongo");
// const db = new Database("mongodb+srv://Siri:0yi0iOQeKJsMrdR0@cluster0.wfjupnq.mongodb.net/?retryWrites=true&w=majority");
// db.on("ready", () => {
//     console.log("Connected to the database");
// });

// db.connect();



app.use('/', express.static('public'));

//Parse JSON data
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

let imageUploadData = [];

/*------ROUTES------*/

//create a POST route to recieve the data
app.post('/infoSave', (req, res) => {
    console.log("Received a POST request!");
    console.log(req.body);

    let currentDate = new Date().toLocaleString();

    let objToSave = {
        date: currentDate,
        info: req.body
    }
    // //DB - 2 - add values to the DB
    // db.push("imageUploadData", obj);

    // coffeeTracker.push(obj);
    // console.log(coffeeTracker);
    res.json({task:"success"});
});

//create a GET route to send the data
app.get('/data', (req, res) => {
    console.log("A GET req for the data")
    // //DB - 3 - fetch from the DB
    // db.get("imageUploadData").then(imageData => {
    //     let obj = {data: imageData};
    //     res.json(obj);
    // })
});

//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server listening at port: " + port);
});

//Initialize socket.io
let io = require('socket.io');
io = new io.Server(server);

//Listen for individual clients/users to connect
io.on('connection', function(socket) {
    console.log("We have a new client: " + socket.id);

    io.emit('user', socket.id)
    //Listen for a message named 'msg' from this client
    socket.on('data', function(data) {
        //Data can be numbers, strings, objects
        console.log("Received a 'data' event");
        console.log(data);

        //add id to user
        let obj = {
			pos: data,
			id: socket.id,
		}

        //Send a response to all clients, including this one
        io.emit('dataAll', obj);

        //Send a response to all other clients, not including this one
        // socket.broadcast.emit('msg', data);

        //Send a response to just this client
        // socket.emit('msg', data);
    });

    //Listen for this client to disconnect
    socket.on('disconnect', function() {
        console.log("A client has disconnected: " + socket.id);
        io.emit('userLeft', socket.id)
    });
});