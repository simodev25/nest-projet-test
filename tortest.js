var tr = require('tor-request');
var zlib = require("zlib");
tr.TorControlPort.password = "PASSWORD"
requestIP();


tr.setTorAddress('127.0.0.1', 9051);


requestIP();
tr.newTorSession( (err) =>
{

  requestIP();
  return;
});


function requestIP() {
  var gunzip = zlib.createGunzip();
  var buffer = [];
  tr.request({
    url: 'https://www.amazon.com/s?k=Tablets',
    strictSSL: true,
    agentClass: require('socks5-https-client/lib/Agent'),
    gzip: true,
    agentOptions: {
      socksHost: 'my-tor-proxy-host', // Defaults to 'localhost'.
      socksPort: 9050, // Defaults to 1080.
      // Optional credentials
    //  socksUsername: 'proxyuser',
    //  socksPassword: 'p@ssw0rd',
    }
  }, function(err, res) {
    console.log(err || res.body);
  }).pipe(gunzip)

  gunzip.on('data', function(data) {
    // decompression chunk ready, add it to the buffer
    buffer.push(data.toString())

  }).on("end", function() {
    // response and decompression complete, join the buffer and return
    console.log( buffer.join(""));

  }).on("error", function(e) {
    console.log(e);
  })

}
