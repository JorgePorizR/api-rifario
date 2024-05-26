const db = require("../models");
const { sendError500 } = require("../utils/request.utils");


exports.listaUsuarios = async (req, res) => {
    try {
        const usuarios = await db.usuarios.findAll();
        res.send(usuarios);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.listaUsuariosNoParticipantesByRifaId = async (req, res) => {
    const id = req.params.id;
    try {
        const rifa = await db.rifas.findByPk(id);
        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }

        const usuariosParticipantesIds = (await rifa.getRifas_participantes()).map(participante => participante.usuario_id);

        const usuariosNoParticipantes = await db.usuarios.findAll({
            where: {
                id: {
                    [db.Sequelize.Op.notIn]: [...usuariosParticipantesIds, rifa.usuario_creador_id]
                }
            },
            attributes: ["id", "nombre_completo", "telefono", "email"]
        });

        res.send(usuariosNoParticipantes);

    } catch (error) {
        sendError500(res, error);
    }
}

exports.searchUsuariosNoParticipantesByRifaId = async (req, res) => {
    const id = req.params.id;
    const query = req.query.nombre.toLowerCase();
    try {
        const rifa = await db.rifas.findByPk(id);
        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }

        const usuariosParticipantesIds = (await rifa.getRifas_participantes()).map(participante => participante.usuario_id);

        const usuariosNoParticipantes = await db.usuarios.findAll({
            where: {
                id: {
                    [db.Sequelize.Op.notIn]: [...usuariosParticipantesIds, rifa.usuario_creador_id]
                },
                [db.Sequelize.Op.or]: [
                    {nombre_completo: { [db.Sequelize.Op.substring]: query }},
                ]
            },
            attributes: ["id", "nombre_completo", "telefono", "email"]
        });

        res.send(usuariosNoParticipantes);

    } catch (error) {
        sendError500(res, error);
    }
}

exports.generarUsuariosPartGanadoresByRifaId = async (req, res) => {
    const id = req.params.id;
    const { cantidad_ganadores } = req.body;
    try {
        const rifa = await db.rifas.findByPk(id, {
            include: [
                {
                    model: db.usuarios,
                    as: "usuario_creador",
                    attributes: ["nombre_completo", "telefono", "email"]
                },
                {
                    model: db.usuarios_participantes,
                    as: "rifas_participantes",
                    include: {
                        model: db.usuarios,
                        as: "participante_usuario",
                        attributes: ["id","nombre_completo", "telefono", "email"]
                    }
                }
            ]
        });
        
        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }

        const rifaParticipantes = rifa.rifas_participantes.map(participante => participante);

        if (cantidad_ganadores > rifaParticipantes.length) {
            res.status(400).send({ message: "La cantidad de ganadores no puede ser mayor a la cantidad de participantes" });
            return;
        }
        const usuariosSeleccionados = [];
        const usuariosPartTotales = rifaParticipantes.length;
        const indicesSeleccionados = [];
        for (let i = 0; i < cantidad_ganadores; i++) {
            let index;
            do {
                index = Math.floor(Math.random() * usuariosPartTotales);
            } while (indicesSeleccionados.includes(index));
            indicesSeleccionados.push(index);
            usuariosSeleccionados.push(rifaParticipantes[index]);
        }

        usuariosSeleccionados.forEach(async (usuario) => {
            const usuario_participante = await db.usuarios_participantes.findOne({
                where: {
                    usuario_id: usuario.usuario_id,
                    rifa_id: rifa.id
                }
            });
            await usuario_participante.update({ganador: true});
        });

        await rifa.update({estado: 1});

        /*usuariosSeleccionados.forEach((usuario) => {
            console.log("Usuario Ganador: ", usuario.participante_usuario.nombre_completo);
        });*/

        res.send(usuariosSeleccionados);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.listaUsuariosGanadoresByRifaId = async (req, res) => {
    const id = req.params.id;
    try {
        const usuariosGanadores = await db.usuarios_participantes.findAll({
            where: {
                rifa_id: id,
                ganador: true
            },
            include: {
                model: db.usuarios,
                as: "participante_usuario",
                attributes: ["id", "nombre_completo", "telefono", "email"]
            }
        });
        
        if (!usuariosGanadores) {
            res.status(404).send({ message: "Usuarios Ganadores no encontrados" });
            return;
        }

        res.send(usuariosGanadores);
    } catch (error) {
        sendError500(res, error);
    }
}
