const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('/_helpers/authorize');
const Role = require('/_helpers/role');

// defining routes
router.post('/authenticate', authenticate); //public route
router.get('/getAllUsers', getAll); //admin route
router.get('/getUserById', getById); //all authenticated users

module.exports = router;

const authenticate = (req, res, next) => {
    userService.authenticate(req.body)
        .then(user => user ? res.status(201).json({success: true, data: user}) : res.status(401).json({ success: false, message: 'Username or email is incorrect' }))
        .catch(err => next(err));
}


const getAll = (req, res, next) => {
    userService.getAll()
        .then(users => res.status(201).json({success: true, data: users}))
        .catch(err => next(err));
}

const getById = (req, res, next) => {
    const currentUser = req.user;
    const id = parseInt(req.params.id);

    // only admins access all user records
    if (id != currentUser.sub && currentUser.role != Role.Admin) {
        return res.status(401).json({success: false, message: UnauthorizedError})
    }

    userService.getById(id)
        .then(user => user ? res.status(201).json({success: true, data: user}) : res.sendStatus(404))
        .catch(err => next(err));
}