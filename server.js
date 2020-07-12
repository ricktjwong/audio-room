const express = require('express');
const cors = require("cors")

const tokenGenerator = require('./tokenGenerator.js');
const app = express();
app.use(cors())

app.get('/login', function(request, response) {
  const identity = request.query.identity || 'identity';
  const room = request.query.room;
  response.send(tokenGenerator(identity, room));
});

const port = 5000;

app.listen(port, () => `Server running on port ${port}`);
