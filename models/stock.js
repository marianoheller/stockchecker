var mongoose = require('mongoose');
var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var stockSchema = new Schema({
  symbol: { type: String, required: true },
  price: { type: String, required: true },
  ips: { type: [ String ], default: [] },
  likes: { type: Number, default: 0 }
});



stockSchema.statics.findOneOrCreateBySymbol = function findOneOrCreateBySymbol(symbol, price) {
  const self = this;
  return new Promise((resolve, reject) => {
    self.findOne({ symbol }, (err, result) => {
      if(result) {
        result.price = price;
        result.save((err, doc) => {
          if(err) return reject(err);
          resolve(doc);
        })
      };
      self.create({ symbol, price }, (err, result) => {
        if(err) return reject(err);
        resolve(result);
      });
    });
  });
}

stockSchema.methods.like = function (ip) {
  return new Promise((resolve, reject) => {
    if(this.ips.find(ipOld => ipOld===ip)) return resolve(this);
    this.likes++;
    this.ips.push(ip);
    this.save((err, doc) => {
      if(err) return reject(err);
      resolve(doc);
    });
  });
}

/* stockSchema.post('save', function(doc) {
  console.log('%s has been saved', doc._id);
});
 */

var Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;