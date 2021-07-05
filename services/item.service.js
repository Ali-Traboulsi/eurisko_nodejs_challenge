const multer = require('multer');
const path = require('path');
const db = require('_helpers/db');

// defing storage for media upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'ItemUploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split('.').slice(0, -1).join('.') + '_' + Date.now() + path.extname(file.originalname))
    }
});

// uplaod Item image
const upload = multer({
    storage: storage,
    limits : {
        fileSize: 1000000 // max file size set to 1 MB
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpeg|jpg|png|xvg)$/)) {
            cb(new Error('only upload files with jpg, jpeg, png, xvg formats'));
        }
        cb(undefined, true); // continue to upload
    }
});

const create = async (params) => {
    // validate if already created
    if (await db.Item.findOne({name: params.body.name})) {
        throw `Item already created!`
    }

    const item = new db.Item({
        name: params.body.name,
        price: params.body.price,
        description: params.body.description,
        itemImage: params.file.filename,
        category: params.body.id
    });


    await item.save();

    return item;

}

// update
const update = async (id, params) => {
    const item = await db.Item.findById(id);
    if (!item) throw 'Item Not Found';

    if (item.name !== params.body.name || item.catImage !== params.file.filename || item.price != params.body.price || item.description != params.body.description || item.category !== params.body.category) {
        item.name = params.body.name;
        item.itemImage = params.file.filename;
        item.price = params.body.price;
        item.description = params.body.description;
        item.category = params.body.category;
    }


    Object.assign(item, params);

    await item.save();

    return item;
}

const _delete = async (id) => {
    const item = await db.Item.findById(id);
    await item.remove();
}

const getItem = async (id) => {
    const item = await db.Item.findById(id);
    if (!item) throw 'Item Not Found'
    return item
}

const getAllItems = async () => {
    const items = await db.Category.find();
    if (!items) throw 'No Items Found';
    return items
}



module.exports = {
    create,
    upload,
    update,
    delete: _delete,
    getItem,
    getAllItems,
}