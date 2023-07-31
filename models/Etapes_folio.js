
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table etapes_folio
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Etapes_folio = sequelize.define("etapes_folio", {
        ID_ETAPE_FOLIO: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        NOM_ETAPE: {
                type: DataTypes.STRING(255),
                allowNull: false
        },
        ID_PHASE: {
                type: Sequelize.INTEGER(),
                allowNull: false,
                defaultValue: 1
        },
}, {
        freezeTableName: true,
        tableName: 'etapes_folio',
        timestamps: false,
})
module.exports = Etapes_folio