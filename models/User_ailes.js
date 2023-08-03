
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Aile = require('./Aile');
const Users = require('./Users');

/**
* fonction model pour la creation de la table user_ailes
* @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const User_ailes = sequelize.define("user_ailes", {
    ID_USER_AILE : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    USERS_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_AILE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    IS_ACTIF: {
        type: DataTypes.TINYINT,
        allowNull: false
    }

}, {
    freezeTableName: true,
    tableName: 'user_ailes',
    timestamps: false,
})
User_ailes.belongsTo(Aile, { foreignKey:"ID_AILE",as:'ailes'})
User_ailes.belongsTo(Users, { foreignKey:"USERS_ID",as:'users'})
module.exports = User_ailes