const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');

const Profils = sequelize.define('profils', {
    ID_PROFIL: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    DESCRIPTION: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'role',
        timestamps: false
    });
module.exports = Profils;