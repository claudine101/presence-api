const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Notifications_receive = sequelize.define('notifications_receive', {
    ID_NOTIFICATIONS_RECEIVE  : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    TITRE: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    CONTENU: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    TOKEN: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    IS_READ: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue :0
    },
    DATE_INSERT: {
        type: DataTypes.DATE,
        allowNull: false
    },
    TO_ID_UTILISATEUR:{
        type: DataTypes.INTEGER,
        allowNull: true
    },
    ID_COURRIER:{
        type: DataTypes.INTEGER,
        allowNull: true
    }

},
    {
        freezeTableName: true,
        tableName: 'notifications_receive',
        timestamps: false
    });
module.exports = Notifications_receive;