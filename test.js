'use strict'

var tape = require('tape')
var localswarm = require('./')

tape('connects and close', function (t) {
  t.plan(5)

  var once1 = true
  var once2 = true

  var s1 = localswarm('testing--' + process.pid, function (sock) {
    t.ok(once1, 'got socket s1')
    once1 = false
    sock.on('data', function (data) {
      t.same(data.toString(), '+')
      s1.close(t.pass.bind(t))
      s2.close(t.pass.bind(t))
    })
  })

  var s2 = localswarm('testing--' + process.pid, function (sock) {
    t.ok(once2, 'got socket s2')
    once2 = false
    sock.write('+')
  })
})
