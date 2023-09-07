const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Motif = sequelize.define('motif', {
    ID_MOTIF: {
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
        tableName: 'motif',
        timestamps: false
    });
module.exports = Motif;