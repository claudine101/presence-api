const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');
const Batiment = require('./Batiment');

const Aile = sequelize.define('aile', {
    ID_AILE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_BATIMENT: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    NUMERO_AILE: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'aile',
        timestamps: false
    });
Aile.belongsTo(Batiment, { foreignKey: "ID_BATIMENT", as: 'batiment' })
module.exports = Aile;