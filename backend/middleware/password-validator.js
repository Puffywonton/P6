const passwordValidator = require('password-validator');

const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.is().max(100)
.is().digits(2)

module.exports = (req, res, next) => {
    console.log(req.body.password)
    if (passwordSchema.validate(req.body.password)){
        console.log(passwordSchema.validate(req.body.password))
        next()
    }else{
        res.status(400).json({message:'mdp a echoue pour x raison:'+passwordSchema.validate(req.body.password,{list:true})})
    }
}