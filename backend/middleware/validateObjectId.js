const mongoose = require('mongoose');

module.exports = (paramName = 'id') => {
    return (req, res, next) => {
        const idToValidate = req.params[paramName] || req.body[paramName];
        
        if (idToValidate && !mongoose.Types.ObjectId.isValid(idToValidate)) {
            return res.status(400).json({ error: `Invalid ID format for ${paramName}.` });
        }
        
        next();
    };
};
