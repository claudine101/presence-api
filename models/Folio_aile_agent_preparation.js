
   

    
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Users = require('./Users');

/**
* fonction model pour la creation de la table folio_aile_agent_preparation
* @author NDAYISABA claudine <claudine@mediabox.bi>
* @date 16/07/2023
* @returns 
*/
const Folio_aile_agent_preparation = sequelize.define("folio_aile_agent_preparation", {
    ID_FOLIO_AILE_AGENT_PREPARATION: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    ID_USER_AILE_AGENT_PREPARATION: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    PATH_PV_AGENT_PREPARATION: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    PATH_PV_AGENT_PREPARATION_RETOUR: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    ID_ETAPE_FOLIO: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
}, {
    freezeTableName: true,
    tableName: 'folio_aile_agent_preparation',
    timestamps: false,
})
module.exports = Folio_aile_agent_preparation