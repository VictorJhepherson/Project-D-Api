const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const jwt = require('jsonwebtoken');

exports.getUserById = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi possível iniciar conexão com o banco de dados', error: error }) }
        const query = `SELECT * 
                         FROM SYSTEMUSERS
                        INNER JOIN AVATARS
                           ON SYSTEMUSERS.SU_PHOTO = AVATARS.AVATAR_ID
                        WHERE SYSTEMUSERS.SU_ID = ?`;
        conn.query(query, [req.params.user], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível pesquisar os usuários', error: error }) }
            
            if(results.length < 1)
                return res.status(500).send({ success: false, mensagem: 'Não foi encontrado registros' });
            else
                return res.status(200).send({ success: true, mensagem: 'Pesquisa realizada com sucesso', data: results });
        });
    });
};

exports.editUser = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi possível iniciar conexão com o banco de dados', error: error }) }
        conn.query(`SELECT SU_LOGINNAME
                      FROM SYSTEMUSERS
                     WHERE SU_LOGINNAME = ?`, [req.body.SU_LOGINNAME], 
        (error, results) => {
            if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível verificar se o email já está cadastrado', error: error }) }
            if(results.length > 0){
                res.status(409).send({ success: false, mensagem: 'E-mail já cadastrado' })
            } else {
                conn.query(
                    'CALL EDIT_SYSTEMUSERS(?, ?, ?, ?, ?);', 
                    [
                        req.body.SU_NICKNAME, req.body.SU_LOGINNAME, 
                        req.body.SU_PHONENUMBER, req.body.SU_PHOTO, req.body.SU_ID
                    ],
                    (error, result, field) => {
                        conn.release();
                        if(error) { res.status(500).send({ success: false, mensagem: 'Não foi possível editar o usuário', error: error }) }
        
                        let token = jwt.sign({ SU_NICKNAME: req.body.SU_NICKNAME }, process.env.JWT_KEY, { expiresIn: "7d" });  
                        return res.status(201).send({
                            success: true,
                            mensagem: 'Usuário editado com sucesso',
                            token: token
                        });
                    }
                );
            }
        });
    });
};