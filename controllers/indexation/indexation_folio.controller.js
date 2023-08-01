const express = require('express')
const Folio = require('../../models/Folio')

/**
 * Permet de recuperer les folio qui ont un etape quelconque
 * @author darcydev <darcy@mediabox.bi>
 * @param {express.Request} req 
 * @param {express.Response} res 
 */
const getFolioByEtapes = async (req, res) => {
          try {
                    const { ID_ETAPE_FOLIO } = req.params
                    const folios = await Folio.findAll({
                              where: { ID_ETAPE_FOLIO }
                    })
                    res.status(RESPONSE_CODES.OK).json({
                              statusCode: RESPONSE_CODES.OK,
                              httpStatus: RESPONSE_STATUS.OK,
                              message: "Liste des folio d'une etape",
                              result: folios
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

module.exports = {
          getFolioByEtapes
}