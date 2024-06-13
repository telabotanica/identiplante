export class Protocole {
  protocole_descriptif: string;
  protocole_id: string;
  protocole_identifie: string;
  protocole_intitule: string;
  protocole_mots_cles: string;
  protocole_tag: string;


  constructor(protocole_descriptif: string, protocole_id: string, protocole_identifie: string, protocole_intitule: string, protocole_mots_cles: string, protocole_tag: string) {
    this.protocole_descriptif = protocole_descriptif;
    this.protocole_id = protocole_id;
    this.protocole_identifie = protocole_identifie;
    this.protocole_intitule = protocole_intitule;
    this.protocole_mots_cles = protocole_mots_cles;
    this.protocole_tag = protocole_tag;
  }
}
