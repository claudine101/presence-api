const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');


/**
* fonction model pour la creation de la table desarchivage_volume
* @author JOSPIN Ba <jospin@mediabox.bi>
* @date 29/07/2023
* @returns 
*/
const Desarchivage_volume = sequelize.define('desarchivage_volume', {
    ID_DESARCHIVAGE_VOLUME: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_VOLUME: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_MALLE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_USER_AILE_DISTRIBUTEUR: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'desarchivage_volume',
        timestamps: false
    });
module.exports = Desarchivage_volume;