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
      cache[object.name] = {
        id: object.id,
        geometry: object.geometry
      }
    })
    .stopOnError(callback)
    .done(() => {
      console.log(`      Cached all addresses`)

      ndjsonStream(cityDirectoriesNdjson)
        .map((object) => {
          const address = cache[object.data.address]
          if (address) {
            const cityDirectoryObjectId = `${cityDirectoriesDataset}/${object.id}`

            return [
              {
                type: 'object',
                obj: {
                  id: object.id,
                  type: 'st:Person',
                  geometry: address.geometry
                }
              },
              {
                type: 'relation',
                obj: {
                  from: object.id,
                  to: cityDirectoryObjectId,
                  type: 'st:sameAs'
                }
              },
              {
                type: 'relation',
                'obj': {
                  from: cityDirectoryObjectId,
                  to: `${addressesDataset}/${address.id}`,
                  type: 'st:in'
                }
              }
            ]
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

