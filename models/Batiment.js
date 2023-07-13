const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');

const Batiment = sequelize.define('batiment', {
    ID_BATIMENT: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    NUMERO_BATIMENT: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'batiment',
        timestamps: false
    });
    
module.exports = Batiment;