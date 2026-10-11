import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU — bot Telegram DataParl'",
  alternates: { canonical: "/informations-legales/cgu-chat/tm-bot" },
};

// Conditions d'utilisation et politique de confidentialité du bot Telegram
// @dataparl_bot (diffuseur du DataParl' Daily dans le canal @dataparl_daily).
// Cette page sert de « Privacy Policy URL » à déclarer dans BotFather.

export default function CguTmBot() {
  return (
    <>
      <h1>CGU — bot Telegram <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        Conditions d&apos;utilisation et politique de confidentialité du bot Telegram
        @dataparl_bot (« le Bot »), diffuseur du DataParl&apos; Daily dans le canal
        @dataparl_daily. Version 1.0 — en vigueur depuis le 11 octobre 2026.
      </p>

      <h2>1. Rôle du Bot</h2>
      <p>
        Le Bot publie chaque matin dans le canal @dataparl_daily le récapitulatif
        des mouvements de collaborateurs parlementaires (arrivées, départs,
        transferts — Assemblée nationale, Sénat, Parlement européen), établi
        à partir des données ouvertes publiées par DataParl&apos; (dataparl.fr).
        Le Bot est un diffuseur : il ne répond pas aux messages individuels
        et ne propose pas de service conversationnel.
      </p>

      <h2>2. Données personnelles collectées</h2>
      <p>
        Le Bot ne collecte aucune donnée personnelle. Il ne traite pas les
        messages des utilisateurs, ne constitue aucun profil et ne dépose aucun
        cookie. Les éventuelles données transmises par Telegram (nom
        d&apos;utilisateur, contenu des messages adressés au Bot) ne sont ni
        reçues ni conservées par DataParl&apos;.
      </p>

      <h2>3. Données traitées par Telegram</h2>
      <p>
        L&apos;utilisation de Telegram et du canal @dataparl_daily relève des
        conditions et de la politique de confidentialité de Telegram Messenger
        LLP. Lorsque vous consultez le canal ou interagissez avec le Bot, c&apos;est
        Telegram qui traite les données techniques associées (identifiant de
        compte, appareil, adresse IP) selon ses propres règles, auxquelles
        DataParl&apos; est étranger.
      </p>

      <h2>4. Mesure d&apos;audience des liens</h2>
      <p>
        Les messages du Daily contiennent des liens courts (dataparl.fr/l/…)
        vers les éditions du jour. Comme pour les autres liens du site, les clics
        sont comptés de manière agrégée (édition consultée, provenance
        générique) sans identification des personnes ni profilage.
      </p>

      <h2>5. Contenus diffusés</h2>
      <p>
        Les données diffusées par le Bot sont issues des publications de
        DataParl&apos; sous licence ODbL 1.0 ; leur réutilisation reste soumise à
        cette licence (mention de la licence et attribution « DataParl&apos;
        (dataparl.fr), d&apos;après les publications de l&apos;Assemblée nationale et du
        Sénat »). Les contenus sont fournis « en l&apos;état », sans garantie
        d&apos;exactitude ou d&apos;exhaustivité, dans la mesure permise par la loi
        applicable. Malgré les soins apportés à la collecte et à la
        vérification, des erreurs ou omissions restent possibles.
      </p>

      <h2>6. Évolution et suspension</h2>
      <p>
        L&apos;éditeur peut faire évoluer le Bot, le format des messages ou les
        présentes conditions, et suspendre ou supprimer le service à tout
        moment. Le canal peut être quitté librement à tout moment.
      </p>

      <h2>7. Droit applicable, litiges et contact</h2>
      <p>
        Les présentes conditions sont soumises au droit français. Pour toute
        question relative au Bot, à ses messages ou aux présentes conditions,
        utilisez le formulaire de contact disponible sur dataparl.fr. Pour
        l&apos;exercice de vos droits (accès, rectification, effacement) prévus par
        le RGPD, consultez la politique de confidentialité du site.
      </p>
    </>
  );
}
