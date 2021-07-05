const express = require('express');
const router = express.Router();
const joi = require('joi');
const validateRequest = require('_middleware/validate_request');
const authorize = require('_middleware/authorize');
const Role = require('_helpers/role');
const accountService = require('./account.service');
const errorHandler = require('_middleware/error_handler');
const dd = require('dump-die');

/* ----------------- Invoke Controller actions -----------------------*/

const setTokenCookie = (res, token) => {
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7*24*60*60) // expires in 7 days
    };
    res.cookie('refreshToken', token, cookieOptions)
}

const disableUser = (req, res, next) => {
    try {
        accountService.disableUser(req.params.id);
    } catch (err) {
        next(err)
    }
}

const enableUser = (req, res, next) => {
    try {
        accountService.enableUser(req.params.id);
    } catch (err) {
        next(err)
    }
}


const authenticate = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const ipAddress = req.ip;
    console.log(ipAddress);

        accountService.authenticate({email, password, ipAddress})
            .then(({refreshToken, ...account}) => {
                setTokenCookie(res, refreshToken);
                res.json(account)
            })
            .catch(next);
}

const refreshToken = (req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        const ipAddress = req.ip;
        accountService.refreshToken({ token, ipAddress })
            .then(({ refreshToken, ...account }) => {
                setTokenCookie(res, refreshToken);
                res.json(account);
            })
    } catch (err) {
        next(err)
    }
}

const revokeToken = (req, res, next) => {
    try {
        const token = req.body.token || req.cookie.refreshToken;
        const ipAddress = req.ip;

        if (!token) return res.status(400).json({message: 'Token is required'})

        if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
            errorHandler('UnauthorizedError');
        }

        accountService.revokeToken({ token, ipAddress })
            .then(() => res.json({ message: 'Token revoked' }))

    } catch (err) {
        next(err)
    }
}

const register = (req, res, next) => {
    try {
        accountService.register(req.body, req.get('origin'))
            .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }));
    } catch (err) {
        next(err)
    }
}

const verifyEmail = (req, res, next) => {
    accountService.verifyEmail(req.body.token)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

const forgotPassword = (req, res, next) => {
    accountService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

const validateResetToken = (req, res, next) => {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

const resetPassword = (req, res, next) => {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

const getAll = (req, res, next) => {
    try {
        accountService.getAll()
            .then(accounts => res.status(201).json(accounts));
    } catch (err) {
        next(err)
    }
}

const getById = (req, res, next) => {
    try {

        if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
            return errorHandler('UnauthorizedError')
        }

        accountService.getById(req.params.id)
    } catch (err) {
        next(err)
    }
}

const create = (req, res, next) => {
    try {
        accountService.create(req.body);
    } catch (err) {
        next(err)
    }
}

const update = (req, res, next) => {
    try {

        // prevent non-admin access
        if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        accountService.update(req.params.id, req.body);
        } catch (err) {
        next(err)
    }
}

const _delete = (req, res, next) => {
    try {
        if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
            return res.status(401).json({message: 'Unauthorized'});
        }

        accountService.delete(req.params.id);

    } catch (err) {
        next(err)
    }
}
/* -------------------------------------------------------------------*/



// routes
router.post('/register', register);
router.post('/login', authenticate);
router.post('/refresh-token', refreshToken);
router.post('/revoke-token', authorize(), revokeToken);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', authorize(), forgotPassword);
router.post('/validate-reset-token',authorize(), validateResetToken);
router.post('/reset-password',authorize(), resetPassword);
router.post('/disable-user/:id', authorize(Role.Admin), disableUser); // only admin
router.post('/disable-user/:id', authorize(Role.Admin), enableUser); // only admin
router.get('/get-all-users', authorize(Role.Admin), getAll); // only Admin
router.get('/get-user-by-id/:id', authorize(), getById); // all authenticated users (User and Admin);
router.post('/create-user', authorize(Role.Admin), create);
router.put('/update-user/:id', authorize(), update);
router.delete('/delete-user/:id', authorize(Role.Admin), _delete);


module.exports = router;

