const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const { query } = require('../../../utils/db')
const Types_incident = require("../../../models/Types_incident")
const Incidents = require("../../../models/Incidents")
const Users = require("../../../models/Users")
const Ordres_incident = require("../../../models/Ordres_incident")
const moment = require("moment");

/**
 * Permet d'afficher tous  les incident
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author ELOGE<nirema.eloge@mediabox.bi>
 * @date 1/9/2023
 */


const findAllincident = async (req, res) => {
    try {
        const {typeincident,selectedstatut,rows = 10, first = 0, sortField, sortOrder, search,startDate, endDate } = req.query
     
        const defaultSortField = "DESCRIPTION"
        const defaultSortDirection = "ASC"
        const sortColumns = {
            incidents: {
                as: "incidents",
                fields: {
                    DESCRIPTION: 'DESCRIPTION',
                    DATE_INSERTION: 'DATE_INSERTION',
                }
            },
        }
        var orderColumn, orderDirection
        var sortModel
        if (sortField) {
            for (let key in sortColumns) {
                if (sortColumns[key].fields.hasOwnProperty(sortField)) {
                    sortModel = {
                        model: key,
                        as: sortColumns[key].as
                    }
                    orderColumn = sortColumns[key].fields[sortField]
                    break
                }
            }
        }
        if (!orderColumn || !sortModel) {
            orderColumn = sortColumns.incidents.fields.DESCRIPTION
            sortModel = {
                model: 'incidents',
                as: sortColumns.incidents.as
            }
        }

        // ordering
        if (sortOrder == 1) {
            orderDirection = 'ASC'
        } else if (sortOrder == -1) {
            orderDirection = 'DESC'
        } else {
            orderDirection = defaultSortDirection
        }

        // searching
        const globalSearchColumns = [
            'DESCRIPTION',
            'DATE_INSERTION',
        ]
        var globalSearchWhereLike = {}
        if (search && search.trim() != "") {
            const searchWildCard = {}
            globalSearchColumns.forEach(column => {
                searchWildCard[column] = {
                    [Op.substring]: search
                }
            })
            globalSearchWhereLike = {
                [Op.or]: searchWildCard
            }
        }

        var typeincident_data = {}
        if (typeincident) {
            typeincident_data = { ID_TYPE_INCIDENT: typeincident }
        }
        var selectedstatut_data = {}
        if (selectedstatut) {
            selectedstatut_data = { STATUT: selectedstatut }
        }

        var dateWhere = {};
        if (startDate) {
          const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
          const endDateFormat = endDate
            ? moment(endDate).format("YYYY-MM-DD 23:59:59")
            : moment().format("YYYY-MM-DD 23:59:59");
          dateWhere = {
            DATE_INSERTION: {
              [Op.between]: [startDateFormat, endDateFormat],
            },
          };
        }
        const result = await   Incidents.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: [
                'ID_INCIDENT',
                'DESCRIPTION',
                'DATE_INSERTION',
                'STATUT'
              ],
              include : [{
                model: Types_incident,
                as: "types_incidents",
                attributes: [
                    'ID_TYPE_INCIDENT',
                    'TYPE_INCIDENT'
                ],
                include :[
                    {
                        model: Ordres_incident,
                        as: "ordre_incident",
                        attributes: [
                            "ID_ORDRE_INCIDENT","ORDRE_INCIDENT"
                        ],
                        required: true
                    }
                ]
              },
              {
                model: Users,
                as: "users",
                attributes: [
                    'USERS_ID',
                    'NOM',
                    'PRENOM',
                    'EMAIL',
                    'PHOTO_USER'
                ]
              }],
            where: {
                ...globalSearchWhereLike,
                ...typeincident_data,
                ...selectedstatut_data,
                ...dateWhere,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des types incident",
            result: {
                data: result.rows,
                totalRecords: result.count
            }
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

const reception = async (req, res) => {

    try {
        const { ID_INCIDENT } = req.params;
        const incidentObject = await   Incidents.findByPk(ID_INCIDENT, { attributes: ['ID_INCIDENT', 'STATUT'] })
        const incident = incidentObject.toJSON()
        let STATUT
        if (incident.STATUT) {
            STATUT = 0
        } else {
            STATUT = 1
        }

        await Incidents.update({ STATUT: STATUT }, {
            where: { ID_INCIDENT: ID_INCIDENT }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "succès"
        });
    } catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }

}



const traitement = async (req, res) => {

    try {
        const { ID_INCIDENT,COMMENTAIRE } = req.body;
        
        let STATUT = 2
        await Incidents.update({ COMMENTAIRE: COMMENTAIRE,STATUT: STATUT }, {
            where: { ID_INCIDENT: ID_INCIDENT }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "succès"
        });
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
    findAllincident,
    reception,
    traitement,
}