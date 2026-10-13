// @ts-nocheck — browser check Checkly (à déployer via « npx checkly deploy »).
// @playwright/test est fourni par Checkly, pas par la webapp : ce fichier
// n'est ni compilé ni exécuté par le build Next.js.
import { test, expect } from "@playwright/test";

test.setTimeout(210000);
test.use({ actionTimeout: 10000 });

const BASE = process.env.ENVIRONMENT_URL || "https://www.dataparl.fr";

// Parcours critique DataParl' : accueil → page Parlementaires → un groupe
// politique → sitemap. Pages 100 % publiques (sans compte ni JS lourd) :
// /search est la recherche du tableur, la recherche d'élus passe par
// l'autocomplétion JS, difficile à tester de façon stable.
test("parcours accueil → parlementaires → groupe", async ({ page }) => {
  // 1. La page d'accueil répond et affiche le titre du site.
  const reponse = await page.goto(BASE);
  expect(reponse?.status()).toBeLessThan(400);
  await expect(page).toHaveTitle(/DataParl/);

  // 2. La page publique des parlementaires s'affiche.
  await page.goto(`${BASE}/parlementaires`);
  await expect(page.locator("h1")).toBeVisible();

  // 3. Le sommaire « Explorer sans compte » propose les groupes.
  const lienGroupe = page.locator('a[href="/groupe"]').first();
  await expect(lienGroupe).toBeVisible({ timeout: 15000 });
  await lienGroupe.click();
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toBeVisible();

  // 4. Le sitemap est servi : le site est vivant de bout en bout.
  const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
});
