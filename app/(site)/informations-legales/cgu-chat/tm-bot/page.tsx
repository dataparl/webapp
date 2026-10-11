import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CGU — bot Telegram DataParl'",
  alternates: { canonical: "/informations-legales/cgu-chat/tm-bot" },
};

// Conditions d'utilisation et politique de confidentialité du bot Telegram
// @dataparl_bot : diffuseur du DataParl' Daily dans le canal @dataparl_daily
// et hôte de la Mini App DataParl' Chat. Cette page sert de « Privacy
// Policy URL » à déclarer dans BotFather.

export default function CguTmBot() {
  return (
    <>
      <h1>CGU — bot Telegram <span className="surligne">DataParl&apos;</span></h1>
      <p className="lead">
        Conditions d&apos;utilisation et politique de confidentialité du bot Telegram
        @dataparl_bot (« le Bot »), diffuseur du DataParl&apos; Daily dans le canal
        @dataparl_daily et hôte de la Mini App DataParl&apos; Chat. Version 2.0 —
        en vigueur depuis le 11 octobre 2026.
      </p>

      <h2>1. Rôle du Bot</h2>
      <p>
        Le Bot publie chaque matin dans le canal @dataparl_daily le récapitulatif
        des mouvements de collaborateurs parlementaires (arrivées, départs,
        transferts — Assemblée nationale, Sénat, Parlement européen), établi
        à partir des données ouvertes publiées par DataParl&apos; (dataparl.fr).
        Il ne répond pas aux messages individuels.
      </p>

      <h2>2. Mini App DataParl&apos; Chat</h2>
      <p>
        Le Bot héberge une Mini App (application web ouverte depuis Telegram)
        donnant accès au même assistant que le Chat du site. L&apos;accès se fait
        par votre identité Telegram, vérifiée côté serveur au moyen de la
        signature cryptographique fournie par Telegram (« initData ») :
        aucun compte DataParl&apos; n&apos;est requis. Les règles du Chat
        (assistant automatisé, réponses pouvant contenir des erreurs,
        questions transmises à Mistral AI — UE — pour générer les réponses,
        journalisation des questions à des fins statistiques sans
        identification) sont celles des CGU DataParl&apos; Chat, acceptées à
        chaque ouverture de la Mini App.
      </p>

      <h2>3. Données personnelles collectées</h2>
      <p>
        Le Bot ne collecte aucune donnée personnelle : ni profil, ni cookie.
        La signature Telegram (« initData ») sert uniquement à vérifier
        l&apos;accès à la Mini App ; elle est vérifiée puis oubliée, jamais
        conservée ni associée aux questions posées. Les échanges du Chat
        restent en mémoire de la page, vidée à la fermeture : aucun stockage
        côté serveur des conversations.
      </p>

      <h2>4. Données traitées par Telegram</h2>
      <p>
        L&apos;utilisation de Telegram, du canal et de la Mini App relève des
        conditions et de la politique de confidentialité de Telegram Messenger
        LLP. Lorsque vous consultez le canal ou ouvrez la Mini App, c&apos;est
        Telegram qui traite les données techniques associées (identifiant de
        compte, appareil, adresse IP) selon ses propres règles, auxquelles
        DataParl&apos; est étranger.
      </p>

      <h2>5. Mesure d&apos;audience des liens</h2>
      <p>
        Les messages du Daily contiennent des liens courts (dataparl.fr/l/…)
        vers les éditions du jour. Comme pour les autres liens du site, les clics
        sont comptés de manière agrégée (édition consultée, provenance
        générique) sans identification des personnes ni profilage.
      </p>

      <h2>6. Contenus diffusés</h2>
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

      <h2>7. Évolution et suspension</h2>
      <p>
        L&apos;éditeur peut faire évoluer le Bot, le format des messages, la Mini
        App ou les présentes conditions, et suspendre ou supprimer le service
        à tout moment. Le canal peut être quitté librement à tout moment.
      </p>

      <h2>8. Droit applicable, litiges et contact</h2>
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
