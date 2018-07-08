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

const DELAY_MS = 10000;

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

const delay = ms => (
  new Promise((resolve, reject) => {
    console.log(`Waiting... (${ms})`)
    setTimeout(() => {
     resolve(); 
    }, ms)
  })
);

/**
 * Had to add delays to tests cuz AlphaVantage call volume on the free tier is very limited
 */

suite('Functional Tests', function() {
  this.timeout(20000);
    
  suite('GET /api/stock-prices => stockData object', function() {

    test('1 stock', function(done) {
      delay(DELAY_MS)
      .then( () => {
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
          assert.equal(true, true);        
          return done();
        });
      })
    });

    test('1 stock with like', function(done) {
      const symbol = 'goog';
      delay(DELAY_MS)
      .then( () => {
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
            assert.equal(true, true);
            return done();
          });
        });
      });
    });
    
    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      const symbol = 'goog';
      delay(DELAY_MS)
      .then( () => {
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
              assert.equal(true, true);
              return done();
            });
          });
        });
      });
    });

    test('2 stocks', function(done) {
      delay(DELAY_MS)
      .then( () => {
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
          assert.equal(true, true);
          return done();
        });
      });
    });
    
    test('2 stocks with like', function(done) {
      delay(DELAY_MS)
      .then( () => {
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
            });
            assert.equal(true, true);
            return done();
          });
        });
      });
    });
  });
});
