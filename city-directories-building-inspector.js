const fs = require('fs')
const path = require('path')
const H = require('highland')
const R = require('ramda')

const DATASETS = {
  cityDirectories: 'city-directories',
  addresses: 'building-inspector-nyc-streets'
}

function ndjsonStream (filename) {
  return H(fs.createReadStream(filename))
    .split()
    .compact()
    .map(JSON.parse)
}

function transform (config, dirs, tools, callback) {
  const cityDirectoriesNdjson = path.join(dirs.getDir(DATASETS.cityDirectories, 'transform'), `${DATASETS.cityDirectories}.objects.ndjson`)
  const addressesNdjson = path.join(dirs.getDir(DATASETS.addresses, 'transform'), `${DATASETS.addresses}.objects.ndjson`)

  let cache = {}
  let count = 0

  ndjsonStream(addressesNdjson)
    .each((object) => {
      count += 1
      cache[object.name] = {
        id: object.id,
        geometry: object.geometry
      }
    })
    .stopOnError(callback)
    .done(() => {
      console.log(`      Cached ${count} addresses`)

      ndjsonStream(cityDirectoriesNdjson)
        .map((object) => {
          const addresses = object.data.addresses || []

          const logs = []
          const objectsAndRelations = []

          const matchedAddresses = addresses
            .map((address) => {
              const matchedAddress = cache[address]

              if (!matchedAddress) {
                logs.push({
                  found: false,
                  id: object.id,
                  address
                })
              }

              return matchedAddress
            })
            .filter(R.identity)

          if (matchedAddresses.length) {
            const cityDirectoryObjectId = `${DATASETS.cityDirectories}/${object.id}`

            let geometry
            if (matchedAddresses.length === 1) {
              geometry = matchedAddresses[0].geometry
            } else {
              geometry = {
                type: 'MultiPoint',
                coordinates: matchedAddresses.map((matchedAddress) => matchedAddress.geometry.coordinates)
              }
            }

            objectsAndRelations.push([
              {
                type: 'object',
                obj: {
                  id: object.id,
                  type: 'st:Person',
                  geometry
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
              ...matchedAddresses.map((matchedAddress) => ({
                type: 'relation',
                'obj': {
                  from: cityDirectoryObjectId,
                  to: `${DATASETS.addresses}/${matchedAddress.id}`,
                  type: 'st:in'
                }
              }))
            ])
          }

          return [
            ...objectsAndRelations,
            ...logs.map((log) => ({
              type: 'log',
              obj: log
            }))
          ]
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

