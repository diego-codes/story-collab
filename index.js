 "use strict";
//initialize firebase
var firebase = require("firebase");
var config = {
    apiKey: "AIzaSyCk147Q-MQKikvWVIOO4shXd8C0UKiBKpA",
    authDomain: "story-collab.firebaseapp.com",
    databaseURL: "https://story-collab.firebaseio.com",
    storageBucket: "story-collab.appspot.com",
    messagingSenderId: "814622369840"
  };

firebase.initializeApp(config);

const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const port = process.env.PORT || 3000;

const authors = [];
const messages = [];

let messageNumber = 0;
let areTyping = 0;

// Set view engine to EJS and locate views
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Set up static files directory
app.use('/public', express.static(path.join(__dirname, 'client/public')));

app.get('/favicon.ico', (request, response) => {
  response.sendStatus(200)
    .end();
});

app.get('*', (request, response) => {
  response.render('index');
});

// app.get('api/story', (request, response) => {
//   // create story in firebase here and put this in the callback to redirect to
//   // response.redirect(`/story/${story.id}`);
//
//   // REMOVE THIS WHEN FIREBASE STORY CREATION IS HERE
//   response.end('Endpoint not working yet');
// });
//
// app.get('api/story/:id', (request, response) => {
//   // query firebase for messages and put this in the callback
//   response.render('story', {messages: messages});
// });

io.on('connection', (socket) => {
  const authorId = authors.length;
  authors.push(socket);
  console.log(`New author #${authorId} connected :)`);

  // When this socket adds a new message
  socket.on('add message', (data) => {
    console.log(`New message from #${authorId}: ${data.message}`);
    messages.push(data.message);
    // Broadcast new message to all other sockets
    socket.broadcast.emit('new message', data);
    // send to Firebase to store

  });

  // Notify all authors that this author is typing
  socket.on('start typing', () => {
    console.log(`Author #${authorId} is typing.`);
    socket.broadcast.emit('other typing', ++areTyping);
  });

  // Notify all authors that this author stopped typing
  socket.on('stop typing', () => {
    console.log(`Author #${authorId} stopped typing.`);
    socket.broadcast.emit('other typing', --areTyping);
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log(`Author #${authorId} left :(`);
  });
});

server.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}/`);
});

