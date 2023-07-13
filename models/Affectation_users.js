const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');
const Users = require('./Users');
const Aile = require('./Aile');
/**
* fonction model pour la creation de la table affectation_users
* @author NDAYISABA claudined <claudined@mediabox.bi>
* @date 13/07/2023
* @returns 
*/
const Affectation_users = sequelize.define('affectation_users', {
    ID_AFFECTATION: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_USERS: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ID_AILE: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    ,
    ID_ROLE: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'affectation_users',
        timestamps: false
    });
Affectation_users.belongsTo(Users, { foreignKey: "ID_USERS", as: 'users' })
Affectation_users.belongsTo(Aile, { foreignKey: "ID_AILE", as: 'aile' })
Affectation_users.belongsTo(Role, { foreignKey: "ID_ROLE", as: 'role' })

module.exports = Affectation_users;