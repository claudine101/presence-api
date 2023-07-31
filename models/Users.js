
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table users
* @author NIREMA ELOGE <nirema.eloge@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Users = sequelize.define("users", {
    USERS_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    DEPARTEMENT_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    NOM: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    PRENOM: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    EMAIL: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    TELEPHONE: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    ID_PROFIL: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    STATUT: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PASSEWORD: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    CNI: {
        type: DataTypes.STRING(255),
        allowNull: true

    },

    PHOTO_USER: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    IS_ACTIF: {
        type: DataTypes.INTEGER,
        allowNull: false

    }

}, {
    freezeTableName: true,
    tableName: 'users',
    timestamps: false,
})
module.exports = Users