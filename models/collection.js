const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  products: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('Collection', collectionSchema);
