const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const fs = require('fs');

exports.getAll = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * FROM MANGAS`;
        conn.query(query, (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            
            return res.status(200).send({ data: results[0] });
        });
    });
};

exports.getById = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * 
                         FROM MANGAS
                        WHERE MG_ID = ?`;
        conn.query(query, [req.params.MG_ID], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            
            return res.status(200).send({ data: results[0] });
        });
    });
};

exports.getByName = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        const query = `SELECT * 
                         FROM MANGAS
                        WHERE MG_TITLE LIKE '%?%'`;
        conn.query(query, [req.body.MG_TITLE], (error, results, fields) => {
            conn.release();
            if(error) { return res.status(500).send({ error: error }) }
            
            return res.status(200).send({ data: results[0] });
        });
    });
};

exports.registerMangas = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ error: error }) }
        conn.query(
            'CALL REGISTER_MANGAS(?, ?);', 
            [ req.body.MG_TITLE, req.body.MG_PATH ],
            (error, result, field) => {
                if(result == null) {
                    res.status(409).send({ mensagem: 'Não foi possível cadastrar o mangá'})
                } else {
                    fs.readdir(req.body.MG_PATH, (err, files) => {
                        if(err) { return res.status(500).send({ error: err, arquives: files }) }
                        files.forEach(file => {
                            conn.query(
                                'CALL REGISTER_CHAPTERS(?, ?);', 
                                [ result.MG_ID, file ],
                                (error, result, field) => {
                                    conn.release();
                                    if(error) { res.status(500).send({ error: error }) }
                    
                                    return res.status(201).send({
                                        mensagem: 'Mangá criado com sucesso'
                                    });
                                }
                            );
                        });
                    });
                }
            }
        );
    });
};