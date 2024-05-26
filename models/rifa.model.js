module.exports = (sequelize, Sequelize) => {
    const Rifa = sequelize.define("rifa", {
        nombre: {
            type: Sequelize.STRING,
        },
        cantidad_tickets: {
            type: Sequelize.INTEGER,
        },
        usuario_creador_id: {
            type: Sequelize.INTEGER,
        },
        codigo_ticket: {
            type: Sequelize.STRING,
        },
        estado: {
            type: Sequelize.INTEGER,
        },
    })
    return Rifa;
}