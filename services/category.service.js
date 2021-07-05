const multer = require('multer');
const path = require('path');
const db = require('_helpers/db');

// defing storage for media upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'catUploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.split('.').slice(0, -1).join('.') + '_' + Date.now() + path.extname(file.originalname))
    }
});

// uplaod cat image
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
    if (await db.Category.findOne({name: params.body.name})) {
        throw `Category already created!`
    }

    const category = new db.Category(params.body);

    category.name = params.body.name

    // uplaod category image
    const Imagefile = params.file.buffer;
    category.catImage = params.file.filename;

    await category.save();

    return category;

}

const getCat = async (id) => {
    const category = await db.Category.findById(id);
    if (!category) throw 'Category Not Found'
    return category
}

const getAllCat = async () => {
    const categories = await db.Category.find();
    if (!categories) throw 'No Categories Found';
    return categories
}

const update = async (id, params) => {
    const category = await db.Category.findById(id);
    if (!category) throw 'Category Not Found';

    if (category.name !== params.body.name) {
        category.name = params.body.name;
    }

    if (category.catImage !== params.file.filename) {
        category.catImage = params.file.filename;
    }

    Object.assign(category, params);

    await category.save();

}


const _delete = async (id) => {
    const category = await db.Category.findById(id);
    await category.remove();
}


module.exports = {
    create,
    upload,
    getCat,
    getAllCat,
    update,
    delete: _delete,
}