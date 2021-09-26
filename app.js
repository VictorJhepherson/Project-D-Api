const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const rotaLogin = require('./routes/login');
const rotaManga = require('./routes/manga');
const rotaUser = require('./routes/user');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'),
    res.header('Access-Control-Allow-Headers', 
        'Content-Type, Origin, X-Requested-With, Accept, Authorization'
    );

    if(res.method === 'OPTIONS'){ 
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET, OPTIONS');
        return res.status(200).send({});
    }
    next();
});

app.use('/auth', rotaLogin);
app.use('/manga', rotaManga);
app.use('/user', rotaUser);

app.use((req, res, next) =>{
    const erro = new Error('Não encontrado');
    erro.status = 404;
    next(erro);
});

app.use((error, req, res, next) =>{
    res.status(error.status || 500);
    return res.send({
        erro: {
            mensagem: error.message
        }
    });
});

module.exports = app;