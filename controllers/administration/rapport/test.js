const express = require("express")
const RESPONSE_CODES = require("../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../constants/RESPONSE_STATUS")
const rapportparetape = require("../../models/rapportEtape/Rapport_etape")


const rapportEtape = async (req, res) => {
    try {

        const { idEtape } = req.params
        const [rapport] = await rapportparetape.rapportEtape(idEtape)
        const title = rapport[0].DESCRIPTION
        const categories = rapport.map(rap => rap.STATUT_DESCRIPTION)
        const data = rapport.map(rap => {
            return [
                rap.STATUT_DESCRIPTION,
                rap.nombre
            ]
        })

        var TOTAL = 0
        rapport.forEach(rap => {
           TOTAL += rap.nombre 
        })

        const options = {
            chart: {
                type: 'bar'
            },
            title: {
                text: [title, TOTAL]
            },
            xAxis: {
                categories
            },

            series: [{
                name: 'Nombre de requerants',
                data
            }
            ]
        }
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Affichage du rapport etape reussi!!",
            // result: rapport
            result: options
            
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
    rapportEtape
}
