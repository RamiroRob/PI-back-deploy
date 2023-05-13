
function apiVideogameFormatter (videogame) {
    return {
        id: videogame.id,
        nombre: videogame.name,
        descripcion: videogame.description,
        plataformas: videogame.platforms,
        imagen: videogame.background_image,
        fecha_lanzamiento: videogame.released,
        rating: videogame.rating,
        genres: videogame.genres, 
    }
}

module.exports = {
    apiVideogameFormatter
}