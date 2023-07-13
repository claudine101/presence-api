const { query } = require("../../utils/db");

/**
 * Permet de récuper tous les volumes d'un users connecte
 * @param { string } userId 
 * @returns 
 */
const findOne = async (ID_VOLUME) => {
    try {
        var requete=`
        SELECT * FROM  volume
           WHERE ID_VOLUME = ${ID_VOLUME}
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper un volume
 * @param { string } userId 
 * @returns 
 */
const findVolume = async (userId) => {
    try {
        var requete=`
        SELECT * FROM  volume
           WHERE ID_USERS = ${userId}
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper volume
 * @param { string } userId 
 * @returns 
 */
const findAll = async () => {
    try {
        var requete=`
        SELECT * FROM  volume
           WHERE 1
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper volume
 * @param { string } userId 
 * @returns 
 */
const update = async (NOMBRE_DOSSIER,ID_USERS,ID_VOLUME) => {
    try {
        var tableused=`volume`
        var datatomodifie=`NOMBRE_DOSSIER=${NOMBRE_DOSSIER},ID_USERS=${ID_USERS}`
        var conditions=`ID_VOLUME=${ID_VOLUME}`
        var sqlQuery = `CALL updateData(?,?,?)`;
        return query(sqlQuery, [tableused,datatomodifie,conditions]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper volume
 * @param { string } userId 
 * @returns 
 */
const create = async (NUMERO_VOLUME,CODE_VOLUME,ID_USERS) => {
    try {
        var values =`'${NUMERO_VOLUME}','${CODE_VOLUME}',${ID_USERS}`
        var tables =`volume`
        var sqlQuery =`CALL insertLastIdIntoTable(?,?)`;
        return query(sqlQuery, [tables,values]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet d'Iinser dans latable volume_volume
 * @param { string } PV_PATH 
 * @returns 
 */
const createHisto = async (PV_PATH,USERS_ID,date) => {
    try {
        var tableused=`volume_pv`
        var datatoinsert =`'${PV_PATH}',${USERS_ID},'${date}'`;
        var sqlQuery =`CALL insertIntoTable(?,?)`;
        return query(sqlQuery, [tableused,datatoinsert]);
    } catch (error) {
        throw error;
    }
};
module.exports = {
    findVolume,
    findAll,
    create,
    createHisto,
    update,
    findOne
}