import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// import { userService } from './services/user.service.js'
import { loggerService } from './services/logger.service.js';

const app = express()

app.use(cookieParser()) // for res.cookies
app.use(express.json()) // for req.body
app.use(express.static('public'))

if (process.env.NODE_ENV === 'production') {
    // Express serve static files on production environment
    app.use(express.static(path.resolve(__dirname, 'public')))
    console.log('__dirname: ', __dirname)
} else {
    // Configuring CORS
    const corsOptions = {
        // Make sure origin contains the url your frontend is running on
        origin: ['http://127.0.0.1:5173', 'http://localhost:5173','http://127.0.0.1:3030', 'http://localhost:3030'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

import { toyRoutes } from './api/toy/toy.routes.js';

app.use('/api/toy', toyRoutes)

const port = process.env.PORT || 3030

app.listen(port, () => {
    loggerService.info(`Server listening on port http://127.0.0.1:${port}/`)
})
// const __dirname = dirname(fileURLToPath(import.meta.url));
// const app = express()
// // App Configuration
// const corsOptions = {
//     origin: [
//         'http://127.0.0.1:3030',
//         'http://localhost:3030',
//         'http://127.0.0.1:5173',
//         'http://localhost:5173',
//     ],
//     credentials: true
// }

// app.use(cors(corsOptions))

// **************** Toys API ****************:
// List
// app.get('/api/toy', (req, res) => {
//     const { txt, maxPrice } = req.query
//     const filterBy = { txt, maxPrice: +maxPrice }
//     detoyService.query(filterBy)
//         .then(toys => {
//             res.send(toys)
//         })
//         .catch(err => {
//             loggerService.error('Cannot load toys', err)
//             res.status(400).send('Cannot load toys')
//         })
// })

// // Add
// app.post('/api/toy', (req, res) => {
//     // const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     // if (!loggedinUser) return res.status(401).send('Cannot add toy')
//     const { name, price, labels, inStock, createdAt } = req.body

//     const toy = {
//         name,
//         price: +price,
//         labels,
//         inStock,
//         createdAt
//     }
//     detoyService.save(toy)
//         .then(savedCar => {
//             res.send(savedCar)
//         })
//         .catch(err => {
//             loggerService.error('Cannot add toy', err)
//             res.status(400).send('Cannot add toy')
//         })
// })

// // Edit
// app.put('/api/toy', (req, res) => {
//     // const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     // if (!loggedinUser) return res.status(401).send('Cannot update toy')

//     const { name, price, labels, inStock, createdAt, _id } = req.body

//     const toy = {
//         name,
//         price: +price,
//         labels,
//         inStock,
//         createdAt,
//         _id
//     }
//     detoyService.save(toy)
//         .then((savedCar) => {
//             res.send(savedCar)
//         })
//         .catch(err => {
//             loggerService.error('Cannot update toy', err)
//             res.status(400).send('Cannot update toy')
//         })

// })

// // Read - getById
// app.get('/api/toy/:toyId', (req, res) => {
//     const { toyId } = req.params
//     detoyService.get(toyId)
//         .then(toy => {
//             // toy.msgs =['HEllo']
//             res.send(toy)
//         })
//         .catch(err => {
//             loggerService.error('Cannot get toy', err)
//             res.status(400).send(err)
//         })
// })

// // Remove
// app.delete('/api/toy/:toyId', (req, res) => {
//     // const loggedinUser = userService.validateToken(req.cookies.loginToken)
//     // if (!loggedinUser) return res.status(401).send('Cannot delete toy')

//     const { toyId } = req.params
//     detoyService.remove(toyId)
//         .then(msg => {
//             res.send({ msg, toyId })
//         })
//         .catch(err => {
//             loggerService.error('Cannot delete toy', err)
//             res.status(400).send('Cannot delete toy, ' + err)
//         })
// })


// **************** Users API ****************:
app.get('/api/auth/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => {
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot get user', err)
            res.status(400).send('Cannot get user')
        })
})

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            const token = userService.getLoginToken(user)
            res.cookie('loginToken', token)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot login', err)
            res.status(401).send('Not you!')
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            const token = userService.getLoginToken(user)
            res.cookie('loginToken', token)
            res.send(user)
        })
        .catch(err => {
            loggerService.error('Cannot signup', err)
            res.status(401).send('Nope!')
        })
})


app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


app.put('/api/user', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('No logged in user')
    const { diff } = req.body
    if (loggedinUser.score + diff < 0) return res.status(400).send('No credit')
    loggedinUser.score += diff
    return userService.save(loggedinUser).then(user => {
        const token = userService.getLoginToken(user)
        res.cookie('loginToken', token)
        res.send(user)
    })
})


app.get('/**', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})



// Listen will always be the last line in our server!