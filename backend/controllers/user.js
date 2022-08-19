const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.is().max(100)
.is().digits(2)
// question, je peux mettre le passwordValidator dans un model ?

//PROB: error messages ne s'affichent pas :S

exports.signup = (req, res, next) => {
    var password = req.body.password
    console.log(passwordSchema.validate(password))
    if (passwordSchema.validate(password)){
        bcrypt.hash(password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => res.status(201).json({ message: 'user created' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    }else{
        // res.status(406).json({message: 'password between 8-100 characters with 2 numbers min'})
        res.status(406).send('tagueule');
    }
    
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'login/password incorrect'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ message: 'login/password incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id},
                            process.env.SECRET_KEY,
                            { expiresIn: '24h'}
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};