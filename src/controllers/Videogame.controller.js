const { Videogame, Genre: genre } = require('../db.js')
const axios = require('axios');
const { Op } = require("sequelize");
const { apiVideogameFormatter } = require('../utils/utils.js');


const getVideogames = async (req, res) => {
    let resultsAPI = []

    //Hago 5 llamadas a la API para obtener 100 juegos
    const videogamesPage1 = await axios.get(`https://api.rawg.io/api/games?key=${process.env.API_KEY}`)
    const videogamesPage2 = videogamesPage1?.data.next ? await axios.get(videogamesPage1.data.next) : null
    const videogamesPage3 = videogamesPage2?.data.next ? await axios.get(videogamesPage2.data.next) : null
    const videogamesPage4 = videogamesPage3?.data.next ? await axios.get(videogamesPage3.data.next) : null
    const videogamesPage5 = videogamesPage4?.data.next ? await axios.get(videogamesPage4.data.next) : null

    resultsAPI = [...videogamesPage1?.data.results, ...videogamesPage2?.data.results, ...videogamesPage3?.data.results, ...videogamesPage4?.data.results, ...videogamesPage5?.data.results]

    //Formateo los resultados de la API
    resultsAPI = resultsAPI.map(apiVideogameFormatter)

    // Pedido a la base de datos
    const videogamesDB = await Videogame.findAll({
        include: genre
    })

    // Concateno los resultados de la API con los de la base de datos
    results = [...videogamesDB, ...resultsAPI]


    // Envio los resultados
    res.status(200).json(results)
}

const getVideogamesByName = async (req, res) => {
    const { name } = req.query

    let first15Videogames = []

    // Pedido a la base de datos
    try {
        const videogamesDB = await Videogame.findAll({
            where: {
                nombre: {
                    [Op.iLike]: `%${name}%` //busca coincidencias en cualquier parte del nombre, ignorando mayusculas y minusculas
                }
            },
            include: genre
        })
        if (videogamesDB) first15Videogames = [...videogamesDB]
    }
    catch (err) {
        console.log("No se encontro en la DB, buscando en la API...")
    }

    // Pedido a la API
    try {
        const videogamesAPI = await axios.get(`https://api.rawg.io/api/games?key=${process.env.API_KEY}&search=${name}`)
        const initialResults = videogamesAPI?.data.results

        initialResults.forEach(v => {
            if (v.name.toLowerCase().includes(name.toLowerCase())) {
                first15Videogames.push(apiVideogameFormatter(v))
            }
        })
    }
    catch (err) {
        res.status(404).json({ message: "No se encontro el videojuego", err })
    }

    res.status(200).json(first15Videogames)
}


const getOneVideogame = async (req, res) => {
    const { idVideoGame } = req.params

    try {
        // Pedido a la base de datos
        const videogameDB = await Videogame.findByPk(idVideoGame, {include: genre})
        if (videogameDB) return res.status(200).json(videogameDB)

    } catch (err) {
        console.log("No se encontro en la DB, buscando en la API...")
    }

    try {
        // Pedido a la API
        const videogameAPI = await axios.get(`https://api.rawg.io/api/games/${idVideoGame}?key=${process.env.API_KEY}`)
        const initialResult = videogameAPI?.data

        // Formateo el resultado de la API
        const result = apiVideogameFormatter(initialResult)

        if (videogameAPI) return res.status(200).json(result)

    } catch (error) {

        res.status(404).json({ message: "No se encontro el videojuego", error })
    }
}

const createVideogame = async (req, res) => {
    const { nombre, descripcion, fecha_lanzamiento, rating, plataformas, generos } = req.body
    
    try {
        const newVideogame = await Videogame.create({
            nombre,
            descripcion,
            fecha_lanzamiento,
            rating,
            plataformas,
        })

        if (generos.length > 0) {
            await Promise.all(generos.map(async (genero) => {
                const gen = await genre.findOrCreate({
                    where: {
                        name: genero
                    }
                })
                await newVideogame.addGenre(gen[0]) // agrega a la tabla intermedia
            }))
        }
        const videogameWithGenres = await Videogame.findByPk(newVideogame.id, {
            include: genre
        })

        return res.status(201).json(videogameWithGenres)

    }
    catch (err) {
        res.status(500).json({ message: "No se pudo crear el videojuego", err })
    }
};

module.exports = {
    getVideogames,
    getOneVideogame,
    getVideogamesByName,
    createVideogame
}