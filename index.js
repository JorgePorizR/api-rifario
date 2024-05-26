const express = require('express');
const cors = require('cors');
const app = express();

require('dotenv').config();

// eslint-disable-next-line no-undef
const port = process.env.PORT;

const corsOptions = {
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(cors(corsOptions));

//body parser para leer los datos del formulario
const bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((err, req, res, next) => {
    if(err instanceof SyntaxError && err.status === 400 && 'body' in err){
        console.log(err);
        return res.sendStatus(400);
    }
    next();
})

//base de datos
const db = require("./models");
db.sequelize.sync(/*{ force: true }*/).then(() => {
    console.log("db resync");
});

require("./routes")(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});