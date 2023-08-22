const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Folio = require("../../../models/Folio")
const { Op } = require("sequelize")
const Equipes = require("../../../models/Equipes")


/**
 * Fonction du rapport des dossiers scannes et non scanes par equipes,
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 21/08/2023
 */
const phaseScanning = async (req, res) => {
  try {

    //find all equipes
    const equipes = await Equipes.findAll({});
    
    //count dossiers scannees
    const scannes = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const folios = await Folio.findAndCountAll({
        where: { ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: 1 }
      })
      return {
        ...util,
        folios
      }
    }))

    //count dossiers non scannees
    const nonScannes = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const folios = await Folio.findAndCountAll({
        where: { ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: 0 }
      })
      return {
        ...util,
        folios
      }
    }))

    //count dossiers en cours de traitement
    const nonTraites = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const folios = await Folio.findAndCountAll({
        where: { ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: null }
      });
      return {
        ...util,
        folios
      }
    }))
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'les dossiers',
      result: {
        scannes,
        nonScannes,
        nonTraites
      }
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
  phaseScanning
}