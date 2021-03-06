var format = require('../utils/blockformatter.js')

var express = require('express');
var router = express.Router();
var Api = require('@parity/api')
var format = require('../utils/blockformatter.js')

router.get('/', function(req, res, next) {
  
  var config = req.app.get('config');  

  const provider = new Api.Provider.Http(config.rpc.pantheon);
  const api = new Api(provider);

  api.eth.getBlockByNumber('latest', true).then((lastBlock) => {
   
      var jobs = []
      
      
      var blockCount = 10;
      
      if (lastBlock.number - blockCount < 0) {
        blockCount = lastBlock.number + 1;
      }

      for (var i = 0; i < blockCount; i++) {
        jobs.push(api.eth.getBlockByNumber(lastBlock.number - i))
      };

      Promise.all(jobs).then(blocks => { 
        var txs = [];
        blocks.forEach(function(block) {
          block.transactions.forEach(function(tx) {
            if (txs.length === 10) {
              return;
            }
            
            txs.push(tx);
           
            
          });
          block = format(block)
        });
        
        res.render('index', { blocks: blocks, txs: txs });
      })
  })

});

module.exports = router;
