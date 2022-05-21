const express = require('express');
const cors = require('cors');
var mongoose = require('mongoose');
const usersRouter = require('./routes/api/users');
const strategiesRouter = require('./routes/api/strategies');

const app = express();

app.use(express.json());

const corsOpts = {
  origin: '*',

  methods: [
    'GET',
    'POST',
  ],

  allowedHeaders: [
    'Content-Type',
  ],
};

app.use(cors());
app.use('/api/users', usersRouter);
app.use('/api/users/:userId/strategies', strategiesRouter);

var mongoDB = 'mongodb+srv://abhiram:Abhiram58@cluster0.sg3yz.mongodb.net/optionStrategiesNew?retryWrites=true&w=majority';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));

db.once("open", () => {
  app.listen(3100, () => {
    console.log('Options Strategies app listening on port 3100!');
  });
});
