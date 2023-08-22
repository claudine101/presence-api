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
    const phase = await Folio.findAll({
      include: {
        model: Equipes,
        as: 'equipe',
        required: true,
        attributes: ['ID_EQUIPE', 'NOM_EQUIPE']
      },
    });

    //group by
    const uniqueIds = [];
    const phaserows = phase.filter(element => {
      const isDuplicate = uniqueIds.includes(element.equipe.NOM_EQUIPE);
      if (!isDuplicate) {
        uniqueIds.push(element.equipe.NOM_EQUIPE);
        return true;
      }
      return false;
    });
    const phasedata = phaserows

    //find equipe
    const equipe = phasedata.map((equip) => {
      return equip.equipe.NOM_EQUIPE
    });

    //count dossiers scannees
    const numberdossiersScannees = await Promise.all(phasedata.map(async countObject => {
      const util = countObject.toJSON()
      const fetCmpt = await Folio.count({
        where: { ID_FOLIO_EQUIPE: util.ID_FOLIO_EQUIPE, IS_RECONCILIE: 1 }
      })
      return [fetCmpt]
    }))

    //count dossiers non scannees
    const numberdossiers_non_scannees = await Promise.all(phasedata.map(async countObject => {
      const util = countObject.toJSON()
      const fetCmpt = await Folio.count({
        where: { ID_FOLIO_EQUIPE: util.ID_FOLIO_EQUIPE, IS_RECONCILIE: 0 }
      })
      return [fetCmpt]
    }))

    //count dossiers en cours de traitement
    const numberdossiers_encours_traitement = await Promise.all(phasedata.map(async countObject => {
      const util = countObject.toJSON()
      const fetCmpt = await Folio.count({
        where: { ID_FOLIO_EQUIPE: util.ID_FOLIO_EQUIPE, IS_RECONCILIE: null }
      });
      return [fetCmpt]
    }))
    //highchart
    const options = {
      chart: {
        type: 'line'
      },
      title: {
        text: 'Rapport de la phase scanning'
      },
      xAxis: {
        categories: equipe
      },
      series: [{
        name: 'Dossiers Scannés',
        data: numberdossiersScannees
      },
      {
        name: 'Dossiers non Scannés',
        data: numberdossiers_non_scannees
      }, {
        name: 'Dossiers en attentes de traitement',
        data: numberdossiers_encours_traitement
      }
      ]
    }
    res.status(RESPONSE_CODES.OK).json({
      statusCode: RESPONSE_CODES.OK,
      httpStatus: RESPONSE_STATUS.OK,
      message: 'les dossiers',
      result: options
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