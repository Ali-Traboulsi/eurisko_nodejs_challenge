const express = require('express');
const router = express.Router();
const Role = require('_helpers/role');
const orderService = require('services/order.service');
const dd = require('dump-die');
const authorize = require('_middleware/authorize');

const create = (req, res, next) => {
    orderService.create(req)
        .then(order => res.json({
            message: 'Order upload successful!',
            data: order
        }))
        .catch(next)
}

const update = (req, res, next) => {
    orderService.update(req.params.id, req)
        .then(order => res.json({
            message: 'Order updated successful!',
            data: order
        }))
        .catch(next)
}

const _delete = (req, res, next) => {
    orderService.delete(req.params.id)
        .then(order => res.json({
            message: 'Order Deleted successful!',
            data: order
        }))
        .catch(next)
}

// get single cat
const getOrder = (req, res, next) => {
    orderService.getOrder(req.params.id)
        .then(order => res.json({
            message: 'Order found successful!',
            data: order
        }))
        .catch(next)
}


const getAllOrders = (req, res, next) => {
    orderService.getAllOrders()
        .then(order => res.json({
            message: 'Orders found successful!',
            data: order
        }))
        .catch(next)
}

const accecptOrder = (req, res, next) => {
    orderService.acceptOrder(req.params.id)
        .then(order => res.json({
            message: 'Orders Accpeted successfully!',
            data: order
        }))
        .catch(next)
}

const rejectOrder = (req, res, next) => {
    orderService.rejectOrder(req.params.id)
        .then(order => res.json({
            message: 'Order Rejected successfully!',
            data: order
        }))
        .catch(next)
}

const setStatusDelivered = (req, res, next) => {
    orderService.setStatusDelivered(req.params.id)
        .then(order => res.json({
            message: 'Order Delivered successfully!',
            data: order
        }))
        .catch(next)
}


// routes
router.post('/create',
    // authorize(Role.Admin),
    create);
router.put('/update/:id',
    // authorize(Role.Admin),
    update);
router.delete('/delete/:id',
    // authorize(Role.Admin),
    _delete);
router.get('/getOrder/:id',
    // authorize(Role.Admin),
    getOrder);
router.get('/getAllOrders/',
    // authorize(Role.Admin),
    getAllOrders);
router.post('/acceptOrder/:id',
    authorize(Role.Admin),
    accecptOrder);
router.post('/rejectOrder/:id',
    function (req, res) {
    const order = orderService.getOrder(req.params.id);
    (order.status == 'pending') ? authorize() : authorize(Role.Admin);
    },
    rejectOrder);
router.post('/setStatusDelivered/:id',
    // authorize(Role.Admin),
    setStatusDelivered);


module.exports = router;