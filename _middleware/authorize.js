const jwt = require('express-jwt');
const { secret } = require('config.json');
const db = require('_helpers/db');
const dd = require('dump-die');

function authorize(roles = []) {

    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authenticate the user and attach user object to req obj (req.body)
        jwt({ secret: secret, algorithms: ['HS256'] }),

        // authorize based on role
        async (req, res, next) => {
            const account = await db.Account.findById(req.user.id);
            const refreshTokens = await db.RefreshToken.find({ account: account.id });

            if (!account || (roles.length && !roles.includes(account.role))) {
                // account no longer exists or role not authorized
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // authentication and authorization successful
            req.user.role = account.role;
            req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
            next();
        }
    ];
}

module.exports = authorize;
