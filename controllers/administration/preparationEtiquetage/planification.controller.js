const express = require("express")
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES")
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS")
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO")
const { Op } = require("sequelize")
const Volume = require("../../../models/Volume")
const Folio = require("../../../models/Folio")
const Etapes_volumes = require("../../../models/Etapes_volumes")
const Etapes_volume_historiques = require("../../../models/Etapes_volume_historiques")


/**
 * Permet d'afficher tous les volumes qui ont passe sur l'etape de planification
 * @date 18/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const planification = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "ASC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    NUMERO_VOLUME: 'NUMERO_VOLUME',
                    NOMBRE_DOSSIER: 'NOMBRE_DOSSIER',
                    DATE_INSERTION: 'DATE_INSERTION'
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
            orderColumn = sortColumns.volume.fields.NUMERO_VOLUME
            sortModel = {
                model: 'Etapes_volume_historiques',
                as: sortColumns.volume
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
            '$volume.NUMERO_VOLUME$',
            '$volume.NOMBRE_DOSSIER$',
            '$volume.DATE_INSERTION$',

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

        const result = await Etapes_volume_historiques.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: ['ID_VOLUME'],
            where: {
                ...globalSearchWhereLike,
                ID_ETAPE_VOLUME: {
                    [Op.ne]: 1
                }
            },
            include: [{
                model: Volume,
                as: "volume",
                required: false,
                attributes: ['NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'DATE_INSERTION'],
                include: {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }

            }]
        })

        const uniqueIds = [];
        const HistoriqueRows = result.rows.filter(element => {
            const isDuplicate = uniqueIds.includes(element.ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds.push(element.ID_VOLUME);
                return true;
            }
            return false;
        });



        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des utilisateurs",
            result: {
                data: HistoriqueRows,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape de des Désarchivage
 * @date  18/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const desarchivage = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "ASC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    NUMERO_VOLUME: 'NUMERO_VOLUME',
                    NOMBRE_DOSSIER: 'NOMBRE_DOSSIER',
                    DATE_INSERTION: 'DATE_INSERTION'
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
            orderColumn = sortColumns.volume.fields.NUMERO_VOLUME
            sortModel = {
                model: 'users',
                as: sortColumns.volume
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
            '$volume.NUMERO_VOLUME$',
            '$volume.NOMBRE_DOSSIER$',
            '$volume.DATE_INSERTION$',

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

        const result = await Etapes_volume_historiques.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: ['ID_VOLUME'],
            where: {

                ...globalSearchWhereLike,
                ID_ETAPE_VOLUME: {
                    [Op.notIn]: [1, 2]
                }
            },
            include: [{
                model: Volume,
                as: "volume",
                required: false,
                attributes: ['NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'DATE_INSERTION'],
                include: {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }

            }]
        })

        const uniqueIds = [];
        const HistoriqueRows = result.rows.filter(element => {
            const isDuplicate = uniqueIds.includes(element.ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds.push(element.ID_VOLUME);
                return true;
            }
            return false;
        });



        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des utilisateurs",
            result: {
                data: HistoriqueRows,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape de des trasmission des volumes
 * @date  18/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const transmission = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "ASC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    NUMERO_VOLUME: 'NUMERO_VOLUME',
                    NOMBRE_DOSSIER: 'NOMBRE_DOSSIER',
                    DATE_INSERTION: 'DATE_INSERTION'
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
            orderColumn = sortColumns.volume.fields.NUMERO_VOLUME
            sortModel = {
                model: 'users',
                as: sortColumns.volume
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
            '$volume.NUMERO_VOLUME$',
            '$volume.NOMBRE_DOSSIER$',
            '$volume.DATE_INSERTION$',
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

        const result = await Etapes_volume_historiques.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: ['ID_VOLUME'],
            where: {
                ...globalSearchWhereLike,
                ID_ETAPE_VOLUME: {
                    [Op.notIn]: [1, 2, 3, 4]
                }
            },
            include: [{
                model: Volume,
                as: "volume",
                required: false,
                attributes: ['NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'DATE_INSERTION'],
                include: {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }

            }]
        })

        const uniqueIds = [];
        const HistoriqueRows = result.rows.filter(element => {
            const isDuplicate = uniqueIds.includes(element.ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds.push(element.ID_VOLUME);
                return true;
            }
            return false;
        });
        console.log(result.count);
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des utilisateurs",
            result: {
                data: HistoriqueRows,
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
 * Permet d'afficher tous les volumes qui ont passee sur l'etape de des trasmission des volumes
 * @date  18/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */

