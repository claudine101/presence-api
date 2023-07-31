const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table Folio_document_non_enregistres_historiques
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_document_non_enregistres_historiques = sequelize.define('folio_document_non_enregistres_historiques', {
    ID_HISTORIQUE    : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_FOLIO: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
   
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},
    {
        freezeTableName: true,
        tableName: 'folio_document_non_enregistres_historiques',
        timestamps: false
    });
    
module.exports = Folio_document_non_enregistres_historiques;