// src/index.js
const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT;

var responses = require('./routes/responses.js');

app.use('/', responses);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});