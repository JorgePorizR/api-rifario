const { checkUserMiddleware } = require("../middlewares/check-user.middleware.js");

module.exports = app => {
    const controller = require("../controllers/usuario.controller.js");
    let router = require("express").Router();

    router.get("/", controller.listaUsuarios);
    router.get("/noprifas/:id", checkUserMiddleware, controller.listaUsuariosNoParticipantesByRifaId);
    router.get("/noprifas/search/:id", checkUserMiddleware, controller.searchUsuariosNoParticipantesByRifaId);
    router.post("/partganadores/:id", checkUserMiddleware, controller.generarUsuariosPartGanadoresByRifaId);
    router.get("/ganadores/:id", checkUserMiddleware, controller.listaUsuariosGanadoresByRifaId);

    app.use('/api/usuarios', router);
}