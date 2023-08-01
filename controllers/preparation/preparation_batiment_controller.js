const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const Validation = require('../../class/Validation');
const IMAGES_DESTINATIONS = require('../../constants/IMAGES_DESTINATIONS');
const Volume = require('../../models/volume');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');
const Users = require('../../models/Users');
const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');
const PROFILS = require('../../constants/PROFILS');
const Batiment = require('../../models/Batiment');
const Aile = require('../../models/Aile');
const User_ailes = require('../../models/User_ailes');



/**
 * Permet de afficher tous batiment
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAll = async (req, res) => {
    try {
        const { search } = req.query
        const batiment = await Batiment.findAll({
            attributes: ['ID_BATIMENT', 'NUMERO_BATIMENT']
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des batiment",
            result: batiment
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
 * Permet de afficher tous aile par rapport   batiment
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAile = async (req, res) => {
    try {
        const { ID_BATIMENT } = req.params
        const batiment = await Aile.findAll({
            where: { ID_BATIMENT: ID_BATIMENT },
            attributes: ['ID_AILE', 'NUMERO_AILE', 'ID_BATIMENT']
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des ailes",
            result: batiment
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
 * Permet de afficher tous aile par rapport   batiment
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findDistributeur = async (req, res) => {
    try {
        const { ID_AILE } = req.params
        const distributeur = await User_ailes.findAll({
            where: { ID_AILE: ID_AILE, IS_ACTIF: 1 },
            include: {
                model: Users,
                as: 'userAile',
                required: false,
                where: { D_PROFIL: PROFILS.AGENTS_DISTRIBUTEUR },
                attributes: ['USERS_ID', 'NOM', 'PRENOM'],

            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des ailes",
            result: distributeur
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
 * Permet de afficher tous aile par rapport   batiment
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
 const findAgentArchive = async (req, res) => {
    try {
        const archive = await Users.findAll({
            attributes:['USERS_ID','NOM','PRENOM','EMAIL','PHOTO_USER'],
            where: { ID_PROFIL:PROFILS.AGENTS_SUPERVISEUR_ARCHIVE, IS_ACTIF: 1 },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs archives",
            result: archive
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
    findAll,
    findAile,
    findDistributeur,
    findAgentArchive
}