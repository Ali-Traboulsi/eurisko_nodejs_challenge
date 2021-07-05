const express = require('express');
const router = express.Router();
const Role = require('_helpers/role');
const addressService = require('services/address.service');
const dd = require('dump-die');
const authorize = require('_middleware/authorize');

const create = (req, res, next) => {
    addressService.create(req)
        .then(address => res.json({
            message: 'address upload successful!',
            data: address
        }))
        .catch(next)
}

const update = (req, res, next) => {
    addressService.update(req.params.id, req)
        .then(address => res.json({
            message: 'Address updated successful!',
            data: address
        }))
        .catch(next)
}

// delete
const _delete = (req, res, next) => {
    addressService.delete(req.params.id)
        .then(address => res.json({
            message: 'Address Deleted successful!',
            data: address
        }))
        .catch(next)
}

// get single address
const getAddress = (req, res, next) => {
    addressService.getAddress(req.params.id)
        .then(address => res.json({
            message: 'Address found successful!',
            data: address
        }))
        .catch(next)
}

const getAllAddresses = (req, res, next) => {
    addressService.getAllAddresses()
        .then(address => res.json({
            message: 'Addresses found successful!',
            data: address
        }))
        .catch(next)
}


// routes
router.post('/create',
    authorize(),
    create);
router.put('/update/:id',
    authorize(),
    update);
router.delete('/delete/:id',
    authorize(),
    _delete);
router.get('/getAddress/:id',
    authorize(),
    getAddress);
router.get('/getAllAddresses/',
    authorize(),
    getAllAddresses);

module.exports = router;