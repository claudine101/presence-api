const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table Folio_documents
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_documents = sequelize.define('folio_documents', {
    ID_FOLIO_DOCUMENT   : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_FOLIO: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    ID_TYPE_FOLIO_DOCUMENT: {
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
        tableName: 'folio_documents',
        timestamps: false
    });
    
module.exports = Folio_documents;