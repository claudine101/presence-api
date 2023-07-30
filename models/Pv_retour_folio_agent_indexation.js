const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Pv_retour_folio_agent_indexation = sequelize.define('pv_retour_folio_agent_indexation', {
    ID_PV_RETOUR_FOLIO_AGENT_INDEXATION: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_USER	: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'pv_retour_folio_agent_indexation',
        timestamps: false
    });
module.exports = Pv_retour_folio_agent_indexation;