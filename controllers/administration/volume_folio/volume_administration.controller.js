const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Profils = require("../../../models/Profils")
const  Volume_folio= require("../../../models/Etapes_volumes")
const Phase= require('../../../models/Phases')

/**
 * Permet de creer un nature folio
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author derick <derick@mdiabox.bi>
 */




// /**
// * Permet d'afficher la nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
const findAllvolume_folio = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "ID_ETAPE_VOLUME"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            volumefolio: {
                as: "volumefolio",
                fields: {
                    ID_ETAPE_VOLUME :"ID_ETAPE_VOLUME",
                    NOM_ETAPE:"NOM_ETAPE",
                }
            },
            phase:{
                as:"phase",
                fields:{
                    NOM_PHASE :"NOM_PHASE"
                }
            }
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
            orderColumn = sortColumns.volumefolio.fields.ID_ETAPE_VOLUME
            sortModel = {
                model: 'Etapes_volumes',
                as: sortColumns.volumefolio.as
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
        const result = await Volume_folio.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes:['ID_ETAPE_VOLUME','NOM_ETAPE'],
            where: {
                ...globalSearchWhereLike,
               
            },
            include :{
                model:Phase,
                  as: 'phase',
                  attributes: ['ID_PHASE','NOM_PHASE'],
                  required: false
          }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des etapes folio",
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

/**
* Permet de recuperer la nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author derick <derick@mdiabox.bi>
*/

const findOnevolumef0lio = async (req, res) => {
    try {
        const {ID_ETAPE_VOLUME} = req.params
        const volumefolio= await Volume_folio.findOne({
            where: {
                ID_ETAPE_VOLUME   
            },
            include: {
                model:Phase,
                as: 'phase',
                attributes: ['ID_PHASE', 'NOM_PHASE'],
                required: false
            },
        })
        if (volumefolio) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "etape folio trouvee",
                result: volumefolio
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: " non trouvé",
            })
        }
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
* Permet de faire la modification du nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author derick <derick@mdiabox.bi>
*/
const updatevolumeflio = async (req, res) => {

    const {ID_ETAPE_VOLUME} = req.params

    try {
        // Validate request
        const { NOM_ETAPE,ID_PHASE} = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NOM_ETAPE: {
                required: true,
                length: [2, 245],
                alpha: true
            },
           
        })
        await validation.run()
        const isValid = await validation.isValidate()
        if (!isValid) {
            const errors = await validation.getErrors()
            return res.status(RESPONSE_CODES.UNPROCESSABLE_ENTITY).json({
                statusCode: RESPONSE_CODES.UNPROCESSABLE_ENTITY,
                httpStatus: RESPONSE_STATUS.UNPROCESSABLE_ENTITY,
                message: "Probleme de validation des donnees",
                result: errors
            })
        }

        const batiment = await Volume_folio.update({
            NOM_ETAPE,
            ID_PHASE,
          
        }, {
            where: {
                ID_ETAPE_VOLUME  : ID_ETAPE_VOLUME   
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Nature folio  a bien été modifie avec succes",
            result: batiment
        })


    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur"
        });
    }

};

module.exports = {
   
    findAllvolume_folio,
    findOnevolumef0lio,
    updatevolumeflio
    

}