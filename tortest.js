var tr = require('tor-request');
var zlib = require('zlib');
tr.TorControlPort.password = 'PASSWORD';
requestIP();


tr.setTorAddress('tcpproxy', 9055);


requestIP();


function requestIP() {
  var gunzip = zlib.createGunzip();
  var buffer = [];
  tr.request({
    url: 'https://api.myip.com',
    // strictSSL: true,
    //  agentClass: require('socks5-https-client/lib/Agent'),
    headers: {
      'accept-encoding': 'gzip',
    },

  }, function(error, res, body) {

    if (!error && response.statusCode == 200) {
      // If response is gzip, unzip first
      var encoding = response.headers['content-encoding']
      if (encoding && encoding.indexOf('gzip') >= 0) {
        zlib.gunzip(body, function(err, dezipped) {
          var json_string = dezipped.toString('utf-8');
          var json = JSON.parse(json_string);
          console.log(json)
        });
      } else {
         console.log(body)
      }
    }

  }).on('error', function(e) {
    console.log("error",e);
  });

}
