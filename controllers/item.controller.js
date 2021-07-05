const express = require('express');
const router = express.Router();
const Role = require('_helpers/role');
const itemService = require('services/item.service');
const dd = require('dump-die');
const authorize = require('_middleware/authorize');


const create = (req, res, next) => {
    itemService.create(req)
        .then(item => res.json({
            message: 'Item upload successful!',
            data: item
        }))
        .catch(next)
}

const update = (req, res, next) => {
    itemService.update(req.params.id, req)
        .then(item => res.json({
            message: 'Item updated successful!',
            data: item
        }))
        .catch(next)
}

// delete
const _delete = (req, res, next) => {
    itemService.delete(req.params.id)
        .then(item => res.json({
            message: 'Item Deleted successful!',
            data: item
        }))
        .catch(next)
}

// get single cat
const getItem = (req, res, next) => {
    itemService.getItem(req.params.id)
        .then(item => res.json({
            message: 'Item found successful!',
            data: item
        }))
        .catch(next)
}


const getAllItems = (req, res, next) => {
    itemService.getAllItems()
        .then(item => res.json({
            message: 'Items found successful!',
            data: item
        }))
        .catch(next)
}


// routes
router.post('/create', authorize(Role.Admin), itemService.upload.single('itemImage'), create);
router.put('/update/:id', authorize(Role.Admin), itemService.upload.single('itemImage'), update);
router.delete('/delete/:id', authorize(Role.Admin), _delete);
router.get('/getItem/:id', getItem);
router.get('/getAllItems/', getAllItems);


module.exports = router;