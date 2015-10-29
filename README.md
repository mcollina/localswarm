# localswarm

[![build status](http://img.shields.io/travis/mcollina/localswarm.svg?style=flat)](http://travis-ci.org/mcollina/localswarm)


Network swarm that automagically discovers other peers on the same host using a unix socket and tcp ports. It offers the same API of [localswarm](http://npm.im/localswarm).

```
npm install localswarm --save
```

## Usage

``` js
var localswarm = require('localswarm')

localswarm('testing', function (sock) {
  sock.write('hello world (' + process.pid + ')\n')
  sock.pipe(process.stdout)
})
```

If you run the above program in a couple of processes on the same local network
the swarms should start connecting to each other and write hello world

## API

#### `swarm = localswarm(name, [options], [onpeer])`

Create a new swarm. The `swarm` will emit `peer` everytime a new peer
is connected. Optionally you can pass a `peer` listener as the second argument.

The `peer` will be a tcp stream to another swarm.

#### `swarm.peers`

An array containing all the currently connected peers

## License

MIT

