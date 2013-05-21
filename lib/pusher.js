module.exports = (function(){
  var crypto = require('crypto'),
      request = require('request')
      util = require('util');

  var Pusher = function(options) {
    this.options = options;
    return this;
  }

  Pusher.prototype.domain = 'api.pusherapp.com';

  Pusher.prototype.channel = function(channel) {
    if(typeof channel === 'undefined') return this.options.channel;
    this.options.channel = channel;

    return this;
  }

  Pusher.prototype.trigger = function(event, data, callback) {
    this.event = event;
    this.options.endpoint = '/events';
    this.options.method   = 'POST';
    this.data  = data;  
    this.execute(callback);
  }

  Pusher.prototype.stats = function(callback) {
    this.options.endpoint = '/stats';
    this.data = '';
    this.options.method = 'GET';
    this.execute(callback);
  }

  Pusher.prototype.execute = function(callback) {
    var options = {
      url: this.fullUri(),
      method: this.options.method,
      json: this.data
    }
    request(options, callback);
  }

  Pusher.prototype.fullUri = function() {
    return 'http://' + this.domain + this.path()
  }

  Pusher.prototype.path = function() {
    return this.uri() + '?' + this.queryString() + '&auth_signature=' + this.signature();
  }

  Pusher.prototype.uri = function() {
    return '/apps/' + this.options.appId + '/channels/' + this.options.channel + this.options.endpoint;
  }

  Pusher.prototype.queryString = function() {
    var timestamp = parseInt(new Date().getTime() / 1000);

    return [
      'auth_key=',        this.options.appKey,
      '&auth_timestamp=', timestamp,
      '&auth_version=',   '1.0',
      '&body_md5=',       this.hash(),
      '&name=',           this.event
    ].join('');
  }

  Pusher.prototype.hash = function() {
    var md5_hash;
    if (this.data === '') {
      md5_hash = crypto.createHash('md5').update('').digest("hex");
    } else {
      md5_hash = crypto.createHash('md5').update(JSON.stringify(this.data)).digest("hex");
    }
    return md5_hash
  }

  Pusher.prototype.signature = function(uri, queryString) {
    var signData = [this.options.method, this.uri(), this.queryString()].join('\n');

    return crypto.createHmac('sha256', this.options.secret).update(signData).digest('hex');
  }

  return Pusher;
})();
