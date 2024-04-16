import './styles/reset.css'
import './styles/styles.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import Books from './components/Books'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const domNode = document.getElementById('root')
const root = createRoot(domNode)

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Books />} />
    </Routes>
  </BrowserRouter>
)
