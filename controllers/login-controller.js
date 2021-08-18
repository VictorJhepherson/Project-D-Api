const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * 
                         FROM SYSTEMUSERS
                        INNER JOIN AVATARS
                           ON SYSTEMUSERS.SU_PHOTO = AVATARS.AVATAR_ID
                        WHERE SU_LOGINNAME = ?`;
        conn.query(query, [req.body.SU_NICKNAME], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            if (results.length < 1) {
                return res.status(401).send({ mensagem: 'Falha na autenticação'});
            }
            bcrypt.compare(req.body.SU_PASSWORD, results[0].SU_PASSWORD, (err, result) => {
                if (err) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação'});
                }
                if (result) {
                    let token = jwt.sign({
                        SU_NICKNAME: results[0].SU_NICKNAME
                    }, process.env.JWT_KEY, { expiresIn: "7d" });
                    return res.status(200).send({ mensagem: 'Autenticado com sucesso', data: results[0], token: token });
                }
                return res.status(401).send({ mensagem: 'Falha na autenticação'});
            });
        });
    });
};

exports.logout = (req, res, next) => {
    if (req.body.token != null && req.body.token != undefined) {
        return res.status(200).send({ mensagem: 'Logout com sucesso', token: null });
    } 
};

exports.refresh = (req, res, next) => {
    if (req.body.token != null && req.body.token != undefined) {
        mysql.getConnection((error, conn) => {
            if(error) { return res.status(500).send({ error: error }) }
            const query = `SELECT * 
                             FROM SYSTEMUSERS
                            INNER JOIN AVATARS
                               ON SYSTEMUSERS.SU_PHOTO = AVATARS.AVATAR_ID
                            WHERE SU_ID = ?`;
            conn.query(query, [req.body.user], (error, results, fields) => {
                conn.release();
                if(error) { return res.status(500).send({ error: error }) }
                if (results.length < 1) {
                    return res.status(401).send({ mensagem: 'Falha na autenticação'});
                }
                let token = jwt.sign({ SU_NICKNAME: results[0].SU_NICKNAME }, process.env.JWT_KEY, { expiresIn: "7d" });
                return res.status(200).send({ mensagem: 'Autenticado com sucesso', data: results[0], token: token});
            });
        });
    } else { 
        return res.status(401).send({ mensagem: 'Falha na autenticação'});
    }
};

exports.registerUsers = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(`SELECT SU_LOGINNAME
                      FROM SYSTEMUSERS
                     WHERE SU_LOGINNAME = ?`, [req.body.SU_LOGINNAME], (error, results) => {
            if(error) { return res.status(500).send({ error: error }) }
            if(results.length > 0){
                res.status(409).send({ mensagem: 'Usuário já cadastrado'})
            } else {
                bcrypt.hash(req.body.SU_PASSWORD, 10, (errBcrypt, hash) => {
                    if(errBcrypt){ return res.status(500).send({ error: errBcrypt }) }
                    conn.query(
                        'CALL REGISTER_SYSTEMUSERS(?, ?, ?, ?, ?, ?);', 
                        [
                            req.body.SU_NICKNAME, req.body.SU_LOGINNAME, 
                            hash, req.body.SU_PHONENUMBER, 
                            req.body.SU_DATEBIRTHDAY, req.body.SU_PHOTO
                        ],
                        (error, result, field) => {
                            conn.release();
                            if(error) { res.status(500).send({ error: error }) }

                            let token = jwt.sign({ SU_NICKNAME: req.body.SU_NICKNAME }, process.env.JWT_KEY, { expiresIn: "7d" });  
                            return res.status(201).send({
                                mensagem: 'Usuário criado com sucesso',
                                token: token
                            });
                        }
                    );
                });
            }
        })
    });
};