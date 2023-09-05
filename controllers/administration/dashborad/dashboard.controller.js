const express = require("express");
const RESPONSE_CODES = require("../../../constants/RESPONSE_CODES");
const RESPONSE_STATUS = require("../../../constants/RESPONSE_STATUS");
const IDS_ETAPES_FOLIO = require("../../../constants/ETAPES_FOLIO");
const IDS_ETAPE_VOLUME = require("../../../constants/ETAPES_VOLUME");
const PROFILS = require("../../../constants/PROFILS");
const { query } = require("../../../utils/db");
const Etapes_folio = require("../../../models/Etapes_folio");
const Nature_folio = require("../../../models/Nature_folio");
const Folio = require("../../../models/Folio");
const Volume = require("../../../models/Volume");
const { Op, where, DATE, Sequelize } = require("sequelize");
const moment = require("moment");
const Etapes_folio_historiques = require("../../../models/Etapes_folio_historiques");
const Users = require("../../../models/Users");
const Etapes_volumes = require("../../../models/Etapes_volumes");
const Etapes_volume_historiques = require("../../../models/Etapes_volume_historiques");
const Phases = require("../../../models/Phases");

/**
 * permet d'afficher les rapport des volumes et des dossiers
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 * @date 2/9/2023
 *
 */

const countAndProgressionActivity = async (req, res) => {
    try {
       
        const volumes = await Etapes_volume_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_VOLUME', 'ID_ETAPE_VOLUME'
            ],
            where: {
                DATE_INSERTION: Sequelize.literal('DATE(etapes_volume_historiques.DATE_INSERTION) = CURDATE()'),
            },
            include: [{
                model: Volume,
                as: "volume",
                attributes: [
                    'ID_VOLUME', 'NUMERO_VOLUME', 'CODE_VOLUME', 'DATE_INSERTION'
                ],
                require: true
            }, {
                model: Etapes_volumes,
                as: "etapes_volumes",
                attributes: [
                    'NOM_ETAPE'
                ],
                require: true
            }
            ]
        })
        const uniqueIds_volume = [];
        const allvolumes = volumes.filter((element) => {
            const isDuplicate = uniqueIds_volume.includes(element.toJSON().ID_VOLUME);
            if (!isDuplicate) {
                uniqueIds_volume.push(element.toJSON().ID_VOLUME);
                return true;
            }
            return false;
        });

        const foliocount = await Folio.count({
            where: {
                ID_VOLUME: allvolumes.map((volume) => volume.ID_VOLUME),
            },
        })

        // folio prepare  ajourd'hui
        const folio_prepare = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                DATE_INSERTION: Sequelize.literal('DATE(etapes_folio_historiques.DATE_INSERTION) = CURDATE()'),
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 1
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'CODE_FOLIO', 'DATE_INSERTION','ID_FOLIO'
                ],
                include: [{
                    model: Nature_folio,
                    as: "natures",
                    attributes: [
                        'DESCRIPTION',
                    ],
                }],
                where: {
                    IS_PREPARE: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_prepared = [];
        const folioprepare = folio_prepare.filter((element) => {
            const isDuplicate = uniqueIds_prepared.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_prepared.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        const folio_scan = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                DATE_INSERTION: Sequelize.literal('DATE(etapes_folio_historiques.DATE_INSERTION) = CURDATE()'),
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 2
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'CODE_FOLIO', 'DATE_INSERTION','ID_FOLIO'
                ],
                include: [{
                    model: Nature_folio,
                    as: "natures",
                    attributes: [
                        'DESCRIPTION',
                    ],
                }],
                where: {
                    IS_RECONCILIE: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_scan = [];
        const folioscan = folio_scan.filter((element) => {
            const isDuplicate = uniqueIds_scan.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_scan.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });


        // folio indexe  sous la phase d'indexation
        const folio_indexe = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                DATE_INSERTION: Sequelize.literal('DATE(etapes_folio_historiques.DATE_INSERTION) = CURDATE()'),
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 3
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'CODE_FOLIO', 'DATE_INSERTION','ID_FOLIO'
                ],
                include: [{
                    model: Nature_folio,
                    as: "natures",
                    attributes: [
                        'DESCRIPTION',
                    ],
                }],
                where: {
                    IS_INDEXE: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_indexe = [];
        const folioindexe = folio_indexe.filter((element) => {
            const isDuplicate = uniqueIds_indexe.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_indexe.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        //folio upload
        const folio_upload = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                DATE_INSERTION: Sequelize.literal('DATE(etapes_folio_historiques.DATE_INSERTION) = CURDATE()'),
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 4
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'CODE_FOLIO', 'DATE_INSERTION','ID_FOLIO'
                ],
                include: [{
                    model: Nature_folio,
                    as: "natures",
                    attributes: [
                        'DESCRIPTION',
                    ],
                }],
                where: {
                    IS_UPLOADED_EDRMS: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_upload = [];
        const folioupload = folio_upload.filter((element) => {
            const isDuplicate = uniqueIds_upload.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_upload.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_CODES.OK,
            message: "les dossiers",
            result: {
                allvolumes,
                foliocount,
                folioprepare,
                folioscan,
                folioindexe,
                folioupload,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        });
    }
};

/**
 * permet d'afficher les rapport par phase 
 * @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
 * @param {express.Request} req
 * @param {express.Response} res
 * @date 2/9/2023
 *
 */

const rapportByphase = async (req, res) => {
    try {

        const { startDate, endDate } = req.query;
        const today = new Date();
        // var todayFormat = moment(today).format("YYYY-MM-DD");
        // console.log(todayFormat);

        // Date filter
        var dateWhere = {
            DATE_INSERTION: Sequelize.literal('DATE(etapes_folio_historiques.DATE_INSERTION) = CURDATE()')
        };
        if (startDate) {
            
            const startDateFormat = moment(startDate).format("YYYY-MM-DD 00:00:00");
            const endDateFormat = endDate
                ? moment(endDate).format("YYYY-MM-DD 23:59:59")
                : moment().format("YYYY-MM-DD 23:59:59");
            dateWhere = {
                DATE_INSERTION: {
                    [Op.between]: [startDateFormat, endDateFormat],
                },
            };
        }

        //all folio sous la phase de preparation
        const all_folios = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 1
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                require: true
            }
            ]
        })
        const uniqueIds = [];
        const foliofilter = all_folios.filter((element) => {
            const isDuplicate = uniqueIds.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });
        // folio non  prepare  sous la phase de preparation
        const folio_nonprepare = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 1
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_PREPARE: 0
                },
                require: true
            }
            ]
        })
        const uniqueIds_nonprepared = [];
        const foliofilter_nonprepare = folio_nonprepare.filter((element) => {
            const isDuplicate = uniqueIds_nonprepared.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_nonprepared.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });


        // folio prepare  sous la phase de preparation
        const folio_prepare = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 1
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_PREPARE: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_prepared = [];
        const foliofilter_prepare = folio_prepare.filter((element) => {
            const isDuplicate = uniqueIds_prepared.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_prepared.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        //  tous les folio   sous la phase de scanning
        const all_folio_scan = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 2
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                require: true
            }
            ]
        })
        const uniqueIds_SCANall = [];
        const foliofilter_allscan = all_folio_scan.filter((element) => {
            const isDuplicate = uniqueIds_SCANall.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_SCANall.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });


        // folio scanne  sous la phase de scanning
        const folio_scan = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 2
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_RECONCILIE: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_scan = [];
        const foliofilter_scan = folio_scan.filter((element) => {
            const isDuplicate = uniqueIds_scan.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_scan.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        // folio non scanne  sous la phase de scanning
        const folio_nonscan = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 2
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_RECONCILIE: 0
                },
                require: true
            }
            ]
        })
        const uniqueIds_nonscan = [];
        const foliofilter_nonscan = folio_nonscan.filter((element) => {
            const isDuplicate = uniqueIds_nonscan.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_nonscan.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });
        //  tous les folio   sous la phase d'indexation
        const all_folio_indexe = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 3
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                require: true
            }
            ]
        })
        const uniqueIds_indexall = [];
        const foliofilter_allindexe = all_folio_indexe.filter((element) => {
            const isDuplicate = uniqueIds_indexall.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_indexall.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });


        // folio indexe  sous la phase d'indexation
        const folio_indexe = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 3
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_INDEXE: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_indexe = [];
        const foliofilter_indexe = folio_indexe.filter((element) => {
            const isDuplicate = uniqueIds_indexe.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_indexe.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        // folio non indexe  sous la phase d'indexation
        const folio_nonindexe = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 3
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_INDEXE: 0
                },
                require: true
            }
            ]
        })
        const uniqueIds_nonindexe = [];
        const foliofilter_nonindexe = folio_nonindexe.filter((element) => {
            const isDuplicate = uniqueIds_nonindexe.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_nonindexe.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });


        //  tous les folio   sous la phase d'upload
        const all_folio_upload = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 4
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                require: true
            }
            ]
        })
        const uniqueIds_uploadall = [];
        const foliofilter_allupload = all_folio_upload.filter((element) => {
            const isDuplicate = uniqueIds_uploadall.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_uploadall.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });


        // folio upload  sous la phase d'upload
        const folio_upload = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 4
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_UPLOADED_EDRMS: 1
                },
                require: true
            }
            ]
        })
        const uniqueIds_upload = [];
        const foliofilter_upload = folio_upload.filter((element) => {
            const isDuplicate = uniqueIds_upload.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_upload.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });

        // folio non upload  sous la phase d'upload
        const folio_nonupload = await Etapes_folio_historiques.findAll({
            attributes: [
                'DATE_INSERTION', 'ID_FOLIO', 'ID_ETAPE_FOLIO'
            ],
            where: {
                ...dateWhere,
            },
            include: [{
                model: Etapes_folio,
                as: "etapes",
                attributes: [
                    'ID_PHASE', 'NOM_ETAPE'
                ],
                where: {
                    ID_PHASE: 4
                },
                require: true
            }, {
                model: Folio,
                as: "folio",
                attributes: [
                    'NUMERO_FOLIO', 'ID_FOLIO', 'CODE_FOLIO'
                ],
                include: [{
                    model: Volume,
                    as: "volume",
                    attributes: [
                        'ID_VOLUME', 'NUMERO_VOLUME'
                    ]
                }, {
                    model: Nature_folio,
                    as: "natures",
                    attributes: ['DESCRIPTION']
                }],
                where: {
                    IS_UPLOADED_EDRMS: 0
                },
                require: true
            }
            ]
        })
        const uniqueIds_nonupload = [];
        const foliofilter_nonupload = folio_nonupload.filter((element) => {
            const isDuplicate = uniqueIds_nonupload.includes(element.toJSON().ID_FOLIO);
            if (!isDuplicate) {
                uniqueIds_nonupload.push(element.toJSON().ID_FOLIO);
                return true;
            }
            return false;
        });




        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Le nombre  est egal à",
            result: {

                foliofilterall: foliofilter,
                foliofilter_prepare: foliofilter_prepare,
                foliofilter_nonprepare: foliofilter_nonprepare,

                foliofilter_allscan: foliofilter_allscan,
                foliofilter_scan: foliofilter_scan,
                foliofilter_nonscan: foliofilter_nonscan,


                foliofilter_allindexe: foliofilter_allindexe,
                foliofilter_indexe: foliofilter_indexe,
                foliofilter_nonindexe: foliofilter_nonindexe,

                foliofilter_allupload: foliofilter_allupload,
                foliofilter_upload: foliofilter_upload,
                foliofilter_nonupload: foliofilter_nonupload

            }
        });
    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        });
    }
};


