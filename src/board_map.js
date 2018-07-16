import React from 'react'

export default class Board_map extends React.Component {
    constructor(kv_pairs = []) {
        super()
        this.coordinates = {}  // stores coordinates

        for(let pair of kv_pairs) {
            let [key, value] = pair
            let value_is_array = Array.isArray(value)
            let value_is_object = value.constructor.name === 'Object'

            if(value === undefined) {
                continue
            }

            if(value_is_array) {
                let value_array_is_empty = value.length === 0
                let value_array_has_only_zero_values = value.every(tile => tile.value === 0)

                if(value_array_is_empty || value_array_has_only_zero_values) {
                    continue
                }
            }

            if(value_is_object && value.value === 0) {
                continue
            }

            this.set(key, value)
        }

    }

    getContents() {
        return this.coordinates
    }

    getSortedKeys() {
        return Object.keys(this.coordinates).sort()
    }

    get(key) {
        // returns the array of all tiles at this coordinate
        return this.coordinates[this.stringify(key)]
    }

    set(key, value) {
        // adds the value to coordinate's content list
        // updates value by id if exists

        let contents = this.coordinates[this.stringify(key)]

        if(Array.isArray(value)) {
            return this.coordinates[this.stringify(key)] = value
        }

        if(contents !== undefined) {
            let same_id = contents.filter(tile => tile.id === value.id)
            if(same_id.length) {
                let updated = same_id[0]
                updated = Object.assign(updated, value)
                let not_same_id = contents.filter(tile => tile.id !== value.id)
                this.coordinates[this.stringify(key)] = [...not_same_id, updated]
            }
            else {
                this.coordinates[this.stringify(key)] = [...contents, value]
            }
        }
        else {
            return this.coordinates[this.stringify(key)] = [value]
        }
    }

    delete(key) {
        return delete this.coordinates[this.stringify(key)]
    }

    tiles_to_string(tiles, properties_to_compare = [], ignore_tiles_with_props = []) {
        let coordinate_list = []
        for(let tile of tiles) {
            let tile_list = []
            let sorted_properties = properties_to_compare.sort()
            let add_tile = true
            for(let key in tile) {
                if(ignore_tiles_with_props.length > 0 && ignore_tiles_with_props.includes(key)) {
                    add_tile = false
                }
                if(sorted_properties.length > 0 && !sorted_properties.includes(key)) {
                    continue
                }
                tile_list.push(`${key}: ${tile[key]}`)
            }

            if(add_tile) {
                coordinate_list.push(tile_list.join(', '))
            }
        }

        let output = '[{' + coordinate_list.join('}, {') + '}]'
        return output
    }

    stringify(kv_pairs) {
        if(typeof kv_pairs === 'string') {
            // good luck chuck
            return kv_pairs
        }

        let stringified = '['
        let keys = Object.keys(kv_pairs).sort()
        keys.forEach(key => {
            stringified += `{"${key}":${kv_pairs[key]}},`
        })

        // remove trailing comma and close array
        stringified = stringified.slice(0, stringified.length - 1) + ']'

        return stringified
    }

    unStringify(coordinate_string) {
        return JSON.parse(coordinate_string)
    }

    getCoordinatesFromKey(key) {
        let raw_coordinates = this.unStringify(key)
        let coordinates = {}
        raw_coordinates.forEach(obj => {
            Object.assign(coordinates, obj)
        })
        return coordinates
    }

    toString(properties_to_compare = [], ignore_tiles_with_props = []) {
        let pairs = []
        let keys = this.getSortedKeys()
        for(let coordinate of keys) {
            let tiles = this.get(coordinate)
            let stringified_tiles = this.tiles_to_string(tiles, properties_to_compare, ignore_tiles_with_props)
            pairs.push(`[${coordinate}: ${stringified_tiles}`)
        }
        return pairs.join('], ') + ']'
    }

    equals(other, properties_to_compare = [], ignore_tiles_with_props = []) {
        if(other.toString(properties_to_compare, ignore_tiles_with_props) ===
            this.toString(properties_to_compare, ignore_tiles_with_props)) {
            return true
        }

        return false
    }
}