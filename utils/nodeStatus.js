var async = require('async');
var Web3 = require('web3');

var nodeStatus = function(config) {
  var self = this;
  this.conf = config;
  
  this.nbrPeers = -1;
  this.version = "";

  this.nbrPeers2 = -1;
  this.version2 = "";

  var parityProvider = new Web3.providers.HttpProvider(config.rpc.parity);
  var pantheonProvider = new Web3.providers.HttpProvider(config.rpc.pantheon);
  
  this.updateStatus = function() {
    var web3Parity = new Web3();
    web3Parity.setProvider(parityProvider);

    var web3Pantheon = new Web3();
    web3Pantheon.setProvider(pantheonProvider);
    
    async.waterfall([
      function(callback) {
        web3Parity.version.getNode(function(err, result) {
          self.version = result;
          callback(err);
        });
      }, function(callback) {
        web3Parity.net.getPeerCount(function(err, result) {
          self.nbrPeers = result;
          callback(err);
        });
      }, function(callback) {
        web3Pantheon.version.getNode(function(err, result) {
          self.version2 = result;
          callback(err);
        });
      }, function(callback) {
        web3Pantheon.net.getPeerCount(function(err, result) {
          self.nbrPeers2 = result;
          callback(err);
        });
      }
    ], function(err) {
      if (err) {
        console.log("Error updating node status:", err)
      }
      
      setTimeout(self.updateStatus, 1000 * 60 * 60);
    })
  }
  
  this.updateStatus();
}
module.exports = nodeStatus;