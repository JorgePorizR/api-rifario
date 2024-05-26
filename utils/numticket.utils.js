module.exports = {
    extraerNumero(ticket) {
        return parseInt(ticket.split("-")[1]);
    }
}