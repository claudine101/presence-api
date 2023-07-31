
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');

/**
* fonction model pour la creation de la table folio_types_documents
* @author habiyakare leonard <leonard@mediabox.bi>
* @date 31/07/2023
* @returns 
*/

const Folio_types_documents = sequelize.define("folio_types_documents", {
    ID_TYPE_FOLIO_DOCUMENT: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },

    ID_NATURE: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    NOM_DOCUMENT: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    freezeTableName: true,
    tableName: 'folio_types_documents',
    timestamps: false
})


module.exports = Folio_types_documents