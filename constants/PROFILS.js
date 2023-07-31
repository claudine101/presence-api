const PROFILS = {

      /**
      * 1 - Chef de division des archives
      */
    CHEF_DIVISION_ARCHIGES :1,

      /**
      * 2 - Agents de desarchivages
      */
    AGENTS_DESARCHIVAGES :2,

    /**
      * 3 - Agents des superviseur archive
      */
    AGENTS_SUPERVISEUR_ARCHIVE :3,

    /**
      * 4 - Agents distributeur
      */
    AGENTS_DISTRIBUTEUR :4,

    /**
      * 5 - Agent superviseur aile (phase preparation)
      */
    AGENTS_SUPERVISEUR_AILE :5,

    /**
      * 6 - Chef plateau (phase preparation)
      */
    CHEF_PLATEAU :6,

    /**
      * 7 - Agent superviseur(phase preparation)
      */
    AGENT_SUPERVISEUR :7,

    /**
      * 8 - Agent preparation (phase preparation)
      */
    AGENT_PREPARATION :8,

    /**
      * 9 - Chef d'equipe (phase preparation)
      */
    CHEF_EQUIPE :9,

    /**
      * 10 - Chef d'equipe scanning (phase scanning)
      */
    CHEF_EQUIPE_SCANNING :10,
    /**
         * 11-Agent superviseur aile (phase scanning)
         * 
         */
    AGENT_SUPERVISEUR_AILE_SCANNING: 11,
    /**
    * 12-Chef plateau (phase scanning)
    * 
    */
    CHEF_PLATEAU: 12,
    /**
    * 13-Agent superviseur (phase scanning)
    * 
    */
    AGENT_SUPERVISEUR: 13,
    /**
     * 14-Chef d'equipe (phase indexation)
     * 
     */
    CHEF_EQUIPE_INDEXATION: 14,
    /**
     * 15-Agent superviseur aile (phase indexation)
     * 
     */
    AGENT_SUPERVISEUR_AILE_INDEXATION: 15,
    /**
* 16-Chef Plateau (phase Indexation)
* 
*/
    CHEF_PLATEAU_INDEXATION: 16,
    /**
* 17-Agent indexation (phase indexation)
* 
*/
    AGENT_INDEXATION: 17,
    /**
* 18-Chef d'equipe (phase upload EDRMS)
* 
*/
    CHEF_EQUIPE_PHASE_UPLOAD: 18,
    /**
* 19-Agent upload EDRMS (phase upload EDRMS)
* 
*/
    AGENT_UPLOAD_EDRMS: 19,
    /**
* 20-Verificateur upload EDRMS (phase upload EDRMS)
* 
*/
    VERIFICATEUR_UPLOAD: 20,
}

module.exports = PROFILS