const rapportparsemaine = async (req, res) => {
    try {

        // const currentDate = moment("2023-08-14 14:00:47");
        const currentDate = moment();


        // Get the start and end of the current ISO week
        const startOfWeek = currentDate.clone().startOf('isoWeek');
        const endOfWeek = currentDate.clone().endOf('isoWeek');

        const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        const datesOfWeek = [];

        for (let date = startOfWeek.clone(); date.isSameOrBefore(endOfWeek, 'day'); date.add(1, 'day')) {
            const dayIndex = date.day() - 1; // Get the day of the week index (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            datesOfWeek.push({
                label: daysOfWeek[dayIndex],
                date: date.format('YYYY-MM-DD'), // You can format the date as needed
            });
        }

        const startDateFormat = moment(datesOfWeek[0].date).format("YYYY-MM-DD 00:00:00");
        const endDateFormat = moment(datesOfWeek[datesOfWeek.length - 1].date).format("YYYY-MM-DD 23:59:59")
        const allWeekly = await Etapes_folio_historiques.findAll({
            attributes: ['DATE_INSERTION', 'ID_ETAPE_FOLIO', 'ID_FOLIO', 'ID_FOLIO_HISTORIQUE'],
            where: {
                [Op.and]: [{
                    DATE_INSERTION: {
                        [Op.between]: [startDateFormat, endDateFormat]
                    },
                    ID_ETAPE_FOLIO: {
                        [Op.in]: [
                            IDS_ETAPES_FOLIO.SELECTION_AGENT_SUP,
                            // IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                            // IDS_ETAPES_FOLIO.RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING,
                            // IDS_ETAPES_FOLIO.RETOUR_AGENT_INDEX_CHEF_PLATEAU,
                            // IDS_ETAPES_FOLIO.FOLIO_UPLOADED_EDRMS
                        ]
                    }
                }]
            },
            include: [{
                model: Folio,
                as: 'folio',
                attributes: ['ID_FOLIO', 'ID_VOLUME', 'IS_PREPARE', 'IS_RECONCILIE', 'IS_INDEXE', 'IS_UPLOADED_EDRMS','CODE_FOLIO','NUMERO_FOLIO'],
                include: [{
                    model: Volume,
                    as: 'volume',
                    attributes: ['ID_VOLUME', 'DATE_INSERTION','NUMERO_VOLUME']
                },{
                    model: Nature_folio,
                    as: 'natures',
                    attributes: ['DESCRIPTION']
                }]
            },{
                model: Etapes_folio,
                as: 'etapes',
                attributes: ['NOM_ETAPE']
            }]
        })
        const reports = datesOfWeek.map(dayofWeek => {
            const planifies = allWeekly.filter(historique => {
                const isSameDay = moment(dayofWeek.date).isSame(moment(historique.DATE_INSERTION), 'day')
                return isSameDay
            })
            const prepares = allWeekly.filter(historique => {
                const isSameDay = moment(dayofWeek.date).isSame(moment(historique.DATE_INSERTION), 'day')
                return isSameDay && historique.folio.IS_PREPARE
            })
            const scannes = allWeekly.filter(historique => {
                const isSameDay = moment(dayofWeek.date).isSame(moment(historique.DATE_INSERTION), 'day')
                return isSameDay && historique.folio.IS_RECONCILIE
            })
            const indexes = allWeekly.filter(historique => {
                const isSameDay = moment(dayofWeek.date).isSame(moment(historique.DATE_INSERTION), 'day')
                return isSameDay && historique.folio.IS_INDEXE
            })
            const uploades = allWeekly.filter(historique => {
                const isSameDay = moment(dayofWeek.date).isSame(moment(historique.DATE_INSERTION), 'day')
                return isSameDay && historique.folio.IS_UPLOADED_EDRMS
            })
            return {
                ...dayofWeek,
                planifies,
                prepares,
                scannes,
                indexes,
                uploades
            }
        })

        res.status(RESPONSE_CODES.OK).json({
            statusCode: RESPONSE_CODES.OK,
            httpStatus: RESPONSE_STATUS.OK,
            message: "Le nombre  est egal à",
            result: reports
        });


    } catch (error) {
        console.log(error);
        res.status(RESPONSE_CODES.INTERNAL_SERVER_ERROR).json({
            statusCode: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
            httpStatus: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
            message: "Erreur interne du serveur, réessayer plus tard",
        });
    }



};




module.exports = {
    countAndProgressionActivity,
    rapportByphase,
    rapportparsemaine
};
