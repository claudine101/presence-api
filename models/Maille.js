const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');

const Maille = sequelize.define('role', {
    ID_MAILLE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_AILE: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    NUMERO_MAILLE: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'role',
        timestamps: false
    });
module.exports = Maille;