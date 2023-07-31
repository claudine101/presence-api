const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table folio_agent_sup_aile_indexation
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_agent_sup_aile_indexation = sequelize.define('folio_agent_sup_aile_indexation', {
    ID_FOLIO_AGENT_SUP_AILE_INDEXATION : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_USER: {
        type: DataTypes.INTEGER(11),
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
},
    {
        freezeTableName: true,
        tableName: 'folio_agent_sup_aile_indexation',
        timestamps: false
    });
    
module.exports = Folio_agent_sup_aile_indexation;