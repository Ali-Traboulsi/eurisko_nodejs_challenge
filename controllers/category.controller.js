const express = require('express');
const router = express.Router();
const Role = require('_helpers/role');
const catService = require('services/category.service');
const dd = require('dump-die');
const authorize = require('_middleware/authorize');

// invoke actions
const create = (req, res, next) => {
    catService.create(req)
        .then(cat => res.json({
            message: 'Category upload successful!',
            data: cat
        }))
        .catch(next)
}

const update = (req, res, next) => {
    catService.update(req.params.id, req)
        .then(cat => res.json({
            message: 'Category updated successful!',
            data: cat
        }))
        .catch(next)
}


// delete
const _delete = (req, res, next) => {
    catService.delete(req.params.id)
        .then(cat => res.json({
            message: 'Category Deleted successful!',
            data: cat
        }))
        .catch(next)
}

// get single cat
const getCatById = (req, res, next) => {
    catService.getCat(req.params.id)
        .then(cat => res.json({
            message: 'Category found successful!',
            data: cat
        }))
        .catch(next)
}


const getAllCat = (req, res, next) => {
    catService.getAllCat()
        .then(cat => res.json({
            message: 'Categories found successful!',
            data: cat
        }))
        .catch(next)
}


// routes
router.post('/upload',
    authorize(Role.Admin),
    catService.upload.single('catImage'),
    create);
router.put('/update/:id',
    authorize(Role.Admin),
    catService.upload.single('catImage'),
    update);
router.delete('/delete/:id',
    authorize(Role.Admin),
    _delete);
router.get('/getCat/:id',
    authorize(),
    getCatById);
router.get('/getAllCat/',
    authorize(),
    getAllCat);


module.exports = router;
