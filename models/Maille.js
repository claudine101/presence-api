const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Maille = sequelize.define('maille', {
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
        tableName: 'maille',
        timestamps: false
    });
module.exports = Maille;