import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledBook = styled.li`
  text-decoration: ${props => props.$finished ? 'line-through' : 'initial'}
`

const initialForm = { title: '', author: '', finished: false }

export default function Books() {
  const [books, setBooks] = useState([])
  const [bookForm, setBookForm] = useState(initialForm)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = () => {
    fetch('/api/books')
    .then(res => {
      if(!res.ok) {
        throw new Error('Network response was not OK')
      }
      const contentType = res.headers.get('Content-Type')
      if (contentType.includes('application/json')) {
        return res.json()
      }
    })
    .then(data => {
      setBooks(data)
    })
    .catch(err => console.error('Failed to GET books ',err))
  }

  const deleteBook = id => {
    console.log(`Deleting the book with ID ${id}`)
    fetch(`/api/books/${id}`, {method: 'DELETE'})
      .then(() => fetchBooks())
      .catch(err => console.error('Failed to delete book ', err))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const url = bookForm.id ? 
    `/api/books/${bookForm.id}` : '/api/books'

    fetch(url, {
      method: bookForm.id ? 'PUT' : 'POST',
      body: JSON.stringify(bookForm),
      headers: new Headers ({
        'Content-Type': 'application/json',
        'X-Bloom': 'full-stack-web',
      })
    })
    .then(() => {
      fetchBooks()
      setBookForm(initialForm)
    })
    .catch(err => console.error('Failed to save book ', err))
  }

  const onChange = (event) => {
    const { name, value, type, checked } = event.target
    setBookForm({
      ...bookForm, [name]: type === 'checkbox' ? checked : value
    })
  }

  return (
    <div>
      <h2>My Books</h2>
      <ul>
        {books.map(book => (
          <StyledBook key={book.id} $finished={book.finished}>
            {book.title} by {book.author}
            <div>
              <button onClick={() => setBookForm(book)}>Edit</button>
              <button onClick={() => deleteBook(book.id)}>Delete</button>
            </div>
          </StyledBook>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <input
          name="title"
          value={bookForm.title}
          onChange={onChange}
          placeholder="Title"
        />
        <input
          name="author"
          value={bookForm.author}
          onChange={onChange}
          placeholder="Author"
        />
        <label>
          Finished:
          <input
            type="checkbox"
            name="finished"
            checked={bookForm.finished}
            onChange={onChange}
          />
        </label>
        <button type="submit">{bookForm.id ? 'Update Book' : 'Add Book'}</button>
      </form>
    </div>
  )
}
