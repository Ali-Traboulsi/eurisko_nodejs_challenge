const db = require('_helpers/db');
const dd = require('dump-die');

const create = async (params) => {
    // validate if already created
    const latitude = params.body.latitude;
    const longitude = params.body.longitude;
    if (await db.Address.findOne({coordinates: [latitude, longitude]})) {
        throw `Address already created!`
    }

    const address = new db.Address({
        label: params.body.label,
        coordinates: [latitude, longitude],
        description: params.body.description,
    });

    await address.save();

    return address;
}

const update = async (id, params) => {
    const address = await db.Address.findById(id);
    if (!address) throw 'Address Not Found';

    const newLatitude = params.body.latitude;
    const newLongitude = params.body.longitude;

    address.label = params.body.label;
    address.description = params.body.description;
    address.coordinates = [newLatitude, newLongitude];

    Object.assign(address, params);

    await address.save();

    return address;
}

// delete
const _delete = async (id) => {
    const address = await db.Address.findById(id);
    await address.remove();
}

const getAddress = async (id) => {
    const address = await db.Address.findById(id);
    if (!address) throw 'Address Not Found'
    return address;
}

const getAllAddresses = async () => {
    const addresses = await db.Address.find();
    if (!addresses) throw 'No addresses Found';
    return addresses;
}


module.exports = {
    create,
    update,
    delete: _delete,
    getAddress,
    getAllAddresses,
}