const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table flashs
* @author JOSPIN Ba <jospin@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Flashs = sequelize.define('flashs', {
    ID_FLASH : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NOM_FLASH: {
        type: DataTypes.STRING(55),
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
        tableName: 'flashs',
        timestamps: false
    });
    
module.exports = Flashs;