const { checkUserMiddleware } = require("../middlewares/check-user.middleware.js");

module.exports = app => {
    const controller = require("../controllers/usuario_participante.controller.js");
    let router = require("express").Router();

    router.get("/", checkUserMiddleware, controller.listaUsuariosParticipantes);
    router.get("/:id", checkUserMiddleware, controller.getUsuarioParticipante);
    router.post("/", checkUserMiddleware, controller.crearUsuarioParticipante);

    app.use('/api/usuariosp', router);
}