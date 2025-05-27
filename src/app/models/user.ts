export class User {
  id_utilisateur: string;
  courriel: string;
  intitule: string;
  nom: string;
  prenom: string;
  admin: number;
  connecte: boolean;
  date_derniere_consultation_evenements: string;
  session_id: string;


  constructor(id_utilisateur: string, courriel: string, intitule: string, nom: string, prenom: string, admin: number, connecte: boolean, date_derniere_consultation_evenements: string, session_id: string) {
    this.id_utilisateur = id_utilisateur;
    this.courriel = courriel;
    this.intitule = intitule;
    this.nom = nom;
    this.prenom = prenom;
    this.admin = admin;
    this.connecte = connecte;
    this.date_derniere_consultation_evenements = date_derniere_consultation_evenements;
    this.session_id = session_id;
  }


}
