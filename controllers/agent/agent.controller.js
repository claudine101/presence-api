const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const agent_model = require('../../models/agent/agent.model');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const Users = require('../../models/Users');
/**
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  11/07/2023
 * 
 */
const findById = async (req, res) => {
    try {
        var results = (await agent_model.findAgent(req.userId));
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Vous êtes connecté avec succès",
            result: results
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}
/**
 * Permet de vérifier la connexion dun utilisateur
 * @author NDAYISABA Claudine <claudine@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 12/07/2023
 * 
 */
const findAll = async (req, res) => {
    try {
        var results = (await Users.findAll(
           { where: {
            ID_PROFIL:3
            }}
        ));
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Agents superviseur archives",
            result: results
        })
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
}
module.exports = {
    findById,
    findAll,
}