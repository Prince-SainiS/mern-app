const {validationResult} = require("express-validator");
const AppError = require("../utils/AppError");

const validate = (validations) => {
    return async(req, res, next) => {
        // run all validations
        await Promise.all(validations.map(v => v.run(req)));

        // check results
        const errors = validationResult(req);

        // no error continue
        if(errors.isEmpty()){
            return next();
        }

        // has errors  returnn them
        const extractedErrors = errors.array().map(err => ({
            field : err.path,
            message : err.msg
        }));

        return res.status(400).json({
            status : "fail",
            errors : extractedErrors
        })
    }
}

module.exports = validate;