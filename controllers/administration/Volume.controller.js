const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const Validation = require("../../class/Validation")
const { Op } = require("sequelize")
const Volume = require("../../models/Volume")
const Maille = require('../../models/Maille')


/**
 * Permet de faire  la detail  du volume
 * @date  31/07/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const getDetail = async (req, res) => {
    const { ID_VOLUME } = req.params
    try {
        const volumes = await Volume.findOne({
            where: {
                ID_VOLUME : ID_VOLUME
            },
            include: [
            {
                model: Maille,
                as: 'maille',
                attributes: ['ID_MAILLE','NUMERO_MAILLE'],
                required: false
            }
          ]
        })
        if (volumes) {
            res.status(RESPONSE_CODES.OK).json({
                statusCode: RESPONSE_CODES.OK,
                httpStatus: RESPONSE_STATUS.OK,
                message: "Detail",
                result: volumes
            })
        } else {
            res.status(RESPONSE_CODES.NOT_FOUND).json({
                statusCode: RESPONSE_CODES.NOT_FOUND,
                httpStatus: RESPONSE_STATUS.NOT_FOUND,
                message: "volumes non trouve",
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

module.exports = {
    getDetail,
}