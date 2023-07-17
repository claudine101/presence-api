const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Users = require('./Users');
const Aile = require('./Aile');
const Role = require('./Role');
/**
* fonction model pour la creation de la table user_ailes
* @author NDAYISABA claudined <claudined@mediabox.bi>
* @date 17/07/2023
* @returns 
*/
const User_ailes = sequelize.define('user_ailes', {
    ID_AFFECTATION: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    USERS_ID: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_AILE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IS_ACTIF: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
    {
        
        freezeTableName: true,
        tableName: 'user_ailes',
        timestamps: false
    });

module.exports = User_ailes;