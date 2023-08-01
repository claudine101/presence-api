const express = require('express');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const Etapes_folio= require('../../models/Etapes_folio');
const Nature_folio= require('../../models/Nature_folio')
const Folio= require('../../models/Folio')
const Volume = require('../../models/Volume')



/**
 * permet de 
 * @author derick <derick@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res 
 * @date 4/24/2023
 * 
 */

const findAll = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query

        const defaultSortField = 'ID_FOLIO '
        const defaultSortDirection = "DESC"
        const sortColumns = {


            folio: {
                as: "nature",
                fields: {
                    ID_FOLIO: 'ID_FOLIO',
                    NUMERO_FOLIO: "NUMERO_FOLIO",
                    CODE_FOLIO:"CODE_FOLIO",
                    DATE_INSERTION :"DATE_INSERTION"
                   
                }
            },


            etapes_volumes: {
                as: "etapes_volumes",
                fields: {
                    NOM_ETAPE: 'NOM_ETAPE',
                 
                }
            },
            volumes: {
                as: "volume",
                fields: {
                    NUMERO_VOLUME: 'NUMERO_VOLUME',
                 
                }
            },

            nature: {
                as: "nature",
                fields: {
                    NOM_ETAPE: 'NOM_ETAPE',
                 
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
            orderColumn = sortColumns.folio.fields.ID_FOLIO
            sortModel = {
                model: 'folio',
                as: sortColumns.folio.as
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
        const result = await Folio.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include: 
               
                 [
                    { model:Etapes_folio,
                  as: 'etapes_folio',
                  attributes: ['NOM_ETAPE'],
                  required: false
                },
                { model:Nature_folio,
                    as: 'nature',
                    attributes: ['DESCRIPTION'],
                    required: false
                  }
                  ,
                  { model:Volume,
                    as: 'volume',
                    attributes: ['NUMERO_VOLUME'],
                    required: false
                  }
                  ,
            
            ]
            
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des folios",
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
module.exports={
    findAll
}