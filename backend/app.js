

const express = require('express');
const helmet = require("helmet");

const mongoose = require('mongoose');
const app = express();

const userRoutes = require('./routes/user');


const sauceRoutes = require('./routes/sauce');

const path = require('path');



app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// QUESTION HELMET ??? est ce que je peux foutre le crossorigin machin dans le setHeader ???

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

mongoose.connect('mongodb+srv://'+process.env.MOONGOOSE_ID+':'+process.env.MOONGOOSE_PASSWORD+'@cluster0.vanvboo.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;