const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Profils = sequelize.define('profils', {
    ID_PROFIL: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    DESCRIPTION: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'profils',
        timestamps: false
    });
module.exports = Profils;