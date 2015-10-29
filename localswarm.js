'use strict'

var leader = require('unix-socket-leader')
var nos = require('net-object-stream')
var eos = require('end-of-stream')
var fullyConnectedTopology = require('fully-connected-topology')

function localswarm (name, opts, fn) {
  if (typeof opts === 'function') return localswarm(name, null, opts)
  if (!opts) opts = {}

  var transport = leader(name)
  var topology = fullyConnectedTopology()
  var client

  topology.listen(0, 'localhost')
  topology.me = 'localhost:' + topology.server.address().port

  var mainStream = nos.encoder()
  var peers = []
  var closed = false

  transport.on('leader', function () {
    var sockets = []
    transport.on('connection', function (sock) {
      sock.unref()
      var instance = nos(sock)

      mainStream.pipe(sock, { end: false })

      eos(sock, function () {
        sockets.splice(sockets.indexOf(instance), 1)
      })

      sockets.forEach(function (sock) {
        instance.write(sock.data)
      })

      instance.once('data', function (msg) {
        instance.data = msg
        sockets.push(instance)
        mainStream.write(msg)
      })
    })
  })

  transport.on('client', function (stream) {
    // we need to query the other peer
    client = nos(stream)

    client.write(topology.me)

    client.on('data', addPeer)
  })

  function addPeer (peer) {
    topology.add(peer)
  }

  topology.on('connection', function (stream) {
    if (closed) {
      return stream.destroy()
    }

    peers.push(stream)

    eos(stream, function () {
      peers.splice(peers.indexOf(stream), 1)
    })

    topology.emit('peer', stream)
  })

  if (fn) topology.on('peer', fn)

  topology.close = function (cb) {
    closed = true

    peers.forEach(function (peer) {
      peer.unref()
    })

    transport.close(cb)
    topology.destroy()

    if (client) {
      client.destroy()
    }
  }

  return topology
}

module.exports = localswarm
