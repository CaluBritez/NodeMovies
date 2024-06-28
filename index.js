const express = require('express') // require -> commonJS
const movies = require('./movies.json') //  -> commonJS
const crypto = require('node:crypto')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express

//Middlewares
app.use(express.json())

// Rutas y acciones
app.get('/movies', (req, res) => {
    
    const { genre } = req.query
    if (genre) {
      const filteredMovies = movies.filter(
        movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      )
      return res.json(filteredMovies)
    }
      
    res.json(movies)
  })

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    // 422 Unprocessable Entity
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // en base de datos
  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data
  }

  // Esto no sería REST, porque estamos guardando
  // el estado de la aplicación en memoria
  movies.push(newMovie)

  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

// Si no se establece puerto corre en el 1234
const PORT = process.env.PORT ?? 1234

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})