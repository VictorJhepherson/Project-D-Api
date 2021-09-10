const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        res.header('Access-Control-Allow-Origin', '*'),
        res.header('Access-Control-Allow-Headers', 
            'Content-Type, Origin, X-Requested-With, Accept, Authorization'
        );
        const token = req.headers.authorization.split(' ')[1];
        const decode = jwt.verify(token, process.env.JWT_KEY);
        req.user = decode;
        next();
    } catch {
        return res.status(401).send({ mensagem: 'Falha na autenticação' })
    }
}