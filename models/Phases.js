const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Phases = sequelize.define('phases', {
    ID_PHASE : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NOM_PHASE: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'phases',
        timestamps: false
    });
module.exports = Phases;