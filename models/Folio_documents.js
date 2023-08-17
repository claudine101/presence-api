
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Folio = require('./Folio');
const Folio_types_documents = require('./Folio_types_documents');

/**
* fonction model pour la creation de la table folio_documents
* @author habiyakare leonard <leonard@mediabox.bi>
* @date 31/07/2023
* @returns 
*/

const Folio_documents = sequelize.define("folio_documents", {
    ID_FOLIO_DOCUMENT: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },

    ID_FOLIO: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    ID_TYPE_FOLIO_DOCUMENT: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    USERS_ID: {
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
    tableName: 'folio_documents',
    timestamps: false
})
Folio_documents.belongsTo(Folio_types_documents, { foreignKey: "ID_TYPE_FOLIO_DOCUMENT", as: 'types' })



module.exports = Folio_documents