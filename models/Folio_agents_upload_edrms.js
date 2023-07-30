const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table folio_agents_upload_edrms
* @author JOSPIN Ba <jospin@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_agents_upload_edrms = sequelize.define('folio_agents_upload_edrms', {
    ID_FOLIO_AGENT_UPLOAD_EDRMS : {
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
        tableName: 'folio_agents_upload_edrms',
        timestamps: false
    });
    
module.exports = Folio_agents_upload_edrms;