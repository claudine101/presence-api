const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table Folio_equipes
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_types_documents = sequelize.define('folio_types_documents', {
    ID_TYPE_FOLIO_DOCUMENT     : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_NATURE: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    NOM_DOCUMENT: {
        type: DataTypes.STRING(255),
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
        tableName: 'folio_types_documents',
        timestamps: false
    });
    
module.exports = Folio_types_documents;