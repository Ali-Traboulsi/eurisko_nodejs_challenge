const db = require('_helpers/db');
const dd = require('dump-die');
const authorize = require('_middleware/authorize');

const create = async (params) => {
    if (await db.Order.findOne({name: params.body.name})) {
        throw `Order already created!`
    }
    const order = new db.Order({
        name: params.body.name,
        branch: params.body.branchId,
        item: params.body.itemId,
        customer: params.body.accountId,
        address: params.body.addressId,
    });

    await order.save();

    return order;
}

const update = async (id, params) => {
    const order = await db.Order.findById(id);
    if (!order) throw 'Order Not Found';

    order.name = params.body.name;
    order.branch = params.body.branchId;
    order.item = params.body.itemId;
    order.customer = params.body.accountId;
    order.address = params.body.addressId;

    Object.assign(order, params);

    await order.save();

    return order;
}

const _delete = async (id) => {
    const order = await db.Order.findById(id);
    await order.remove();
}

const getOrder = async (id) => {
    const order = await db.Order.findById(id);
    if (!order) throw 'Order Not Found'
    return order;
}

const getAllOrders = async () => {
    const orders = await db.Order.find();
    if (!orders) throw 'No orders Found';
    return orders;
}

const rejectOrder = async (id) => {
    const order = await db.Order.findById(id);
    if (!order) throw 'Order Not Found';

    if (order.isAccepted === false) throw 'Order already rejected!';

    order.isAccepted = false;

    await order.save();

    return order.isAccepted
}

const acceptOrder = async (id) => {
    const order = await db.Order.findById(id);
    if (!order) throw 'Order Not Found';

    if (order.isAccepted === true) throw 'Order already accepted!';

    order.isAccepted = true;

    await order.save();

    return order.isAccepted;
}

const setStatusDelivered = async (id) => {
    const order = await db.Order.findById(id);
    if (!order) throw 'Order Not Found';

    if (order.status == 'delivered') throw 'Order already delivered!';

    order.status = 'delivered';

    await order.save();

    return order;
}

const getNearbyBranch = async (AddressId) => {

    const address = await db.Address.findById(AddressId);
    if (!address) throw 'Address Not Found'

    db.Branch.Branch.createIndexes({ location: "2dsphere" });
    db.Address.createIndexes({ location: "2dsphere" });

    return db.Branch.Branch.find({
        location: {
            $near: {
                $geometry: {
                    type: address.label,
                    coordinates: address.coordinates
                },
                $minDistance: 1000,
                $maxDistance: 5000, // max distance of 5 Km radius
            }
        }
    })

}


module.exports = {
    create,
    update,
    delete: _delete,
    getOrder,
    getAllOrders,
    rejectOrder,
    acceptOrder,
    setStatusDelivered,
    getNearbyBranch,
}