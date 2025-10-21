export class Observation {
  auteur_courriel: string;
  auteur_id: string;
  auteur_nom: string;
  commentaires: any;
  date_observation: string;
  date_transmission: string;
  determination_famille: string;
  determination_nn: string;
  determination_ns: string;
  determination_nt: string;
  determination_referentiel: string;
  hauteur: string;
  id_image: string;
  id_observation: string;
  id_zone_geo: string;
  images: any;
  largeur: string;
  mots_cles_texte: string;
  nb_commentaires: string;
  nom_original: string;
  pays: string;
  station: string;
  zone_geo: string;
  certitude: string;
  input_source: string;

  constructor(auteur_courriel: string, auteur_id: string, auteur_nom: string, commentaires: any, date_observation: string, date_transmission: string, determination_famille: string, determination_nn: string, determination_ns: string, determination_nt: string, determination_referentiel: string, hauteur: string, id_image: string, id_observation: string, id_zone_geo: string, images: any, largeur: string, mots_cles_texte: string, nb_commentaires: string, nom_original: string, pays: string, station: string, zone_geo: string, certitude: string, input_source: string) {
    this.auteur_courriel = auteur_courriel;
    this.auteur_id = auteur_id;
    this.auteur_nom = auteur_nom;
    this.commentaires = commentaires;
    this.date_observation = date_observation;
    this.date_transmission = date_transmission;
    this.determination_famille = determination_famille;
    this.determination_nn = determination_nn;
    this.determination_ns = determination_ns;
    this.determination_nt = determination_nt;
    this.determination_referentiel = determination_referentiel;
    this.hauteur = hauteur;
    this.id_image = id_image;
    this.id_observation = id_observation;
    this.id_zone_geo = id_zone_geo;
    this.images = images;
    this.largeur = largeur;
    this.mots_cles_texte = mots_cles_texte;
    this.nb_commentaires = nb_commentaires;
    this.nom_original = nom_original;
    this.pays = pays;
    this.station = station;
    this.zone_geo = zone_geo;
    this.certitude = certitude;
    this.input_source = input_source;
  }
}
