module.exports = (sequelize, Sequelize) => {
    const UsuarioParticipante = sequelize.define("usuario_participante", {
        usuario_id: {
            type: Sequelize.INTEGER,
        },
        rifa_id: {
            type: Sequelize.INTEGER,
        },
        numero_ticket: {
            type: Sequelize.STRING,
        },
        ganador: {
            type: Sequelize.BOOLEAN,
        },
    })
    return UsuarioParticipante;
}