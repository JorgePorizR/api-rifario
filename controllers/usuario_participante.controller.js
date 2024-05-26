const db = require("../models");
const { extraerNumero } = require("../utils/numticket.utils");
const { sendError500 } = require("../utils/request.utils");

exports.listaUsuariosParticipantes = async (req, res) => {
    try {
        const usuariosParticipantes = await db.usuarios_participantes.findAll(
            {
                include: [
                    {
                        model: db.usuarios,
                        as: "participante_usuario",
                        attributes: ["nombre_completo", "telefono", "email"]
                    },
                    {
                        model: db.rifas,
                        as: "participante_rifa",
                        attributes: ["nombre", "codigo_ticket"]
                    }
                ]
            }
        );
        res.send(usuariosParticipantes);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.getUsuarioParticipante = async (req, res) => {
    const id = req.params.id;
    try {
        const usuarioParticipante = await db.usuarios_participantes.findByPk(id, {
            include: [
                {
                    model: db.usuarios,
                    as: "participante_usuario",
                    attributes: ["nombre_completo", "telefono", "email"]
                },
                {
                    model: db.rifas,
                    as: "participante_rifa",
                    attributes: ["nombre", "codigo_ticket"]
                }
            ]
        });
        if (!usuarioParticipante) {
            res.status(404).send({ message: "Usuario participante no encontrado" });
            return;
        }
        res.send(usuarioParticipante);
    } catch (error) {
        sendError500(res, error);
    }
}

exports.crearUsuarioParticipante = async (req, res) => {
    try {
        const { usuario_id ,rifa_id } = req.body;

        console.log("USUARIO ID", usuario_id);
        console.log("RIFA ID", rifa_id);

        const usuario = await db.usuarios.findByPk(usuario_id);
        const rifa = await db.rifas.findByPk(rifa_id, 
            {
                include: [
                    "rifas_participantes"
                ]
            }
        );
        const usuarioParticipantes = rifa.rifas_participantes.map((usuarioParticipante) => usuarioParticipante.usuario_id);
        console.log("Usuario participantes", usuarioParticipantes);
        if (usuarioParticipantes.includes(usuario_id)) {
            res.status(400).send({
                message: "El usuario ya participa en esta rifa"
            });
            return;
        }

        if (!usuario) {
            res.status(404).send({ message: "Usuario no encontrado" });
            return;
        }

        if (!rifa) {
            res.status(404).send({ message: "Rifa no encontrada" });
            return;
        }

        const numerosTickets = await db.usuarios_participantes.findAll({
            where: {
                rifa_id: rifa_id
            },
            attributes: ["numero_ticket"]
        });

        const numeroTickets = numerosTickets.map((ticket) => ticket.numero_ticket);
        const numerosEsperados = Array.from({length: rifa.cantidad_tickets}, (_, index) => index + 1);
        const numerosFaltantes = numerosEsperados.filter(numero => !numeroTickets.some(ticket => extraerNumero(ticket) === numero));

        if (numerosFaltantes.length === 0) {
            res.status(400).send({ message: "No hay más tickets disponibles" });
            return;
        }
        const numeroTicket = numerosFaltantes[0];
        console.log("NUMERO TICKET", numeroTicket);

        req.body.numero_ticket = rifa.codigo_ticket + '-' + numeroTicket;
        req.body.ganador = false;
        
        const usuarioParticipante = await db.usuarios_participantes.create(req.body);

        console.log("USUARIO PARTICIPANTE", usuarioParticipante.dataValues);
        res.send(usuarioParticipante);
    } catch (error) {
        sendError500(res, error);
    }
}