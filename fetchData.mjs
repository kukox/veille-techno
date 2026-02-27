import fs from "fs";
import fetch from "node-fetch";

// Catégories et mots-clés
const categories = {
  IA: ["AI", "machine learning", "deep learning", "LLM", "chatbot", "NLP"],
  DevTools: ["developer tools", "framework", "API", "CLI", "IDE", "debugging"],
  Productivite: ["productivity", "task management", "automation", "workflow", "calendar"],
  DesignUX: ["design", "UI", "UX", "prototyping", "wireframe", "figma"],
  DataCloud: ["data", "cloud", "database", "analytics", "storage", "serverless"],
  DevOps: ["DevOps", "CI/CD", "docker", "kubernetes", "terraform", "ansible", "monitoring", "observability"]
};

// Fonction pour filtrer par mots-clés
function filterByCategory(item, categories) {
  const text = (item.name + " " + (item.description || "")).toLowerCase();
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(k => text.includes(k.toLowerCase()))) {
      return cat;
    }
  }
  return null;
}

// Récupération GitHub
async function getGitHubTrending() {
  const response = await fetch("https://api.github.com/search/repositories?q=stars:>500&sort=stars&order=desc&per_page=20");
  const data = await response.json();
  return data.items.map(repo => ({
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    source: "GitHub"
  }));
}

// Récupération Product Hunt
async function getProductHunt(token) {
  const query = `
    {
      posts(order: RANK, first: 20) {
        edges {
          node {
            name
            tagline
            votesCount
            url
          }
        }
      }
    }
  `;
  const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
  const data = await response.json();
  return data.data.posts.edges.map(p => ({
    name: p.node.name,
    description: p.node.tagline,
    url: p.node.url,
    votes: p.node.votesCount,
    source: "Product Hunt"
  }));
}

// Script principal
async function main() {
  const token = process.env.PRODUCTHUNT_TOKEN; // ⚠️ stocke ton token en variable d'environnement
  const githubRepos = await getGitHubTrending();
  const productHuntPosts = await getProductHunt(token);

  const allItems = [...githubRepos, ...productHuntPosts];
  console.log(JSON.stringify(data, null, 2));
  // Filtrage par catégories
  const filtered = allItems.map(item => {
    const category = filterByCategory(item, categories);
    return category ? { ...item, category } : null;
  }).filter(Boolean);

  // Sauvegarde dans data.json
  fs.writeFileSync("data.json", JSON.stringify(filtered, null, 2));
  console.log("✅ Données filtrées enregistrées dans data.json");
}

main();

