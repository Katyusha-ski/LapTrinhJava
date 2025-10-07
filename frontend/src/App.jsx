import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import './App.css'

function App() {
  return (
    <div className="app">
      <h1>AESP - AI English Speaking Practice</h1>
      <p>Welcome to AESP Platform!</p>
      
      {/* TODO: Thêm routing và components */}
      <Routes>
        <Route path="/" element={<h2>Home Page</h2>} />
        <Route path="/login" element={<h2>Login Page</h2>} />
        <Route path="/register" element={<h2>Register Page</h2>} />
      </Routes>
      
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default App
