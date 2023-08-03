
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../utils/sequelize');

/**
* fonction model pour la creation de la table aile
* @author derick <derick@mediabox.bi>
* @date 31/07/2023
* @returns 
*/
const Notifications_receive = sequelize.define("notifications_receive", {
    ID_NOTIFICATIONS_RECEIVE  : {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
        },
        TITRE:{
                type: Sequelize.STRING(255),
                allowNull: false
        },
        CONTENU:{
            type: Sequelize.TEXT,
            allowNull: false
       },
       TOKEN:{
        type: Sequelize.STRING(250),
        allowNull: false
       },
       IS_READ:{
        type: Sequelize.TINYINT(1),
        allowNull: false
      },
      DATE_INSERT:{
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue :DataTypes.NOW
      },
      TO_ID_UTILISATEUR:{
        type: Sequelize.INTEGER(11),
        allowNull: true,
       
      },
      ID_COURRIER:{
        type: Sequelize.INTEGER(11),
        allowNull:true,
       
      },
 
}, {
        freezeTableName: true,
        tableName: 'notifications_receive',
        timestamps: false,
})
module.exports = Notifications_receive