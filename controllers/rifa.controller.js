const { Op } = require("sequelize");
const db = require("../models");
const { generarCodigo } = require("../utils/code.utils");
const { checkRequiredFields, sendError500 } = require("../utils/request.utils");

exports.listaRifas = async (req, res) => {
    console.log("Usuario actual", res.locals.user.id);
    try {
        const rifas = await db.rifas.findAll(
            {
                where: {
                    estado: 0,
                    usuario_creador_id: {
                        [Op.not]: res.locals.user.id
                    }
                },
                include: [
                    {
                        model: db.usuarios,
                        as: "usuario_creador",
                        attributes: ["nombre_completo", "telefono", "email"]
                    },
                    "rifas_participantes"
                ]
            }
        );
        res.send(rifas);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.searchListaRifas = async (req, res) => {
    const query = req.query.nombre.toLowerCase();
    try {
        const rifas = await db.rifas.findAll(
            {
                where: {
                    estado: 0,
                    usuario_creador_id: {
                        [Op.not]: res.locals.user.id
                    },
                    [db.Sequelize.Op.or]: [
                        {nombre: { [db.Sequelize.Op.substring]: query }},
                    ]
                },
                include: [
                    {
                        model: db.usuarios,
                        as: "usuario_creador",
                        attributes: ["nombre_completo", "telefono", "email"]
                    },
                    "rifas_participantes"
                ]
            }
        );
        res.send(rifas);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.getRifa = async (req, res) => {
    const id = req.params.id;
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

        res.send(rifa);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.getRifasMe = async (req, res) => {
    try {
        const rifa = await db.rifas.findAll({
            where: {
                usuario_creador_id: res.locals.user.id
            },
            include: [
                {
                    model: db.usuarios,
                    as: "usuario_creador",
                    attributes: ["nombre_completo", "telefono", "email"]
                },
                "rifas_participantes"
            ]
        });
        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }
        res.send(rifa);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.crearRifa = async (req, res) => {
    const requiredFields = ["nombre", "cantidad_tickets"];
    const fieldsWithErrors = checkRequiredFields(requiredFields, req.body);
    if (fieldsWithErrors.length > 0) {
        res.status(400).send({
            message: `Faltan los siguientes campos: ${fieldsWithErrors.join(", ")}`
        });
        return;
    }
    try {
        req.body.usuario_creador_id = res.locals.user.id;
        req.body.codigo_ticket = generarCodigo();
        req.body.estado = 0;
        const rifa = await db.rifas.create(req.body);
        res.send(rifa);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.updateRifa = async (req, res) => {
    const id = req.params.id;
    try {
        const rifa = await db.rifas.findByPk(id);
        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }
        if (req.method === "PUT") {
            const requiredFields = ["nombre", "cantidad_tickets"];
            const fieldsWithErrors = checkRequiredFields(requiredFields, req.body);
            if (fieldsWithErrors.length > 0) {
                res.status(400).send({
                    message: `Faltan los siguientes campos: ${fieldsWithErrors.join(", ")}`
                });
                return;
            }
        }
        req.body.usuario_creador_id = rifa.usuario_creador_id;
        req.body.codigo_ticket = rifa.codigo_ticket;
        req.body.estado = rifa.estado;
        await rifa.update(req.body);
        res.send(rifa);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.deleteRifa = async (req, res) => {
    const id = req.params.id;
    try {
        const rifa = await db.rifas.findByPk(id);
        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }
        await rifa.destroy();
        res.send({ message: "Rifa eliminada" });
    } catch (error) {
        sendError500(res, error);
    }
}