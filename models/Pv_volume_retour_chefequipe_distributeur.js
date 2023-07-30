const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

const Pv_retour_folio_chef_equipe_indexation = sequelize.define('pv_volume_retour_chefequipe_distributeur', {
    ID_PV_VOLUME_RETOUR_CHEFEQUIPE : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    PV_PATH: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    DATE_INSERTION: {
        type: DataTypes.DATE,
        allowNull: false
    }
},
    {
        freezeTableName: true,
        tableName: 'pv_volume_retour_chefequipe_distributeur',
        timestamps: false
    });
module.exports = Pv_retour_folio_chef_equipe_indexation;