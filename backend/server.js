const express = require('express')
const cors = require('cors')
const path = require('path')
const Yup = require('yup')

const PORT = process.env.PORT || 9009
const server = express()

server.use(express.json())
server.use(express.static(path.join(__dirname, '../dist')))
server.use(cors())

let id = 1
const getNextId = () => id++
let books = [
  {
    id: getNextId(),
    title: "Midnight's Children",
    author: "Salman Rushdie",
    finished: false
  },
  {
    id: getNextId(),
    title: "Hyperion",
    author: "Dan Simmons",
    finished: true
  },
  {
    id: getNextId(),
    title: "The Vampire Lestat",
    author: "Anne Rice",
    finished: true
  },
]

server.get('/api/books', (_, res) => {
  res.json(books)
})

server.delete('/api/books/:id', (req, res, next) => {
  const book = books.find(bk => bk.id == req.params.id)
  if (!book) {
    return next({ status: 404, message: 'Book not found' })
  }
  books = books.filter(bk => bk.id != req.params.id)
  res.json(book)
})

const putSchema = Yup.object().shape({
  title: Yup.string().nullable().min(3),
  author: Yup.string().nullable().min(3),
  finished: Yup.boolean().nullable(),
})
  .test(
    'at-least-one-field',
    'Provide properties to update',
    function (obj) {
      return obj.title != null ||
        obj.author != null ||
        obj.finished != null
    }
  )

server.put('/api/books/:id', async (req, res, next) => {
  const book = books.find(bk => bk.id == req.params.id)
  if (!book) {
    return next({ status: 404, message: 'Book not found' })
  }
  try {
    const {
      title,
      author,
      finished,
    } = await putSchema.validate(req.body, { stripUnknown: true })
    if (title) book.title = title
    if (author) book.author = author
    if (finished != undefined) book.finished = finished
    res.json(book)
  } catch ({ message }) {
    return next({ status: 422, message })
  }
})

const postSchema = Yup.object().shape({
  title: Yup.string().required('`title` required').min(3, 'Title too short'),
  author: Yup.string().required('`author` required').min(3, 'Author name too short'),
  finished: Yup.boolean().nullable(),
})

server.post('/api/books', async (req, res, next) => {
  try {
    const {
      title,
      author,
      finished,
    } = await postSchema.validate(req.body, { stripUnknown: true })
    const newBook = { id: getNextId(), title, author, finished: finished ?? false }
    books.push(newBook)
    res.status(201).json(newBook)
  } catch ({ message }) {
    return next({ status: 422, message })
  }
})

server.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

server.use((req, res) => {
  res.status(404).json({
    message: `Endpoint [${req.method}] ${req.path} does not exist`,
  })
})

server.use((err, req, res, next) => {
  const message = err.message || 'Unknown error happened'
  const status = err.status || 500
  const reason = err.reason
  const payload = { message }
  if (reason) payload.reason = reason
  res.status(status).json(payload)
})

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})
