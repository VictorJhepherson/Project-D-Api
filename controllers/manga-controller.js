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
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error }) }
        const query = `CALL GET_ALLMANGA()`;
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
        const query = `CALL GET_MANGABYID(?)`;
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
        const query = `CALL SEARCH_MANGA(?)`;
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
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi possível iniciar conexão com o banco de dados', error: error }) }

        console.log(req.body, req.file);

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'Photos/' + new Date().toISOString() + req.file.originalname,
            Body: req.file.buffer
        };

        S3.upload(params, (error, data) => {
            if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi possível realizar o upload da imagem', error: error }) }
            else {
                conn.query(
                    'CALL REGISTER_MANGAS(?, ?);', 
                    [ req.body.MG_TITLE, data.Location ],
                    (error, result, field) => {
                        conn.release();
                        if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível cadastrar o mangá', error: error }) }
                                    
                        return res.status(200).send({ success: true, mensagem: 'Mangá cadastrado com sucesso' })
                    }
                );
            }
        });
    });
};

exports.registerChapters = (req, res, next) => {
    mysql.getConnection((error, conn) => {
        if(error) { return res.status(500).send({ success: false,  mensagem: 'Não foi iniciar conexão com o banco de dados', error: error }) }
        conn.query(
            'CALL REGISTER_CHAPTERS(?, ?, ?);', 
            [ req.body.MG_ID, req.body.MGC_ARCHIVE, req.body.MGC_SEQCHAPTER ],
            (error, result, field) => {
                conn.release();
                if(error) { return res.status(500).send({ success: false, mensagem: 'Não foi possível cadastrar o capítulo', error: error }) }
                            
                return res.status(200).send({ success: true, mensagem: 'Capítulo cadastrado com sucesso' })
            }
        );
    });
};