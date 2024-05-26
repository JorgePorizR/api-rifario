module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuario", {
        nombre_completo: {
            type: Sequelize.STRING,
        },
        telefono: {
            type: Sequelize.STRING,
        },
        email: {
            type: Sequelize.STRING,
        },
        password: {
            type: Sequelize.STRING,
        },
    })
    return Usuario;
}