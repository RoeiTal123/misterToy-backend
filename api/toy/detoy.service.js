import fs from 'fs'
import { dbService } from '../../services/db.service.js'
import { utilService } from '../../services/util.service.js'
import { loggerService } from '../../services/logger.service.js'

import mongodb from 'mongodb'
const { ObjectId } = mongodb

// const toys = utilService.readJsonFile('data/toy.json')

export const detoyService = {
    query,
    get,
    remove,
    save,
    add,
    getById,
    update
}

async function query(filterBy = {}) {
    const collection = await dbService.getCollection('toyDB')
    var toys=await collection.find().toArray()
    console.log(toys)
    return toys
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy)
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toyDB')
        const toy = collection.findOne({ _id: new ObjectId(toyId) })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name : toy.name,
            price : toy.price,
            labels : toy.labels,
            inStock : toy.inStock,
            labels : toy.labels,
            createdAt : toy.createdAt
        }
        const collection = await dbService.getCollection('toyDB')
        await collection.updateOne({ _id: new ObjectId(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        loggerService.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

// function remove(toyId) {
//     const idx = toys.findIndex(toy => toy._id === toyId)
//     if (idx === -1) return Promise.reject('No Such Toy')
//     const toy = toys[idx]
//     // if (toy.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
//     toys.splice(idx, 1)
//     return _saveToysToFile()

// }

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toyDB')
        await collection.deleteOne({ _id: new ObjectId(toyId) })
    } catch (err) {
        loggerService.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

function save(toy) {
    var toy
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        // if (toyToUpdate.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.labels = toy.labels
        toyToUpdate.inStock = toy.inStock
        toyToUpdate.labels = toy.labels
        toyToUpdate.createdAt = toy.createdAt
    } else {
        // toy.owner = loggedinUser
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
    // return Promise.resolve(toy)
}

async function add(toy) {
    try {
        console.log('toy: ',toy)
        const collection = await dbService.getCollection('toyDB')
        const newToy= await collection.insertOne(toy)
        return toy
    } catch (err) {
        loggerService.error('cannot insert toy', err)
        throw err
    }
}

function _makeId(length = 5) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {

        const toysStr = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err);
            }
            console.log('The file was saved!');
            resolve()
        });
    })
}
