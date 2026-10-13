import { test, expect } from "@playwright/test";

// Checkly — parcours critique DataParl' (browser check Playwright).
// À coller tel quel dans un browser check Checkly (fréquence conseillée :
// toutes les heures ; 1 000 runs/mois en plan Hobby ≈ 33/jour).
// Sélecteurs volontairement permissifs : à ajuster si le DOM change.

const BASE = "https://www.dataparl.fr";

test("parcours accueil → recherche → fiche parlementaire", async ({ page }) => {
  // 1. La page d'accueil répond et affiche le titre du site.
  const reponse = await page.goto(BASE);
  expect(reponse?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/DataParl/);

  // 2. La page de recherche fonctionne (requête URL, pas de dépendance au DOM).
  await page.goto(`${BASE}/search?q=macron`);
  await expect(page).toHaveTitle(/DataParl/);
  // La recherche doit renvoyer au moins un résultat : un lien vers une fiche.
  const lienFiche = page.locator('a[href*="/parlementaires/"]').first();
  await expect(lienFiche).toBeVisible({ timeout: 15_000 });

  // 3. Une fiche parlementaire s'ouvre depuis la recherche.
  await lienFiche.click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toBeVisible();

  // 4. Le sitemap robotable est servi (indirectement : le site est vivant de bout en bout).
  const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
});
