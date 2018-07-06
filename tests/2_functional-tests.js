/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

const clearIpTable = symbol => new Promise((resolve, reject) => {
  chai.request(server)
  .get('/api/cleariptable')
  .query({stock: symbol})
  .end(function(err) {
    if(err) return reject(err);
    resolve();
  })
});

suite('Functional Tests', function() {
  this.timeout(15000);
    
  suite('GET /api/stock-prices => stockData object', function() {

    test('1 stock', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({stock: 'goog'})
      .end(function(err, res) {
        assert.equal(err, null, "err is not null");
        assert.equal(res.status, 200, "res status with error");
        assert.equal(typeof res.body.stockData, "object", "no stockData prop in res body");
        assert.equal(typeof res.body.stockData.price, "string", "no price prop in stockData");
        assert.equal(typeof res.body.stockData.stock, "string", "no stock prop in stockData");
        assert.equal(typeof res.body.stockData.likes, "number", "no stock prop in stockData");          
        return done();
      });
    });

    test('1 stock with like', function(done) {
      const symbol = 'goog';
      clearIpTable(symbol)
      .then(() => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: symbol, like: true })
        .end(function(err, res) {
          assert.equal(err, null, "err is not null");
          assert.equal(res.status, 200, "res status with error");
          assert.equal(typeof res.body.stockData, "object", "no stockData prop in res body");
          assert.equal(typeof res.body.stockData.price, "string", "no price prop in stockData");
          assert.equal(typeof res.body.stockData.stock, "string", "no stock prop in stockData");
          assert.equal(typeof res.body.stockData.likes, "number", "no stock prop in stockData");
          assert.notEqual(res.body.stockData.likes, 0, "no stock prop in stockData");
          return done();
        });
      });
    });
    
    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      const symbol = 'goog';
      clearIpTable(symbol)
      .then(() => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: symbol, like: true })
        .end(function(err, res) {
          assert.equal(err, null, "err is not null");
          assert.equal(res.status, 200, "res status with error");
          assert.equal(typeof res.body.stockData, "object", "no stockData prop in res body");
          assert.equal(typeof res.body.stockData.price, "string", "no price prop in stockData");
          assert.equal(typeof res.body.stockData.stock, "string", "no stock prop in stockData");
          assert.equal(typeof res.body.stockData.likes, "number", "no stock prop in stockData");
          const oldLikes = res.body.stockData.likes;
          chai.request(server)
          .get('/api/stock-prices')
          .query({ stock: symbol, like: true })
          .end(function(err, res) {
            assert.equal(err, null, "err is not null");
            assert.equal(res.body.stockData.likes, oldLikes, "liking didn't increaase the like count");
            return done();
          });
        });
      });
    });

    test('2 stocks', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['goog', 'msft'] })
      .end(function(err, res) {
        assert.equal(err, null, "err is not null ");
        assert.equal(res.status, 200, "res status with error");
        assert.equal(res.body.stockData.constructor, Array, "stockData wrong type");
        res.body.stockData.forEach(s => {
          assert.equal(typeof s.price, "string", "no price prop in stockData");
          assert.equal(typeof s.stock, "string", "no stock prop in stockData");
          assert.equal(typeof s.rel_likes, "number", "no stock prop in stockData");          
        })
        return done();
      });
    });
    
    test('2 stocks with like', function(done) {
      clearIpTable(['goog', 'msft'])
      .then(() => {
        chai.request(server)
        .get('/api/stock-prices')
        .query({ stock: ['goog', 'msft'], like: true })
        .end(function(err, res) {
          assert.equal(err, null, "err is not null");
          assert.equal(res.status, 200, "res status with error");
          assert.equal(Array.isArray(res.body.stockData), true, "stockData wrong type");
          res.body.stockData.forEach(s => {
            assert.equal(typeof s.price, "string", "no price prop in stockData");
            assert.equal(typeof s.stock, "string", "no stock prop in stockData");
            assert.equal(typeof s.rel_likes, "number", "no stock prop in stockData");          
          })
          return done();
        });
      });  
    });
  });
});
