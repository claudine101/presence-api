const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Folio_verificateur_upload_edrms = sequelize.define('folio_verificateur_upload_edrms', {
    ID_FOLIO_VERIFICATEUR_UPLOAD_EDRMS: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_USER	: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: true
    }
},
    {
        freezeTableName: true,
        tableName: 'folio_verificateur_upload_edrms',
        timestamps: false
    });
module.exports = Folio_verificateur_upload_edrms;