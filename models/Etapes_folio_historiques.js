
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Users = require('./Users');

/**
* fonction model pour la creation de la table etapes_folio_historiques
* @author NDAYISABA claudine <claudine@mediabox.bi>
* @date 15/07/2023
* @returns 
*/
const Etapes_folio_historiques = sequelize.define("etapes_folio_historiques", {
    ID_FOLIO_HISTORIQUE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    ID_USER: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_FOLIO_AILE_PREPARATION: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_FOLIO_AILE_AGENT_PREPARATION: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    ID_ETAPE_FOLIO:{
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    DATE_INSERTION:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
}
}, {
    freezeTableName: true,
    tableName: 'etapes_folio_historiques',
    timestamps: false,
})
module.exports = Etapes_folio_historiques