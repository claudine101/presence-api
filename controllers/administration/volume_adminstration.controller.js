const express = require('express');
const RESPONSE_CODES = require('../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require('../../constants/RESPONSE_STATUS');
const { query } = require('../../utils/db');
const Volume=require('../../models/Volume');
const Etapes_volumes= require('../../models/Etapes_volumes');
const maille = require('../../models/Maille');
const Users=  require('../../models/Users');
const Etapes_volume_historiques = require('../../models/Etapes_volume_historiques');


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

        const defaultSortField = 'ID_VOLUME'
        const defaultSortDirection = "DESC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    ID_VOLUME: 'ID_VOLUME',
                    NUMERO_VOLUME: "NUMERO_VOLUME",
                    CODE_VOLUME:"CODE_VOLUME",
                    NOMBRE_DOSSIER :"NOMBRE_DOSSIER",
                    DATE_INSERTION :"DATE_INSERTION"
                   
                }
            },


            etapes_volumes: {
                as: "etapes_volumes",
                fields: {
                    NOM_ETAPE: 'NOM_ETAPE',
                 
                }
            },

            malle: {
                as: "malle",
                fields: {
                    NUMERO_MAILLE: 'NUMERO_MAILLE',
                  
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
            orderColumn = sortColumns.volume.fields.ID_VOLUME
            sortModel = {
                model: 'volume',
                as: sortColumns.volume.as
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
        const result = await Volume.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            where: {
                ...globalSearchWhereLike,
            },
            include:[
                { model:Etapes_volumes,
                as: 'etapes_volumes',
                attributes: ['NOM_ETAPE'],
                required: false
                 }, 
               
                 { model:maille,
                  as: 'malle',
                  attributes: ['NUMERO_MAILLE'],
                  required: false
                }]
            
        })
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des volumes ",
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
 * Permet de faire  la detail  de la course
 * @date  25/07/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const gethistoriquevol = async (req, res) => {
    try {
        const { id } = req.params

        const histo = await Etapes_volume_historiques.findAll({
            where: {
                ID_VOLUME: id
            },
            include: [
            {
                model: Volume,
                as:'volume',
                attributes: ['ID_VOLUME','NUMERO_VOLUME','NOMBRE_DOSSIER'],
                required: false
            },
            {
              model:Users,
              as:'users',
              attributes: ['USERS_ID','NOM','PRENOM','EMAIL','TELEPHONE','PHOTO_USER'],
              required: false
            },
            {
                model:Users,
                as:'traitant',
                attributes: ['USERS_ID','NOM','PRENOM','EMAIL','TELEPHONE','PHOTO_USER'],
                required: false
              },
            {
              model:Etapes_volumes,
              as:'etapes_volumes',
              attributes: ['ID_ETAPE_VOLUME','NOM_ETAPE'],
              required: false
            },
       
          ]
        })
        if (histo) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "voici la liste des historiques",
                result: histo
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "Course non trouve",
            })
        }
    }
    catch (error) {
        console.log(error)
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        })
    }
  }
 
module.exports={
    findAll,
    gethistoriquevol
}