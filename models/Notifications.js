const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Notifications = sequelize.define('notifications', {
    ID_NOTIFICATION: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    USER_ID: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    MESSAGE: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    TELEPHONE: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false
    },
    NUMERO_PLAQUE: {
        type: DataTypes.STRING(250),
        allowNull: true
    },
    STATUT: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    IS_AGENT_PSR: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue:0
    },
    ID_PSR_ELEMENT: {
        type: DataTypes.INTEGER,
        allowNull: true
    }

},
    {
        freezeTableName: true,
        tableName: 'notifications',
        timestamps: false
    });
module.exports = Notifications;