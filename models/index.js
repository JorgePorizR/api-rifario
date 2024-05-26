const dbConfig = require("../config/db.config");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.usuarios = require("./usuario.model")(sequelize, Sequelize);
db.tokens = require("./usuarioauth.model")(sequelize, Sequelize);
db.rifas = require("./rifa.model")(sequelize, Sequelize);
db.usuarios_participantes = require("./usuario_participante.model")(sequelize, Sequelize);

db.usuarios.hasMany(db.rifas, { as: "rifas", foreignKey: "usuario_creador_id"});
db.usuarios.hasMany(db.tokens, { as: "tokens", foreignKey: "usuario_id"});
db.tokens.belongsTo(db.usuarios, {
    foreignKey: "usuario_id",
    as: "usuario",
});

db.rifas.hasMany(db.usuarios_participantes, { as: "rifas_participantes", foreignKey: "rifa_id", onDelete: "CASCADE"});

db.rifas.belongsTo(db.usuarios, {
    foreignKey: "usuario_creador_id",
    as: "usuario_creador",
});

db.usuarios_participantes.belongsTo(db.usuarios, {
    foreignKey: "usuario_id",
    as: "participante_usuario",
});
db.usuarios_participantes.belongsTo(db.rifas, {
    foreignKey: "rifa_id",
    as: "participante_rifa",
});

module.exports = db;