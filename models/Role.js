const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Role = sequelize.define('role', {
    ID_ROLE: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    DESC_ROLE: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'role',
        timestamps: false
    });
module.exports = Role;