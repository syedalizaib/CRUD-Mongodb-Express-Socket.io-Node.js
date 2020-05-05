const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv/config");
const bodyParser = require("body-parser");
var io = require("socket.io");
const http = require("http");
const Schema = mongoose.Schema;
const Todo = require("./models/todos.js").init(Schema, mongoose);

//midlewares
app.use(cors());
app.use(bodyParser.json());

//import routers
const postRoute = require("./routes/users");
app.use("/users", postRoute);

mongoose.connect(
  process.env.DB_CONNECTION,
  { useUnifiedTopology: true },
  (error) => {
    if (error) {
      console.log("db connect error");
    } else {
      console.log("db connect success");
    }
  }
);

// app.listen(3000);

app.set("port", process.env.PORT || 3000);
// app.use(express.static(path.join(__dirname, "public")));

var server = http.createServer(app).listen(app.get("port"), function () {
  console.log("Express server listening on port " + app.get("port"));
});

var sio = io.listen(server);
//User online user count variable
var users = 0;

var address_list = new Array();

sio.sockets.on("connection", function (socket) {
  var address = socket.handshake.address;

  if (address_list[address]) {
    var socketid = address_list[address].list;
    socketid.push(socket.id);
    address_list[address].list = socketid;
  } else {
    var socketid = new Array();
    socketid.push(socket.id);
    address_list[address] = new Array();
    address_list[address].list = socketid;
  }

  users = Object.keys(address_list).length;

  socket.emit("count", { count: users });
  console.log("user joined " + socket.id);
  console.log("connected users " + users);
  socket.broadcast.emit("count", { count: users });
  socket.broadcast.to(socket.id).emit("all", { count: users });
  /*
    handles 'all' namespace
    function: list all todos
    response: all todos, json format
  */
  /*  Todo.find({}, function (err, todos) {
    socket.emit("all", todos);
    // socket.broadcast.to(socket.id).emit("all", todos);
    // console.log(socket.id);
    // socket.broadcast.emit("all", todos);
    // console.log(todos);
  }); */
  socket.on("all", function (data) {
    Todo.find({}, function (err, todos) {
      socket.emit("all", todos);
      // socket.broadcast.to(socket.id).emit("all", todos);
      // console.log(socket.id);
      // socket.broadcast.emit("all", todos);
      // console.log(todos);
    });
  });
  /*
    handles 'add' namespace
    function: add a todo
    Response: Todo object
  */
  socket.on("add", function (data) {
    var todo = new Todo({
      title: data.title,
      complete: false,
    });

    todo.save(function (err) {
      if (err) throw err;
      socket.emit("added", todo);
      socket.broadcast.emit("added", todo);
    });
  });

  //disconnect state
  socket.on("disconnect", function () {
    var socketid = address_list[address].list;
    delete socketid[socketid.indexOf(socket.id)];
    if (Object.keys(socketid).length == 0) {
      delete address_list[address];
    }
    users = Object.keys(address_list).length;
    socket.emit("count", { count: users });
    socket.broadcast.emit("count", { count: users });
    console.log("user disconnected");
    console.log("connected users " + users);
  });
});
