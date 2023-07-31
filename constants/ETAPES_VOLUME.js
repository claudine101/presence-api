const ETAPES_VOLUME= {
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
    CHOIX_CHEF_PLATAEU: 6,/**
    * 7-Retour: agent superviseur phase de preparation vers chef plateau
    */
   RETOUR_AGENT_SUP: 7,/**
   * 8-Retour: Chef plateau vers Agent superviseur aile
   */
    RETOUR_CHEF_PLATEAU: 8,
/**
   * 9-Selection du chef equipe scanning
   */
   
    SELECTION_CHEF_EQUIPE_SCANNING: 9
}

module.exports =  ETAPES_VOLUME