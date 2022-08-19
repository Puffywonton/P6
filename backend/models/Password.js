const passwordValidator = require('password-validator');
const passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)
.is().max(100)
.is().digits(2)

// c'est un shcema ca ? il faut exporter ??? 