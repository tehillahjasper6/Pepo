const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())

const USERS = [
  { email: 'user1@example.com', password: 'password123', id: 1, name: 'User One' },
  { email: 'john@example.com', password: 'password123', id: 2, name: 'John' },
  { email: 'ngo@foodbank.org', password: 'password123', id: 3, name: 'Food Bank' }
]

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = USERS.find(u => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  // set simple cookie to mimic session
  res.cookie('pepo_session', 'mock-session-token', { httpOnly: true })
  return res.json({ id: user.id, email: user.email, name: user.name, token: 'mock-token' })
})

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body || {}
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' })
  if (USERS.find(u => u.email === email)) return res.status(409).json({ message: 'User exists' })
  const id = USERS.length + 1
  USERS.push({ email, password, id, name: name || 'New User' })
  res.cookie('pepo_session', 'mock-session-token', { httpOnly: true })
  return res.status(201).json({ id, email, name })
})

app.get('/api/auth/me', (req, res) => {
  // naive: return first user
  return res.json({ id: 1, email: 'user1@example.com', name: 'User One' })
})

app.listen(4000, () => {
  console.log('Mock backend running on http://localhost:4000')
})
