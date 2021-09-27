const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;

exports.getAll = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error }) }
        const query = `SELECT MG.MG_ID AS MG_ID,
                              MG.MG_TITLE AS MG_TITLE,
                              COUNT(MGC_SEQCHAPTER) AS CHAPTERS,
                              MGP.MGP_PATH AS MGP_PATH
                         FROM MANGAS MG
                        INNER JOIN MANGAPHOTOS MGP
                           ON MG.MG_PHOTO = MGP.MGP_ID
                         LEFT JOIN MANGACHAPTERS MGC
                           ON MG.MG_ID = MGC.MG_ID
                        GROUP BY MGC.MG_ID;`;
        conn.query(query, (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível pesquisar os mangás', error: error }) }
            
            if(results.lenght < 1)
                return res.status(500).send({ success: false, mensagem: 'Não foi encontrado registros' });
            else 
                return res.status(200).send({ success: true, mensagem: 'Pesquisa realizada com sucesso', data: results[0] });
        });
    });
};

exports.getById = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error}) }
        const query = `SELECT MG.MG_TITLE AS MG_TITLE,
                              MGP.MGP_PATH AS MGP_PATH,
                              COUNT(MGC.MGC_SEQCHAPTER) AS CHAPTERS
                         FROM MANGAS MG
                        INNER JOIN MANGAPHOTOS MGP
                           ON MG.MG_PHOTO = MGP.MGP_ID
                         LEFT JOIN MANGACHAPTERS MGC
                           ON MG.MG_ID = MGC.MG_ID
                        WHERE MG.MG_ID = ?
                        GROUP BY MG.MG_ID;`;
        conn.query(query, [req.params.MG_ID], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível pesquisar os mangás', error: error }) }
            
            if(results.lenght < 1)
                return res.status(500).send({ success: false, mensagem: 'Não foi encontrado registros' }); 
            else
                return res.status(200).send({ success: true, mensagem: 'Pesquisa realizada com sucesso', data: results[0] });
        });
    });
};

exports.getByName = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error }) }
        const query = `SELECT * 
                         FROM MANGAS
                        WHERE MG_TITLE LIKE '%?%'`;
        conn.query(query, [req.body.MG_TITLE], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível pesquisar os mangás', error: error }) }
            
            if(results.lenght < 1)
                return res.status(500).send({ success: false, mensagem: 'Não foi encontrado registros' });
            else
                return res.status(200).send({ success: true, mensagem: 'Pesquisa realizada com sucesso', data: results[0] });
        });
    });
};

exports.registerMangas = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error }) }
        conn.query(
            'CALL REGISTER_MANGAS(?, ?);', 
            [ req.body.MG_TITLE, req.body.MG_PHOTO ],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível cadastrar o mangá', error: error }) }
                            
                return res.status(200).send({ success: true, mensagem: 'Mangá cadastrado com sucesso' })
            }
        );
    });
};

exports.registerChapters = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error }) }
        conn.query(
            'CALL REGISTER_CHAPTERS(?, ?, ?);', 
            [ req.body.MG_ID, req.body.MGF_ARCHIVE, req.body.MGC_SEQCHAPTER ],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível cadastrar o capítulo', error: error }) }
                            
                return res.status(200).send({ success: true, mensagem: 'Capítulo cadastrado com sucesso' })
            }
        );
    });
};