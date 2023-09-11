const express = require('express');
const VolumePvUpload = require('../../class/uploads/VolumePvUpload');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const generateToken = require('../../utils/generateToken');
const md5 = require('md5')
const path = require('path')
const moment = require("moment");
const { excludedProperties } = require('juice');
const ETAPES_VOLUME = require('../../constants/ETAPES_VOLUME');
const ETAPES_FOLIO = require('../../constants/ETAPES_FOLIO');
const PROFILS = require('../../constants/PROFILS');
const { Op } = require('sequelize');
const Types_incident = require('../../models/Types_incident');
const Incidents = require('../../models/Incidents');
const Ordres_incident = require('../../models/Ordres_incident');
const Incident_logiciels = require('../../models/Incident_logiciels');


/**
 * Permet de recuperer tous les types d'incidents existants
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/09/2023
 * 
 */
const findAllTypesIncidents = async (req, res) => {
    try {
        const types = await Ordres_incident.findAll({
            where: {
                [Op.and]: [{ IS_AUTRE:0}]
            },
            attributes: ['ID_ORDRE_INCIDENT', 'ORDRE_INCIDENT', 'IS_AUTRE', 'ID_USER', 'DATE_INSERTION'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste de tous les types d'incodents",
            result: types
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
 * Permet de recuperer tous les types d'incidents par rapport a l'ordrer existants
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/09/2023
 * 
 */
const findAllTypesIncidentsByordres = async (req, res) => {
    try {
        const {ID_ORDRE_INCIDENT} = req.params
        const typesIncidents = await Types_incident.findAll({
            where: {
                [Op.and]: [{ ID_ORDRE_INCIDENT:ID_ORDRE_INCIDENT,  IS_AUTRE:0}]
            },
            attributes: ['ID_TYPE_INCIDENT', 'ID_ORDRE_INCIDENT','TYPE_INCIDENT', 'IS_AUTRE', 'ID_USER', 'DATE_INSERTION'],
            include: [{
                model: Ordres_incident,
                as: 'ordre_incident',
                required: false,
                attributes: ["ID_ORDRE_INCIDENT", "ORDRE_INCIDENT"]
            }]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste de tous les types d'incidents",
            result: typesIncidents
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
 * Permet de recuperer tous les types de panne lors du choix du logiciel
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/09/2023
 * 
 */
const findAllTypesIncidentsChoixLogiciel = async (req, res) => {
    try {
        const logiciels = await Incident_logiciels.findAll({
            attributes: ['ID_INCIDENT_LOGICIEL', 'NOM_LOGICIEL','DATE_INSERTION'],
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste de tous les logiciels",
            result: logiciels
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
* Permet d'enregistrer une incident declarer
* @author Vanny Boy <vanny@mediabox.bi>
* @param {express.Request} req
* @param {express.Response} res 
* @date  1/09/2023
* 
*/
const createIncidents = async (req, res) => {
    try {
        const {
            ID_ORDRE_INCIDENT,ID_TYPE_INCIDENT, DESCRIPTION,NOM_LOGICIEL, Autres, AutresIncident
        } = req.body;
        const date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        if (Autres) {
            const newTypeOrdrerInsert = await Ordres_incident.create({
                ORDRE_INCIDENT: Autres,
                IS_AUTRE: 1,
                ID_USER: req.userId,
            })
            const lastInsertOrdre = newTypeOrdrerInsert.toJSON()
            const newTypeIncidentInsert = await Types_incident.create({
                ID_ORDRE_INCIDENT:lastInsertOrdre.ID_ORDRE_INCIDENT,
                TYPE_INCIDENT: Autres,
                IS_AUTRE: 1,
                ID_USER: req.userId,
            })
            const lastInsertData = newTypeIncidentInsert.toJSON()
            await Incidents.create(
                {
                    ID_TYPE_INCIDENT: lastInsertData.ID_TYPE_INCIDENT,
                    DESCRIPTION: DESCRIPTION,
                    ID_USER: req.userId,
                }
            )
        } else if(AutresIncident) {
            const newTypeIncidentInsert = await Types_incident.create({
                ID_ORDRE_INCIDENT:ID_ORDRE_INCIDENT,
                TYPE_INCIDENT: AutresIncident,
                IS_AUTRE: 1,
                ID_USER: req.userId,
            })
            const lastInsertData = newTypeIncidentInsert.toJSON()
            await Incidents.create(
                {
                    ID_TYPE_INCIDENT: lastInsertData.ID_TYPE_INCIDENT,
                    DESCRIPTION: DESCRIPTION,
                    ID_USER: req.userId,
                }
            )
        }else if(NOM_LOGICIEL){
            const incidentInsert = await Incidents.create({
                ID_TYPE_INCIDENT: ID_TYPE_INCIDENT,
                ID_INCIDENT_LOGICIEL:NOM_LOGICIEL,
                DESCRIPTION: DESCRIPTION,
                ID_USER: req.userId,
            })
        }else{
            const incidentInsert = await Incidents.create({
                ID_TYPE_INCIDENT: ID_TYPE_INCIDENT,
                DESCRIPTION: DESCRIPTION,
                ID_USER: req.userId,
            })
        }
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Insertion faite  avec succès",
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
 * Permet de recuperer tous les types de panne lors du choix du logiciel
 * @author Vanny Boy <vanny@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date  1/09/2023
 * 
 */
const findAllIncidentsDeclarer = async (req, res) => {
    try {
        const result = await Incidents.findAll({
            where: {
                [Op.and]:[
                    {
                        ID_USER:req.userId
                    }
                ]
            },
            attributes: ['ID_INCIDENT', 'ID_TYPE_INCIDENT', 'ID_INCIDENT_LOGICIEL', 'DESCRIPTION', 'ID_USER','DATE_INSERTION'],
            include: [
                {
                    model: Types_incident,
                    as: 'types_incidents',
                    required: false,
                    attributes: ['ID_TYPE_INCIDENT', 'ID_ORDRE_INCIDENT', 'TYPE_INCIDENT', 'IS_AUTRE','ID_USER'],
                },
            ]
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste de tous les incidents declarer",
            result: result
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
    findAllTypesIncidents,
    createIncidents,
    findAllTypesIncidentsByordres,
    findAllTypesIncidentsChoixLogiciel,
    findAllIncidentsDeclarer
}