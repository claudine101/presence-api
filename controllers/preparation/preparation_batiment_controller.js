const express = require('express');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const Users = require('../../models/Users');
const PROFILS = require('../../constants/PROFILS');
const Batiment = require('../../models/Batiment');
const Aile = require('../../models/Aile');
const User_ailes = require('../../models/User_ailes');
const Maille = require('../../models/Maille');
const Syst_provinces = require('../../models/Syst_provinces');
const Syst_communes = require('../../models/Syst_communes');
const Syst_zones = require('../../models/Syst_zones');
const Syst_collines = require('../../models/Syst_collines');
const { where } = require('sequelize');



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
 * Permet de afficher tous provinces
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findProvinces = async (req, res) => {
    try {
        const { search } = req.query
        const batiment = await Syst_provinces.findAll({
            attributes: ['PROVINCE_ID', 'PROVINCE_NAME']
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
 * Permet de afficher tous communes par rapport   provinces  selectionner
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findCommunes = async (req, res) => {
    try {
        const { PROVINCE_ID } = req.params
        const batiment = await Syst_communes.findAll({
            where: { PROVINCE_ID: PROVINCE_ID },
            attributes: ['COMMUNE_ID', 'COMMUNE_NAME', 'PROVINCE_ID']
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
 * Permet de afficher tous zones par rapport   commune  selectionner
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findZones = async (req, res) => {
    try {
        const { COMMUNE_ID } = req.params
        const batiment = await Syst_zones.findAll({
            where: { COMMUNE_ID: COMMUNE_ID },
            attributes: ['ZONE_ID', 'ZONE_NAME', 'COMMUNE_ID']
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
 * Permet de afficher tous zones par rapport   commune  selectionner
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findCollines = async (req, res) => {
    try {
        const { ZONE_ID } = req.params
        const batiment = await Syst_collines.findAll({
            where: { ZONE_ID: ZONE_ID },
            attributes: ['COLLINE_ID', 'COLLINE_NAME', 'ZONE_ID']
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
 * Permet de afficher tous batiment
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findMailles = async (req, res) => {
    try {
        const { search } = req.query
        const mailles = await Maille.findAll({
            attributes: ['ID_MAILLE', 'NUMERO_MAILLE'],
            where:{
                IS_DISPO:1
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des mailles",
            result: mailles
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
        const distributeur = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_DISTRIBUTEUR },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER',],
            include: {
                model: User_ailes,
                as: 'userAile',
                required: false,
                where: { ID_AILE: ID_AILE, IS_ACTIF: 1 },


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
            attributes: ['USERS_ID', 'NOM', 'PRENOM', 'EMAIL', 'PHOTO_USER'],
            where: { ID_PROFIL: PROFILS.AGENTS_SUPERVISEUR_ARCHIVE, IS_ACTIF: 1 },
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
/**
 * Permet de afficher tous agent  superviseur  aile
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAgentSuperviseurAile = async (req, res) => {
    try {
        const { aile } = req.query
        console.log(aile)
        const userAile = {}
        if (!aile) {
            const userObject = await User_ailes.findOne({
                where: { USERS_ID: req.userId, IS_ACTIF: 1 },
                attributes: ['ID_AILE']
            })
            userAile = userObject.toJSON()
        }
        const condition = {
            ID_AILE: aile ? aile : userAile.ID_AILE, IS_ACTIF: 1
        }
        const superviseurAile = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENTS_SUPERVISEUR_AILE },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
            include: {
                model: User_ailes,
                as: 'userAile',
                required: false,
                where: condition,
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs ailes",
            result: superviseurAile
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
 * Permet de afficher tous agent  superviseur  phase preparation
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 02/08/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAgentSuperviseurPreparation = async (req, res) => {
    try {
        const userObject = await User_ailes.findOne({
            where: { USERS_ID: req.userId, IS_ACTIF: 1 },
            attributes: ['ID_AILE']
        })
        const userAile = userObject.toJSON()
        const superviseurPreparation = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENT_SUPERVISEUR },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
            include: {
                model: User_ailes,
                as: 'userAile',
                required: false,
                where: { ID_AILE: userAile.ID_AILE, IS_ACTIF: 1 },
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs phase preparation",
            result: superviseurPreparation
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
 * Permet de afficher tous agent  preparation
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 02/08/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findAgentPreparation = async (req, res) => {
    try {
        const userObject = await User_ailes.findOne({
            where: { USERS_ID: req.userId, IS_ACTIF: 1 },
            attributes: ['ID_AILE']
        })
        const userAile = userObject.toJSON()
        const superviseurPreparation = await Users.findAll({
            where: { ID_PROFIL: PROFILS.AGENT_PREPARATION },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
            include: {
                model: User_ailes,
                as: 'userAile',
                required: false,
                where: { ID_AILE: userAile.ID_AILE, IS_ACTIF: 1 },
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs phase preparation",
            result: superviseurPreparation
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
 * Permet de afficher tous agent  chefPlateau
 *@author NDAYISABA Claudine<claudine@mediabox.bi>
 *@date 31/07/2023
 * @param {express.Request} req
 * @param {express.Response} res 
 */
const findChefPlateau = async (req, res) => {
    try {
        const userObject = await User_ailes.findOne({
            where: { USERS_ID: req.userId, IS_ACTIF: 1 },
            attributes: ['ID_AILE']
        })
        const userAile = userObject.toJSON()
        const superviseurAile = await Users.findAll({
            where: { ID_PROFIL: PROFILS.CHEF_PLATEAU },
            attributes: ['USERS_ID', 'EMAIL', 'NOM', 'PRENOM', 'PHOTO_USER'],
            include: {
                model: User_ailes,
                as: 'userAile',
                required: false,
                where: { ID_AILE: userAile.ID_AILE, IS_ACTIF: 1 },


            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des agents superviseurs ailes",
            result: superviseurAile
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
    findAgentArchive,
    findMailles,
    findAgentSuperviseurAile,
    findAgentSuperviseurPreparation,
    findChefPlateau,
    findAgentPreparation,
    findProvinces,
    findCommunes,
    findZones,
    findCollines
}