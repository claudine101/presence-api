const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequerize');

const Role = sequelize.define('nature_folio', {
    ID_NATURE_FOLIO: {
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
        tableName: 'nature_folio',
        timestamps: false
    });
module.exports = Role;