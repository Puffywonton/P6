const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');




//sinon ne pas oublier de sortir le model que j'ai foutu!!!



exports.signup = (req, res, next) => {
    var password = req.body.password
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
        
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ message: 'login/password incorrect'});
            }
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    console.log(valid)
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