const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const jwt = require('jsonwebtoken');

exports.getUserById = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * 
                         FROM SYSTEMUSERS
                        WHERE SU_ID = ?`;
        conn.query(query, [req.params.user], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            
            return res.status(200).send({ data: results[0] });
        });
    });
};

exports.editUser = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(`SELECT SU_LOGINNAME
                      FROM SYSTEMUSERS
                     WHERE SU_LOGINNAME = ?`, [req.body.SU_LOGINNAME], (error, results) => {
            if(error) { return res.status(500).send({ error: error }) }
            if(results.length > 0){
                res.status(409).send({ mensagem: 'E-mail já cadastrado', error: 0 })
            } else {
                conn.query(
                    'CALL EDIT_SYSTEMUSERS(?, ?, ?, ?, ?, ?);', 
                    [
                        req.body.SU_NICKNAME, req.body.SU_LOGINNAME, 
                        req.body.SU_PHONENUMBER, req.body.SU_DATEBIRTHDAY, 
                        req.body.SU_PHOTO, req.body.SU_ID
                    ],
                    (error, result, field) => {
                        conn.release();
                        if(error) { res.status(500).send({ error: error }) }
        
                        let token = jwt.sign({ SU_NICKNAME: req.body.SU_NICKNAME }, process.env.JWT_KEY, { expiresIn: "7d" });  
                        return res.status(201).send({
                            mensagem: 'Usuário editado com sucesso',
                            token: token
                        });
                    }
                );
            }
        });
    });
};