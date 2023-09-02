const ETAPES_VOLUME = {
  /**
   * 1-planification
   */
  PLANIFICATION: 1,
  /**
   * 2-Saisis du nombre de folio
   */
  SAISIS_NOMBRE_FOLIO: 2,
  /**
   *  3-Detailler les folio
   */
  DETAILLER_LES_FOLIO: 3,
  /**
   * 4-Choix des ailes
   */
  CHOIX_DES_AILES: 4,
  /**
   * 5-Choix agent  superviseur  aile
   */
  CHOIX_AGENT_SUPERVISEUR_DES_AILES: 5,
  /**
   * 6-Choix chef plateau
   */
  CHOIX_CHEF_PLATAEU: 6,
  /**
  * 7-Retour: agent superviseur phase de preparation vers chef plateau
  */
  RETOUR_AGENT_SUP: 7,

  /**
   *  8-Retour: Chef plateau vers Agent superviseur aile
   */
  RETOUR_CHEF_PLATEAU: 8,

  /**
   * 9-Selection du chef equipe scanning
   */
  SELECTION_CHEF_EQUIPE_SCANNING: 9,

  /**
   * 10-Selection d'un agent sup. aile scanning pour les folio traites
   */
  SELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_TRAITES: 10,

  /**
  * 11-Reselection d'un agent sup.aile pour les folio non traites
  */
  RESELECTION_AGENT_SUP_AILE_SCANNING_FOLIO_NON_TRAITES: 11,

  /**
   * 12-Selection du chef plateau scanning
   */
  SELECTION_CHEF_PLATEAU_SCANNING: 12,

  /**
   * 13-Retour: chef plateau scanning et agent sup aile scanning
   */
  RETOUR_CHEF_PLATEAU_ET_AGENT_SUP_AILE_SCANNING: 13,

  /**
   * 14-Retour: agent sup aile scanning vers chef equipe scanning
   */
  RETOUR_AGENT_SUP_VERS_CHEF_EQUIPE_SCANNING: 14,

  /**
   * 15-Retour: chef equipe vers agent distributeur
   */
  RETOUR_CHEF_EQUIPE_VERS_AGENT_DISTRIBUTEUR: 15,

  /**
  * 16-Retour: Agent distributeur vers agent sup. archive
  */
  RETOUR_AGENT_DISTRIBUTEUR_VERS_AGENT_SUP_ARCHIVE: 16,

  /**
   * 17-Retour:agent sup. archive vers agent de desarchivage 
   */
  RETOUR_AGENT_SUP_ARCHIVE_VERS_AGENT_DESARCHIVAGE: 17,
  /**
* 18-Retour:agent sup aile vers chef d'equipe (phase preparation) 
*/
  RETOUR_AGENT_SUP_AILE_VERS_CHEF_EQUIPE: 18,

  /**
* 19-Retour : Archivages des volumes retourner chez un agent de desarchivages
*/
  RETOUR_ARCHIVE_VOLUME_AGENT_DESARCHIVAGES: 19,

    /**
* 21-Retour : Retour de volumes chef equipe scanning et agent superviseur aile scanning
*/
RETOUR_CHEF_EQUI_SCANNINF_AGENT_SUP_AILE_SCANNING: 21
}


module.exports = ETAPES_VOLUME