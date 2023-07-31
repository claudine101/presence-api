const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table Folio_chef_equipes_upload_edrms
* @author derick <derick@mediabox.bi>
* @date 29/07/2023
* @returns 
*/

const Folio_chef_equipes_upload_edrms = sequelize.define('folio_chef_equipes_upload_edrms', {
    ID_FOLIO_CHEF_EQUIPE_UPLOAD_EDRMS   : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    ID_USER: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},
    {
        freezeTableName: true,
        tableName: 'folio_chef_equipes_upload_edrms',
        timestamps: false
    });
    
module.exports = Folio_chef_equipes_upload_edrms;