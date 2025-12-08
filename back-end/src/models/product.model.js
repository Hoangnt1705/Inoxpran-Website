'use strict'

const { refreshToken } = require('firebase-admin/app');
const { Schema, model } = require('mongoose'); // Erase if already required


const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: { type: String, required: true },
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    prodct_type: { type: String, required: true, enum: ['Electronics'] },
    product_shop: String,
    product_attributes: { type: Object, required: true },
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})
// define the product type = clothing

const clothingSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String
}, {
    collection: 'Clothes',
    timestamps: true
});
// define the product type = Electronics

const electronicSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String
}, {
    collection: 'Electronics',
    timestamps: true
});


module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronic', electronicSchema),
    clothing: model('Clothing', clothingSchema),
}