/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
var expect = require('chai').expect;
var MongoClient = require('mongodb');
var alpha = require('alphavantage')({ key: process.env.API_KEY });

var Stock = require('../models/stock');
/* 
const CONNECTION_STRING = process.env.DB;
MongoClient.connect(CONNECTION_STRING, function(err, db) {
  if(err) throw err;
  console.log("Connected to DB succesfully");
})
 */


module.exports = function (app) {

  app.route('/api/stock-prices')
    .get((req, res) => {
      /* const ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim();
      console.log("IP", ip); */
      const { stock, like } = req.query;
      if(!stock) return res.sendStatus(400);
      alpha.data.batch(typeof stock === "array" ? stock : [ stock ] )
      .then(data => {
        let stockData = data["Stock Quotes"];
        if (stockData.length===0) return res.status(400).send("Bad request. Invalid stock ticker.");

        Promise.all(stockData.map( s =>  Stock.findOneOrCreateBySymbol(s["1. symbol"], s["2. price"])))
        .then( docs => {
          if(!like) {
            const stockResponse = createResponse([...docs]);
            res.json(stockResponse)
            throw Error("not liked");
          }
          return Promise.all(docs.map(doc => doc.like()))
        })
        .then( docs => {
          const stockResponse = createResponse([...docs]);
          res.json(stockResponse)
        })
        .catch(err => {
          if(err.message === "not liked") return;
          else {
            res.status(500).send("Transaction error");
          }
        })
      })
      .catch(err => {
        res.status(500).send("API error. "+err.message);
      });
    });

    function createResponse(docs) {
      if(docs.length === 2) {
        docs[0].rel_likes = docs[0].likes - docs[1].likes;
        docs[1].rel_likes = docs[1].likes - docs[0].likes;
        const stockData = docs.map(d => ({
          price: d.price,
          stock: d.symbol,
          rel_likes: d.rel_likes,
        }));
        return {
          stockData,
        };
      }
      let stockData = docs.map(d => ({
        price: d.price,
        stock: d.symbol,
        likes: d.likes,
      }))
      if (stockData.length===1) stockData = stockData[0];
      return {
        stockData,
      };
    }
    
};
