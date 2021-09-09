const express = require('express');
const router = express.Router();
const mysql = require('../mysql').pool;
const AWS = require('aws-sdk');

const S3 = new AWS.S3({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
});

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
            'CALL REGISTER_MANGAS(?);', 
            [ req.body.MG_TITLE ],
            (error, result, field) => {
                if(error) {
                    res.status(409).send({ error: error, mensagem: 'Não foi possível cadastrar o mangá'})
                } else {
                    const params = {
                        Bucket: process.env.AWS_BUCKET_NAME,
                        Key: 'Chapters/' + req.file.filename,
                        Body: req.file.data
                    };

                    S3.upload(params, (error, data) => {
                        if(error) {
                            return res.status(500).send({ error: error, mensagem: 'Não foi possível fazer o upload do PDF', data: params, file: req.file });
                        } else {
                            conn.query(
                                'CALL REGISTER_CHAPTERS(?, ?);', 
                                [ result.insertId, data.Location ],
                                (error, result, field) => {
                                    conn.release();
                                    if(error) { return res.status(500).send({ error: error, mensagem: 'Não foi possível cadastrar o capítulo', data: data }) }
                    
                                    return res.status(201).send({
                                        mensagem: 'Mangá criado com sucesso'
                                    });
                                }
                            );
                        }
                    });
                }
            }
        );
    });
};