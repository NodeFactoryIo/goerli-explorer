var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');
var format = require('../utils/blockformatter.js')

var Api = require('@parity/api')

router.get('/:block', function(req, res, next) {

  //get 
  
  var config = req.app.get('config');  

  const provider = new Api.Provider.Http(config.rpc.parity);
  const api = new Api(provider);

  const provider2 = new Api.Provider.Http(config.rpc.pantheon);
  const api2 = new Api(provider2);

  Promise
  .all([
    api2.eth.getBlockByNumber(req.params.block, true),
    api.trace.block(req.params.block)
  ])
  .then(([block, traces]) => {
    if (!block) {
        return next({name : "BlockNotFoundError", message : "Block not found!"});
    }

  
    
    block.transactions.forEach(function(tx) {
      tx.traces = [];
      tx.failed = false;
      if (traces != null) {
        traces.forEach(function(trace) {
          if (tx.hash === trace.transactionHash) {
            tx.traces.push(trace);
            if (trace.error) {
              tx.failed = true;
              tx.error = trace.error;
            }
          }
        });
      }
      // console.log(tx);
    });

    block = format(block)
    block.signerName = config.names[block.signer];

    res.render('block', { block: block });    

  });
  
});

router.get('/uncle/:hash/:number', function(req, res, next) {
  
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3.setProvider(config.provider);
  
  async.waterfall([
    function(callback) {
      web3.eth.getUncle(req.params.hash, req.params.number, true, function(err, result) {
        callback(err, result);
      });
    }, function(result, callback) {
      if (!result) {
        return next({name : "UncleNotFoundError", message : "Uncle not found!"});
      }

      callback(null, result);
    }
  ], function(err, uncle) {
    if (err) {
      return next(err);
    }
     
    
    
    res.render('uncle', { uncle: uncle, blockHash: req.params.hash });
  });
  
});

module.exports = router;
