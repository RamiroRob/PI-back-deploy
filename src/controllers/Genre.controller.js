const { Genre } = require('../db.js')
const axios = require('axios');


const loadGenres = async (req, res) => {
    const genres = await axios.get(`https://api.rawg.io/api/genres?key=${process.env.API_KEY}`)

    await genres.data.results.map(g => {
        Genre.findOrCreate({
            where: {
                name: g.name
            }
        })
    })
}

const getGenres = async (req, res) => {
    const genres = await Genre.findAll()
    res.status(200).json(genres)
}

module.exports = {
    loadGenres,
    getGenres
}