# DataParl' Drive — Casual Office (drive.dataparl.fr)

Objectif : remplacer le tableur maison par un vrai tableur open source,
auto-hébergé, comme [Casual Office](https://casualoffice.org/) — une suite
bureau libre (Apache-2.0/MIT, moteur Univer OSS) qui s'édite et se sauvegarde
en `.xlsx` natif, avec co-édition en temps réel.

⚠️ **Contrainte d'hébergement** : Casual Office est une application Docker
(auto-hébergée, un conteneur = un port). Elle ne peut pas tourner sur Vercel :
il faut un petit serveur (VPS 1 vCPU / 1 Go suffit pour un usage équipe).

## Mise en route (sur le VPS)

```bash
# 1. Docker + compose
curl -fsSL https://get.docker.com | sh

# 2. Lancer Casual Sheets
mkdir -p /opt/dataparl-drive && cd /opt/dataparl-drive
# copier le docker-compose.yml de ce dossier ici, puis :
docker compose up -d
# Casual Sheets écoute sur http://localhost:3000
```

## Mettre drive.dataparl.fr devant (Caddy, HTTPS automatique)

```caddyfile
drive.dataparl.fr {
    reverse_proxy 127.0.0.1:3000
}
```

```bash
# apt install caddy ; coller le bloc ci-dessus dans /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

DNS : enregistrement `A drive <IP du VPS>` (ou CNAME vers l'hôte du VPS),
**pas** vers Vercel — le drive n'est pas du Next.js.

## Alimenter les feuilles avec les données DataParl'

Casual Office ouvre et sauvegarde du `.xlsx` natif ; les données DataParl'
arrivent par les exports des feuilles (bouton « Télécharger (CSV) » sur
chaque page https://www.dataparl.fr/sheets/…, ouverts directement dans
Casual Sheets). Pour un rafraîchissement automatique, un cron sur le VPS :

```bash
# Rapatrie la feuille « renouvellement annuel » toutes les heures
curl -s https://www.dataparl.fr/sheets/vigiparl-annual-chart \
  > /opt/dataparl-drive/data/vigiparl-annual-chart.csv
```

Le tableur maison `/sheets` du site reste disponible en lecture publique
légère ; le drive Casual Office devient l'espace de travail interactif.

## Licences

- Casual Office : Apache-2.0 + MIT (sources : github.com/CasualOffice)
- Données DataParl' : ODbL — mention « DataParl' » requise en cas de republication.
