const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table folio_chef_plateaux_indexation
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_chef_plateaux_indexation = sequelize.define('folio_chef_plateaux_indexation', {
    ID_FOLIO_CHEF_PLATEAU_INDEXATION : {
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
        tableName: 'folio_chef_plateaux_indexation',
        timestamps: false
    });
    
module.exports = Folio_chef_plateaux_indexation;