const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');


/**
* fonction model pour la creation de la table folio_document_non_enregistres_historiques
* @author habiyakare leonard <leonard@mediabox.bi>
* @date 31/07/2023
* @returns 
*/

const Folio_document_non_enregistres_historiques = sequelize.define("folio_document_non_enregistres_historiques", {
    ID_HISTORIQUE: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },

    ID_FOLIO: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'folio_document_non_enregistres_historiques',
    timestamps: false
})


module.exports = Folio_document_non_enregistres_historiques