const jwt = require('express-jwt');
const { secret } = require('config.json');

module.exports = authorize;

function authorize(roles = []) {

    if (typeof roles == 'string') {
        roles = [roles];
    }

    return [
        // authenticate the user and attach user object to req obj (req.body)
        jwt({ secret, algorithm: ['HS256'] }),

        (req, res, next) => {
            // check if the user role is authenticated. if not, return unauthaurized response
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(401).json({message: 'Unauthaurized'})
            }

            // else, authentication successful
            next();
        }
    ];
}