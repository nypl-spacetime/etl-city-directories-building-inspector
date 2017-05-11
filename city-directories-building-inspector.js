const fs = require('fs')
const path = require('path')
const H = require('highland')

const cityDirectoriesDataset = 'city-directories'
const addressesDataset = 'building-inspector-nyc-streets'

function ndjsonStream(filename) {
  return H(fs.createReadStream(filename))
    .split()
    .compact()
    .map(JSON.parse)
}

function transform (config, dirs, tools, callback) {
  const cityDirectoriesNdjson = path.join(dirs.getDir(cityDirectoriesDataset, 'transform'), `${cityDirectoriesDataset}.objects.ndjson`)
  const addressesNdjson = path.join(dirs.getDir(addressesDataset, 'transform'), `${addressesDataset}.objects.ndjson`)

  let cache = {}

  ndjsonStream(addressesNdjson)
    .each((object) => {
      cache[object.name] = object.id
    })
    .stopOnError(callback)
    .done(() => {
      console.log(`      Cached all addresses`)

      ndjsonStream(cityDirectoriesNdjson)
        .map((object) => {
          const addressId = cache[object.data.address]
          if (addressId) {
            return {
              type: 'relation',
              'obj': {
                from: `${cityDirectoriesDataset}/${object.id}`,
                to: `${addressesDataset}/${addressId}`,
                type: 'st:in'
              }
            }
          } else {
            return {
              type: 'log',
              'obj': {
                found: false,
                id: object.id,
                address: object.data.address
              }
            }
          }
        })
        .compact()
        .flatten()
        .map(H.curry(tools.writer.writeObject))
        .nfcall([])
        .series()
        .stopOnError(callback)
        .done(callback)
    })
}

// ==================================== Steps ====================================

module.exports.steps = [
  transform
]

