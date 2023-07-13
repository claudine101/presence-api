const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Profils = require('./Profils');

const Users = sequelize.define('users', {
    USERS_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
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
        allowNull: false
    },
    TELEPHONE: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    ID_PROFIL: {
        type: DataTypes.INTEGER,
        allowNull: false
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
        type: DataTypes.INTEGER(245),
        allowNull: false,
        defaultValue: "1"
    }
},
    {
        freezeTableName: true,
        tableName: 'users',
        timestamps: false
    });


Users.belongsTo(Profils, { foreignKey: "ID_PROFIL", as: 'profil' })

module.exports = Users;