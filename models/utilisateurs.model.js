
// const { query } = require('../../..');
const { query } = require("../utils/db");
const moment = require("moment")

/**
 * Permet de récuper l'utilisateur comme client
 * @param { string } email 
 * @returns 
 */
const findUserLogin = async (email) => {
    try {
        var sqlQuery = `
        SELECT u.*,e.NOM_EMPLOYE,e.PRENOM_EMPLOYE,p.DESCRIPTION FROM  utilisateurs u JOIN employes e ON e.ID_UTILISATEUR=u.ID_UTILISATEUR JOIN profils p on p.ID_PROFIL=u.ID_PROFIL
    WHERE u.USERNAME =  ?
                    `;
        return query(sqlQuery, [email]);
    } catch (error) {
        throw error;
    }
};


const findBy = async (column, value) => {
    try {
        var sqlQuery = `SELECT * FROM users  WHERE ${column} = ? `;
        return query(sqlQuery, [value]);
    } catch (error) {
        throw error;
    }
};
const createOne = (
    departemants,
    profil,
    fileUrluser,
    NOM,
    PRENOM, EMAIL, TELEPHONE,
    PASSEWORD,
    fileUrlpermis,
    STATUT,
    fileUrlconduite,
    fileUrlcni,
    fileUrlassurence,
    fileUrlcontrole,
    fileUrlcarte,
    fileUrlvehicule,
    genre,
    banque, compte, titulaire,plaque) => {
    try {

        var sqlQuery = `
        INSERT INTO users(
            DEPARTEMENT_ID,
            ID_PROFIL,
            PHOTO_USER,
            STATUT,
            NOM,
            PRENOM,
            EMAIL,
            TELEPHONE,
            PASSEWORD,
            PERMIS,
            ATTEASTATION_CONDUITE,
            CNI,
            ASSURENCE,
            CONTROLE_TECHNIQUE,
            CARTE_ROSE,
            PHOTO_VEHICULE,
            GENRE,
            BANQUE,
            COMPTE,
            TITULAIRE,
            NUMERO_PLAQUE
        )
    values(?, ?,?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?)`;
        return query(sqlQuery, [
            departemants,
            profil,
            fileUrluser,
            STATUT,
            NOM, PRENOM, EMAIL,
            TELEPHONE, PASSEWORD,
            fileUrlpermis,
            fileUrlconduite,
            fileUrlcni,
            fileUrlassurence,
            fileUrlcontrole,
            fileUrlcarte,
            fileUrlvehicule,
            genre,
            banque, compte, titulaire,plaque])
    }
    catch (error) {

        throw error
    }
}
const findById = async (id) => {
    try {
        const dateCurren =moment(new Date());
        const dateCurrent = dateCurren.format('MM');

        return query("SELECT p.* ,DATE_FORMAT(p.DATE_PRESENCE, '%p')  as avant FROM  presences p  WHERE ID_UTILISATEUR  = ?  AND STATUT=1 AND date_format(DATE_PRESENCE,'%m')=? ORDER BY DATE_PRESENCE DESC", [id,dateCurrent]);
    } catch (error) {
        throw error;
    }
};
const findByIdRetard = async (id) => {
    try {
        const dateCurren =moment(new Date());
        const dateCurrent = dateCurren.format('MM');
        return query("SELECT p.* ,DATE_FORMAT(p.DATE_PRESENCE, '%p')  as avant FROM  presences p  WHERE ID_UTILISATEUR  = ? AND STATUT=0 AND date_format(DATE_PRESENCE,'%m')=? ORDER BY DATE_PRESENCE DESC", [id,dateCurrent]);
    } catch (error) {
        throw error;
    }
};
const findByIdAbsent = async (id) => {
    try {
        const dateCurrent =moment(new Date()).format("YYYY-MM-DD");
        return query("SELECT p.* ,DATE_FORMAT(p.DATE_PRESENCE, '%p') as avant FROM  presences p  WHERE ID_UTILISATEUR  = ?  AND date_format(DATE_PRESENCE,'%Y-%m-%d')=? ORDER BY DATE_PRESENCE DESC", [id,dateCurrent]);
    } catch (error) {
        throw error;
    }
};
module.exports = {
    findBy,
    createOne,
    findById,
    findUserLogin,
    findByIdRetard,
    findByIdAbsent

}