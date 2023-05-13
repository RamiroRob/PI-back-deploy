const { Router } = require('express');

const { getVideogames, getOneVideogame, getVideogamesByName, createVideogame} = require('../controllers/Videogame.controller');
const { getGenres } = require('../controllers/Genre.controller')

const router = Router();

router.get("/videogames", (req,res) => {
   if(req.query.name) getVideogamesByName(req,res)
    else getVideogames(req,res)
}) 
    
router.get("/videogames/:idVideoGame", getOneVideogame)

router.post("/videogames", createVideogame)

router.get("/genres",getGenres)

module.exports = router;