const etiqutage = async (req, res) => {
    try {
        const Allplanification = await Etapes_volume_historiques.findAll({
            attributes: ['ID_VOLUME', 'ID_ETAPE_VOLUME'],
            where: {
                ID_ETAPE_VOLUME: 18
            },
            include: [{
                model: Volume,
                as: "volume",
                required: false,
                attributes: ['NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'DATE_INSERTION'],
                include: {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }
            },
            ]
        })
        // var volumeFolios = []
        // Allplanification.forEach(folio => {
        //     const ID_VOLUME = folio.ID_VOLUME
        //     const volume = folio.volume
        //     const isExists = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME) ? true : false
        //     if (isExists) {
        //         const volume = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME)
        //         const newVolumes = { ...volume, folios: [...volume.folios, folio] }
        //         volumeFolios = volumeFolios.map(vol => {
        //             if (vol.ID_VOLUME == ID_VOLUME) {
        //                 return newVolumes
        //             } else {
        //                 return vol
        //             }
        //         })
        //     } else {
        //         volumeFolios.push({
        //             ID_VOLUME,
        //             volume,
        //             folios: [folio]
        //         })
        //     }
        // })
        // var volumeScan = []
        // volumeFolios.forEach(volume => {
        //     var volume = volume
        //     const folioScan = volume.folios.filter(fol => fol.IS_PREPARE != 0)


        //     volumeScan.push({
        //         volume,
        //         folioScan
        //     })
        // })
        const uniqueIds = [];
        const HistoriqueRows = Allplanification.filter(element => {
            const isDuplicate = uniqueIds.includes(element.ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds.push(element.ID_VOLUME);
                return true;
            }
            return false;
        });



        const folio_by_volume = await Promise.all(HistoriqueRows.map(async countObject => {
            const folio = countObject.toJSON()
            const getFolio = await Folio.findAndCountAll({
                // include: [
                //     {
                //         model: Volume,
                //         as: "volume",
                //         // attributes: ['ID_FOLIO', 'NUMERO_FOLIO', 'CODE_FOLIO', 'NUMERO_PARCELLE', 'PHOTO_DOSSIER'],
                //         required: true,
                //     }
                // ],
                // where: {
                //     ID_VOLUME: HistoriqueRows.ID_VOLUME
                // }
            })
            console.log(Allplanification.ID_VOLUME);

            const uniqueIds = [];
            const folioRows = getFolio.rows.filter(element => {
                const isDuplicate = uniqueIds.includes(element.ID_FOLIO);
                if (!isDuplicate) {
                    uniqueIds.push(element.ID_FOLIO);
                    return true;
                }
                return false;
            });
            // const folioHistorique = {
            //   count: folioHistoriqueAll.count,
            //   rows: folioHistoriqueRows
            // }
            return {
                ...folio,
                count_agent_folio: folioRows.length,
                getFolio: {
                    rows: folioRows,
                    count: folioRows.length
                },
            }
        }))






        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Tous les volume planifier",
            result: HistoriqueRows
        })
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

/**
 * Permet d'afficher tous les volumes qui ont passe sur l'etape de l'indexation
 * @date 21/08/2023
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author eloge257 <nirema.eloge@mdiabox.bi>
 */
const indeation = async (req, res) => {
    try {
        const { rows = 10, first = 0, sortField, sortOrder, search } = req.query
        const defaultSortDirection = "ASC"
        const sortColumns = {
            volume: {
                as: "volume",
                fields: {
                    NUMERO_VOLUME: 'NUMERO_VOLUME',
                    NOMBRE_DOSSIER: 'NOMBRE_DOSSIER',
                    DATE_INSERTION: 'DATE_INSERTION'
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
            orderColumn = sortColumns.volume.fields.NUMERO_VOLUME
            sortModel = {
                model: 'Etapes_volume_historiques',
                as: sortColumns.volume
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
            '$volume.NUMERO_VOLUME$',
            '$volume.NOMBRE_DOSSIER$',
            '$volume.DATE_INSERTION$',

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

        const result = await Etapes_volume_historiques.findAndCountAll({
            limit: parseInt(rows),
            offset: parseInt(first),
            order: [
                [sortModel, orderColumn, orderDirection]
            ],
            attributes: ['ID_VOLUME'],
            where: {
                ...globalSearchWhereLike,
                ID_ETAPE_VOLUME: {
                    [Op.ne]: 1
                }
            },
            include: [{
                model: Volume,
                as: "volume",
                required: false,
                attributes: ['NUMERO_VOLUME', 'NOMBRE_DOSSIER', 'DATE_INSERTION'],
                include: {
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }

            }]
        })

        var volumeFolios = []
        result.forEach(folio => {
            const ID_VOLUME = folio.ID_VOLUME
            const volume = folio.volume
            const isExists = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME) ? true : false
            if (isExists) {
                const volume = volumeFolios.find(vol => vol.ID_VOLUME == ID_VOLUME)

                const newVolumes = { ...volume, folios: [...volume.folios, folio] }
                volumeFolios = volumeFolios.map(vol => {
                    if (vol.ID_VOLUME == ID_VOLUME) {
                        return newVolumes
                    } else {
                        return vol
                    }
                })
            } else {
                volumeFolios.push({
                    ID_VOLUME,
                    volume,
                    folios: [folio]
                })
            }
        })
        var volumeScan = []
        volumeFolios.forEach(volume => {
            var volume = volume
            const folioScan = volume.folios.filter(fol => fol.IS_INDEXE != 1)


            volumeScan.push({
                volume,
                folioScan
            })
        })

        const uniqueIds = [];
        const volumeSc = result.filter(element => {
            const isDuplicate = uniqueIds.includes(element.ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds.push(element.ID_VOLUME);
                return true;
            }
            return false;
        });

        // const uniqueIds = [];
        // const HistoriqueRows = result.rows.filter(element => {
        //     const isDuplicate = uniqueIds.includes(element.ID_VOLUME);
        //     if (!isDuplicate) {
        //         uniqueIds.push(element.ID_VOLUME);
        //         return true;
        //     }
        //     return false;
        // });

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Liste des utilisateurs",
            result: {
                data: volumeScan,
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

const etiquetage = async (req, res) => {
    try {
        const folios = await Folio.findAll({
            attributes:['NUMERO_FOLIO','CODE_FOLIO','ID_FOLIO','ID_VOLUME','ID_NATURE'],
            where: {
                ID_ETAPE_FOLIO:{
                    [Op.in]:[
                        IDS_ETAPES_FOLIO.FOLIO_NO_UPLOADED_EDRMS,
                    ]
                }         
            },
            include:
            {
                model: Volume,
                as: 'volume',
                attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                required: false,
                include: [{
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }
            ]
            }

        })
        const uniqueIds = [];
        const volumesPure = folios.filter(element => {
                  const isDuplicate = uniqueIds.includes(element.toJSON().ID_VOLUME);
                  if (!isDuplicate) {
                            uniqueIds.push(element.toJSON().ID_VOLUME);
                            return true;
                  }
                  return false;
        });

        const volumes = volumesPure.map(volume => {
            const foliovolume=folios.filter(f => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME )
            const folioprepare=folios.filter(f => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME  && f.toJSON().IS_PREPARE == 1)
            const foliononprepare=folios.filter(f => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME  && f.toJSON().IS_PREPARE == 0)
            return{
                ...volume.toJSON(),
                foliovolume,
                folioprepare,
                foliononprepare
            }
        })

       
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Le nombre de volume scanner   est egal à",
            result: volumes
        })
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



const indexation = async (req, res) => {
    try {
        const folios = await Folio.findAll({
            attributes:['NUMERO_FOLIO','CODE_FOLIO','ID_FOLIO','ID_VOLUME','ID_NATURE'],
            where: {
                ID_ETAPE_FOLIO:{
                    [Op.ne]:[
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_PREPARATION,
                        IDS_ETAPES_FOLIO.RETOUR_AGENT_PEPARATION_V_AGENT_SUP,
                        IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP_SCANNIMG,
                        IDS_ETAPES_FOLIO.SELECTION_EQUIPE_SCANNIMG,
                        IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,

                    ]
                }         
            },
            include:
            {
                model: Volume,
                as: 'volume',
                attributes: ['NOMBRE_DOSSIER', 'NUMERO_VOLUME', 'CODE_VOLUME', 'ID_VOLUME'],
                required: false,
                include: [{
                    model: Etapes_volumes,
                    as: 'etapes_volumes',
                    attributes: ['NOM_ETAPE'],
                    required: false
                }
            ]
            }

        })
        const uniqueIds = [];
        const volumesPure = folios.filter(element => {
                  const isDuplicate = uniqueIds.includes(element.toJSON().ID_VOLUME);
                  if (!isDuplicate) {
                            uniqueIds.push(element.toJSON().ID_VOLUME);
                            return true;
                  }
                  return false;
        });

        const volumes = volumesPure.map(volume => {
            const foliovolume=folios.filter(f => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME )
            const folioindexe=folios.filter(f => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME  && f.toJSON().IS_INDEXE == 1)
            const foliononindexe=folios.filter(f => volume.volume.ID_VOLUME == f.toJSON().ID_VOLUME  && f.toJSON().IS_INDEXE == 0)
            console.log(folioindexe);
            return{
                ...volume.toJSON(),
                foliovolume,
                folioindexe,
                foliononindexe
            }
        })

       
        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Le nombre de volume scanner   est egal à",
            result: volumes
        })
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
    planification,
    desarchivage,
    transmission,
    etiquetage,
    indexation
}