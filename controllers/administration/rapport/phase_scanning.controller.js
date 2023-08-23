const express = require("express")
const RESPONSE_CODES = require('../../../constants/RESPONSE_CODES')
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const Folio = require("../../../models/Folio")
const { Op } = require("sequelize")
const Equipes = require("../../../models/Equipes")
const Volume = require("../../../models/Volume")
const Nature_folio = require("../../../models/Nature_folio")
const Users = require("../../../models/Users")
const moment = require("moment")
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques")
const Etapes_folio = require("../../../models/Etapes_folio")
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO")

/**
 * Fonction du rapport des dossiers scannes et non scanes par equipes,
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author leonard<leonard@mdiabox.bi>
 * @date 21/08/2023
 */
const phaseScanning = async (req, res) => {
  try {

    const { startDate, endDate } = req.query
    // Date filter
    var dateWhere = {}
    if (startDate) {
      const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00")
      const endDateFormat = endDate ?
        moment(endDate).format("YYYY-MM-DD 23:59:59") :
        moment().format("YYYY-MM-DD 23:59:59")
      dateWhere = {
        DATE_INSERTION: {
          [Op.between]: [startDateFormat, endDateFormat]
        }
      }
    }
    //find all equipes
    const equipes = await Equipes.findAll({});

    //count dossiers scannees
    const scannes = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const histo_folios = await Etapes_folio_historiques.findAndCountAll({
        where: {
          ID_ETAPE_FOLIO:IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
          ...dateWhere
        },
        include: {
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO', 'IS_RECONCILIE', 'NUMERO_FOLIO'],
          where: {
            ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: 1
          },
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        },
      })
      return {
        ...util,
        histo_folios
      }
    }))

    //count dossiers non scannees
    const nonScannes = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const histo_folios = await Etapes_folio_historiques.findAndCountAll({
        where: {
          ID_ETAPE_FOLIO:IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
          ...dateWhere
        },
        include: {
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO', 'IS_RECONCILIE', 'NUMERO_FOLIO'],
          where: {
            ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: 0
          },
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        },
      })
      return {
        ...util,
        histo_folios
      }
    }))

    //count dossiers en cours de traitement
    const nonTraites = await Promise.all(equipes.map(async countObject => {
      const util = countObject.toJSON()
      const histo_folios = await Etapes_folio_historiques.findAndCountAll({
        where:{
          ID_ETAPE_FOLIO:IDS_ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
          ...dateWhere
        },
        include: {
          model: Folio,
          as: 'folio',
          required: true,
          attributes: ['ID_FOLIO', 'FOLIO', 'IS_RECONCILIE', 'NUMERO_FOLIO'],
          where: {
            ID_FOLIO_EQUIPE: util.ID_EQUIPE, IS_RECONCILIE: null
          },
          include: [{
            model: Volume,
            as: 'volume',
            required: true,
            attributes: ['ID_VOLUME', 'NUMERO_VOLUME']
          },
          {
            model: Nature_folio,
            as: 'natures',
            required: true,
            attributes: ['ID_NATURE_FOLIO', 'DESCRIPTION']
          },
          {
            model: Etapes_folio,
            as: 'etapes',
            required: true,
            attributes: ['ID_ETAPE_FOLIO', 'NOM_ETAPE', 'ID_PHASE']
          }
          ]
        },
      })
      return {
        ...util,
        histo_folios
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