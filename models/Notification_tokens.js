const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Notification_tokens = sequelize.define('notification_tokens', {
    ID_NOTIFICATION_TOKEN : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_UTILISATEUR: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DEVICE: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    TOKEN: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    LOCALE: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    ID_PROFIL: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue:DataTypes.NOW
    }

},
    {
        freezeTableName: true,
        tableName: 'notification_tokens',
        timestamps: false
    });
module.exports = Notification_tokens;