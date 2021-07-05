const db = require('_helpers/db');
const dd = require('dump-die');

const create = async (params) => {
    // validate if already created
    if (await db.Branch.Branch.findOne({name: params.body.name})) {
        throw `Branch already created!`
    }

    const latitude = params.body.latitude;
    const longitude = params.body.longitude;

    const geoLocation = new db.Branch.Location({
        type: params.body.type,
        coordinates: [latitude, longitude],
    })

    const branch = new db.Branch.Branch({
        branchName: params.body.branchName,
        location: geoLocation
    });

    await geoLocation.save();
    await branch.save();

    return branch;

}

// update
const update = async (id, params) => {

    const branch = await db.Branch.Branch.findById(id);

    if (!branch) throw 'Branch Not Found';

    const newLatitude = params.body.latitude;
    const newLongitude = params.body.longitude;

    branch.location.type = params.body.type // update type
    branch.location.coordinates = [newLatitude, newLongitude]; // update coordinates
    branch.branchName = params.body.branchName; // update branch name

    Object.assign(branch, params);

    await branch.save();

    return branch;
}

const _delete = async (id) => {
    const branch = await db.Branch.Branch.findById(id);
    await branch.remove();
}

const getBranch = async (id) => {
    const branch = await db.Branch.Branch.findById(id);
    if (!branch) throw 'Branch Not Found'
    return branch;
}

const getAllBranches = async () => {
    const branches = await db.Branch.Branch.find();
    if (!branches) throw 'No branches Found';
    return branches;
}


module.exports = {
    create,
    update,
    delete: _delete,
    getBranch,
    getAllBranches,
}