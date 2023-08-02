
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Users = require('./Users');
const Etapes_folio = require('./Etapes_folio');

/**
* fonction model pour la creation de la table etapes_folio_historiques
* @author NDAYISABA claudine <claudined@mediabox.bi>
* @date 31/07/2023
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
        type: DataTypes.INTEGER(),
        allowNull: false
    },
    USER_TRAITEMENT: {
        type: DataTypes.INTEGER(),
        allowNull: false
    },
    ID_FOLIO: {
        type: DataTypes.INTEGER(),
        allowNull: true
    },
    ID_ETAPE_FOLIO: {
        type: DataTypes.INTEGER(),
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'etapes_folio_historiques',
    timestamps: false,
})

Etapes_folio_historiques.belongsTo(Etapes_folio, { foreignKey: "ID_ETAPE_FOLIO", as: 'etapes' })
Etapes_folio_historiques.belongsTo(Users, { foreignKey: "ID_USER", as: 'user' })
Etapes_folio_historiques.belongsTo(Users, { foreignKey: "USER_TRAITEMENT", as: 'traitement' })


module.exports = Etapes_folio_historiques