const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Profils = require("../../../models/Profils")
const Phase= require('../../../models/Phases')




 /**
// * Permet d'afficher la nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
const findAllphase = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "ID_PHASE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            phase: {
                as: "phase",
                fields: {
                    ID_PHASE :"ID_PHASE",
                    NOM_PHASE:"NOM_PHASE",
                }
            },
        }

        var orderColumn, orderDirection

        // sorting
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
            orderColumn = sortColumns.phase.fields.ID_PHASE
            sortModel = {
                model: 'phase',
                as: sortColumns.phase.as
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
        const result = await Phase.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des nature folio",
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

// /**
// * Permet de faire la suppression du nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
// const deleteItems = async (req, res) => {
//     try {
//         const { ids } = req.body
//         const itemsIds = JSON.parse(ids)
//         await Nature_folio.destroy({
//             where: {
//                 ID_NATURE_FOLIO: {
//                     [Op.in]: itemsIds
//                 }
//             }
//         })
//         res.status(RESPONSE_CODES.OK).json({
//             statusCode: RESPONSE_CODES.OK,
//             httpStatus: RESPONSE_STATUS.OK,
//             message: "Les elements ont ete supprimer avec success",
//         })
//     } catch (error) {
//         console.log(error)
//         res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
//             statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
//             httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
//             message: "Erreur interne du serveur, réessayer plus tard",
//         })
//     }
// }







module.exports = {
   
    findAllphase,
    

}