const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Validation = require("../../../class/Validation")
const { Op } = require("sequelize")
const Profils = require("../../../models/Profils")
const Malle= require('../../../models/Maille')
const Aille= require('../../../models/Aile')



/**
 * Permet de creer un nature folio
 * @date  1/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author derick <derick@mdiabox.bi>
 */


const create_malle = async (req, res) => {
    try {
        const {NUMERO_MAILLE } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NUMERO_MAILLE: {
                required: true,
                length: [1, 245],
                alpha: true
            }

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

        const malle = await Malle.create({
            NUMERO_MAILLE

        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "Malle a ete cree avec succes",
            result: malle
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
// * Permet d'afficher la nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
const findAllMalle = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = "ID_MAILLE"
        const defaultSortDirection = "DESC"
        const sortColumns = {
            malle: {
                as: "malle",
                fields: {
                    ID_MAILLE:"ID_MAILLE",
                    ID_AILE: "ID_AILE",
                    NUMERO_MALLE: "NUMERO_MALLE",
                }
            },
            aille:{
                as:"aille",
                fields:{
                    NUMERO_AILE:"NUMERO_AILE"
                }
            }
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
            orderColumn = sortColumns.malle.fields.ID_MAILLE
            sortModel = {
                model: 'malle',
                as: sortColumns.malle.as
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
        const result = await Malle.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include :{
                model:Aille,
                  as: 'aille',
                  attributes: ['ID_AILE','NUMERO_AILE'],
                  required: false
          }
            
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des ailles",
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

 /**
// * Permet de faire la suppression du nature folio
// * @param {express.Request} req 
// * @param {express.Response} res 
// * @author derick <derick@mdiabox.bi>
// */
const deleteItems = async (req, res) => {
    try {
        const { ids } = req.body
        const itemsIds = JSON.parse(ids)
        await Malle.destroy({
            where: {
                ID_MAILLE: {
                    [Op.in]: itemsIds
                }
            }
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Les elements ont ete supprimer avec success",
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
* Permet de recuperer la nature folio
* @param {express.Request} req 
* @param {express.Response} res 
* @author derick <derick@mdiabox.bi>
*/

const findOneMalle = async (req, res) => {
    try {
        const {ID_MAILLE} = req.params
        const numero = await Malle.findOne({
            where: {
                ID_MAILLE 
            },
            include: {
                model:Aille,
                as: 'aille',
                attributes: ['ID_AILE', 'NUMERO_AILE'],
                required: false
            },
        })
        if (numero) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "malle trouvee",
                result: numero
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
const updateMalle = async (req, res) => {

    const {ID_MAILLE} = req.params

    try {
        // Validate request
        const {NUMERO_MAILLE } = req.body
        const data = { ...req.body };
        const validation = new Validation(data, {
            NUMERO_MAILLE: {
                required: true,
                length: [2, 245],
                alpha: true
            }
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

        const malle = await Malle.update({
            NUMERO_MAILLE
        }, {
            where: {
                ID_MAILLE : ID_MAILLE  
            }
        })
        res.status(RESPONSE_CODES.CREATED).json({
            statusCode: RESPONSE_CODES.CREATED,
            httpStatus: RESPONSE_STATUS.CREATED,
            message: "malle  a bien été modifie avec succes",
            result: malle
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
    create_malle,
    findAllMalle,
    findOneMalle,
     deleteItems,
    updateMalle

}