const express = require('express');
const router = express.Router();
const Role = require('_helpers/role');
const branchService = require('services/branch.service');
const dd = require('dump-die');
const authorize = require('_middleware/authorize');

const create = (req, res, next) => {
    branchService.create(req)
        .then(branch => res.json({
            message: 'Branch upload successful!',
            data: branch
        }))
        .catch(next)
}

const update = (req, res, next) => {
    branchService.update(req.params.id, req)
        .then(branch => res.json({
            message: 'Branch updated successful!',
            data: branch
        }))
        .catch(next)
}

// delete
const _delete = (req, res, next) => {
    branchService.delete(req.params.id)
        .then(branch => res.json({
            message: 'Branch Deleted successful!',
            data: branch
        }))
        .catch(next)
}

// get single cat
const getBranch = (req, res, next) => {
    branchService.getBranch(req.params.id)
        .then(branch => res.json({
            message: 'Branch found successful!',
            data: branch
        }))
        .catch(next)
}


const getAllBranches = (req, res, next) => {
    branchService.getAllBranches()
        .then(branch => res.json({
            message: 'Branches found successful!',
            data: branch
        }))
        .catch(next)
}



router.post('/create',
    authorize(Role.Admin),
    create);
router.put('/update/:id',
    authorize(Role.Admin),
    update);
router.delete('/delete/:id',
    authorize(Role.Admin),
    _delete);
router.get('/getBranch/:id',
    authorize(Role.Admin),
    getBranch);
router.get('/getAllBranches/',
    authorize(Role.Admin),
    getAllBranches);

module.exports = router;