module.exports = app => {
    // rutas de acceso
    require('./rifa.routes')(app);
    require('./auth.routes')(app);
    require('./usuario.routes')(app);
    require('./usuario_part.routes')(app);
}