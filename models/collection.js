const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const collectionSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  products: {
      type: Array,
      required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Collection', collectionSchema);
