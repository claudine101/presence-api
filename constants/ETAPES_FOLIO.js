
/**
* constantes pour le etapes du folio
* @author Vanny Boy <vanny@mediabox.bi>
* @date 31/07/2023
*/
const IDS_ETAPES_FOLIO = {
  /**
   * 1 - Selection d'un agent superviseur: phase de preparation
  */
  SELECTION_AGENT_SUP: 1,
  /**
  * 2 - Selection d'un agent preparation
  */
  SELECTION_AGENT_PREPARATION: 2,

  /**
  * 3 - Retour: agent preparation vers agent superviseur phase de preparation
  */
  RETOUR_AGENT_PEPARATION_V_AGENT_SUP: 3,

  /**
  * 4 - Selection d'un agent sup. scanning
  */
  SELECTION_AGENT_SUP_SCANNIMG: 4,
  /**
  * 5 - Selection equipe scanning
  */
  SELECTION_EQUIPE_SCANNIMG: 5,
  /**
   * 6 - Retour: Scan et reconcilie (equipe scanning vers agent sup. scanning)
   */
  RETOUR_EQUIPE_SCANNING_V_AGENT_SUP_SCANNING: 6,
  /**
   * 7 - Retour: Validation scan et reconcilie (agent sup. scanning et chef plateau)
   */
  RETOUR_AGENT_SUP_SCANNING_V_CHEF_PLATEAU: 7,
  /**
   * 8 - Mettre les folio dans les flashs
   */
  METTRE_FOLIO_FLASH: 8,
  /**
   * 9 - Selection d'un agent sup aile indexation
   */
  SELECTION_AGENT_SUP_AILE_INDEXATION: 9,
  /**
   * 10 - Selection d'un chef plateau indexation
   */
  SELECTION_CHEF_PLATEAU_INDEXATION: 10,

  /**
   * 11 - Selection agent indexation
   */
  SELECTION_AGENT_INDEXATION: 11,

  /**
    * 12 - Retour: agent indexation vers Chef plateau indexation
    */
  RETOUR_AGENT_INDEX_CHEF_PLATEAU: 12,

  /**
    * 13 - Retour: Chef plateau indexation vers Agent Sup aile indexation
    */
  RETOUR_CHEF_PLATEAU_AGENT_SUP_AILE: 13,

  /**
    * 14- Retour: Agent Sup aile indexation vers Chef equipe
    */
  RETOUR_AGENT_SUP_AILE_CHEF_EQUIPE: 14,

  /**
    * 15 - Chef equipe upload EDRMS prends le flash
    */
  CHEF_EQUIPE_EDRMS: 15,

  /**
    * 16 - Selection agent upload EDRMS
    */
  SELECTION_AGENT_EDRMS: 16,

  /**
    * 17 - Folio uploaded to EDRMS
    */
  FOLIO_UPLOADED_EDRMS: 17,

  /**
    * 18 - Folio uploaded to EDRMS
    */
  FOLIO_NO_UPLOADED_EDRMS: 18,

  /**
    * 19 - Selection verificateur upload EDRMS
    */
  SELECTION_VERIF_EDRMS: 19,

  /**
    * 20 - Folio enregistre to EDRMS
    */
  FOLIO_ENREG_TO_EDRMS: 20,

  /**
    * 21 - Folio no enregistre to EDRMS
    */
  FOLIO_NO_ENREG_TO_EDRMS: 21,
  /**
    * 22 - Folio  enregistre
    */
  FOLIO_ENREG: 22,
  /**
   * 23 - Ajout  details dans un folio
   */
  ADD_DETAILLER_FOLIO: 23,

  /**
 * 24 - Retour: agent superviseur phase de preparation vers  chef plateaus
 */
  RETOUR__AGENT_SUP_V_CHEF_PLATEAU: 24,
  /**
   * 25- Retour: Agent upload vers Chef equipe
   */
  RETOUR_AGENT_UPLOAD_CHEF_EQUIPE: 25,
  /**
  * 26 - Retour: Sans reconcilie et sans Scan (equipe scanning vers agent sup. scanning)
  */
  RETOUR_EQUIPE_SCANNING_SANS_RECO_SANS_SCAN_V_AGENT_SUP_SCANNING: 26,

  /**
 * 27 - Retour: is non Valide meme si il'est reconcilier (agent sup. scanning vers chef plateau scanning)
 */
  RETOUR_AGENT_SUP_SCANNING_IS_NON_VALIDE_V_CHEF_PLATEAU: 27,



  /**
* 33 - Reenvoyer: le volume avec les folios non valide (chef equipe scanning vers agent sup aille scanning)
*/
  REENVOYER_CHEF_EAUIPE_SCANNING_VERS_AGENT_SUP_AILLE_SCANNING: 33,
  /**
* 34 - Reenvoyer: le volume avec les folios non valide (agent sup aille scanning vers chef plateau scanning)
*/
  REENVOYER_VOL_AGENT_SUP_AILLE_SCANNING_VERS_CHEF_PLATEAU_SCANNING: 34,
    /**
* 35 - Reenvoyer: le volume avec les folios non valide (chef plateau scanning vers agent superviseur)
*/
REENVOYER_CHEF_PLATEAU_SCANNING_VERS_AGENT_SUPERVISEUR_SCANNING: 35,

}

module.exports = IDS_ETAPES_FOLIO