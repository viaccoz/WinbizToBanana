# WinbizToBanana

Instructions pour migrer les données du logiciel de comptabilité [Winbiz](https://www.winbiz.ch/) vers [Banana](https://www.banana.ch/).

# Exporter de Winbiz

## Exporter le plan comptable

1. Ouvrir les écritures
	* Comptabilité → Plan comptable
1. Démarrer l'export
	* Outils → Importer, exporter → Exporter
1. Définir le format
	* Type de fichier : Délimité par des virgules (CSV)
1. Définir les options
	* Options d'exportation → Jeu de caractères : Windows Ansi - 1252
1. Valider
	* Démarrer

## Exporter les écritures comptables

1. Ouvrir les écritures
	* Comptabilité → Ecritures
1. Démarrer l'export
	* Outils → Importer, exporter → Exporter
1. Définir le format
	* Type de fichier : Délimité par des virgules (CSV)
1. Définir les options
	* Options d'exportation → Jeu de caractères : Windows Ansi - 1252
1. Valider
	* Démarrer

# Importer dans Banana

## Installer les extensions

1. Ouvrir les extensions
	* Extensions → Gérer extensions...
1. Installer l'extension pour l'import du plan comptable
	* Ajouter de l'url... → Insérer url : https://raw.githubusercontent.com/viaccoz/WinbizToBanana/main/ch.viaccoz.winbiztobanana.import.winbiz.accounts.js → OK
1. Installer l'extension pour l'import des écritures comptables
	* Ajouter de l'url... → Insérer url : https://raw.githubusercontent.com/viaccoz/WinbizToBanana/main/ch.viaccoz.winbiztobanana.import.winbiz.transactions.js → OK

## Créer un nouveau fichier

1. Créer un nouveau fichier
	* Fichier → Nouveau...
1. Choisir le type
	* Catégorie : Fichier vide → Comptabilité en partie double vide → Créer → OK

## Importer le plan comptable

1. Démarrer l'import
	* Actions → Importer en comptabilité...
1. Choisir le type
	* Importer : Comptes
1. Choisir l'extension
	* Winbiz - Importer plan comptable (*.csv)
1. Importer
	* Choisir le fichier → OK → OK → cocher "Ne pas aviser" → OK

## Adapter le plan comptable

1. Corriger les lignes en rouge dans le plan comptable (onglet "Comptes")
1. Mettre le plan comptable en forme selon les besoins

## Importer les écritures comptables

1. Démarrer l'import
	* Actions → Importer en comptabilité...
1. Choisir le type
	* Importer : Écritures
1. Choisir l'extension
	* Winbiz - Importer écritures comptables (*.csv)
1. Importer
	* Choisir le fichier → OK → OK
