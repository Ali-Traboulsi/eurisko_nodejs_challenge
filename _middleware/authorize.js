const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');

module.exports = authorize;

function authorize(roles = []) {

    if (typeof roles == 'string') {
        roles = [roles];
    }

    return [
        // authenticate the user and attach user object to req obj (req.body)
        jwt({ secret, algorithm: ['HS256'] }),

        // authorize based on role
        async (req, res, next) => {
            const account = await db.Account.findById(req.user.id);
            const refreshToken = await db.RefreshToken.find({ account: account.id })

            // check if the account role is authenticated. if not, return unauthaurized response
            if (!account || (roles.length && !roles.includes(account.role))) {
                return res.status(401).json({message: 'Unauthaurized'})
            }

            // else, authentication successful
            req.user.role = account.role;
            // if the token is the same as the refresh token then the req.user.ownsToken = true, else it is false
            req.user.ownsToken = token => !!refreshToken.find(x => x.token === token)
            next();
        }
    ];
}