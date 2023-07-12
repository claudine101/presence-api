const { query } = require("../../utils/db");

/**
 * Permet de récuper volume
 * @param { string } userId 
 * @returns 
 */
const findFolio = async (userId) => {
    try {
        var requete=`
        SELECT * FROM  folio
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
        SELECT * FROM  folio
           WHERE 1
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper nature folio
 * @returns 
 */
const findNature = async () => {
    try {
        var requete=`
        SELECT * FROM  nature_folio
           WHERE 1
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper nature folio
 * @returns 
 */
const findMaille = async () => {
    try {
        var requete=`
        SELECT * FROM  maille
           WHERE 1
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};

/**
 * Permet de récuper les batimant
 * @returns 
 */
const findBatiment = async () => {
    try {
        var requete=`
        SELECT * FROM  batiment
           WHERE 1
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper les ailes
 * @param { string } ID_BATIMENT 
 * @returns 
 */
const findAiles = async (ID_BATIMENT) => {
    try {
        var requete=`
        SELECT * FROM  aile
           WHERE ID_BATIMENT=${ID_BATIMENT}
           `
        var sqlQuery = `CALL getTable(?)`;
        return query(sqlQuery, [requete]);
    } catch (error) {
        throw error;
    }
};
/**
 * Permet de récuper les agent de distributions par  aile
 * @param { string } ID_AILE
 * @returns 
 */
const findAgentDistributeurAile = async (ID_AILE) => {
    try {
        var requete=`
        SELECT * FROM affectation_users au 
        LEFT JOIN  users u ON u.USERS_ID=au.ID_USERS
         WHERE au.ID_AILE=${ID_AILE} AND  u.ID_PROFIL=29
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
const create = async (ID_VOLUME,ID_NATURE,NUMERO_FOLIO,CODE_FOLIO,ID_USERS,date) => {
    try {
        var values =`${ID_VOLUME},${ID_NATURE},'${NUMERO_FOLIO}','${CODE_FOLIO}',${ID_USERS},'${date}'`
        var tables =`folio`
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
    findFolio,
    findAll,
    create,
    createHisto,
    update,
    findNature,
    findMaille,
    findBatiment,
    findAiles,
    findAgentDistributeurAile
}