// Fonction pour récupérer les projets GitHub populaires
async function getGitHubTrending(limit = 5) {
  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=stars:>500&sort=stars&order=desc&per_page=${limit}`
    );
    if (!response.ok) throw new Error("Erreur GitHub API");
    const data = await response.json();
    return data.items.map(repo => ({
      nom: repo.name,
      description: repo.description,
      source: "GitHub",
      url: repo.html_url
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function afficherOutils() {
  try {
    const response = await fetch("data.json"); // lit le fichier généré par Node.js
    const outils = await response.json();

    const container = document.getElementById("contenu");
    container.innerHTML = ""; // vider avant d'ajouter

    outils.forEach(o => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h2><a href="${o.url}" target="_blank">${o.name}</a></h2>
        <p>${o.description || "Pas de description disponible"}</p>
        <small>Source: ${o.source} | Catégorie: ${o.category}${o.votes ? " | Votes: " + o.votes : ""}</small>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erreur lors du chargement des données:", error);
  }
}

afficherOutils();

// Fonction pour récupérer les produits Product Hunt
async function getProductHunt(token, order = "VOTES", limit = 5, after = null) {
  const query = `
    {
      posts(order: ${order}, first: ${limit}${after ? `, after: "${after}"` : ""}) {
        edges {
          node {
            name
            tagline
            votesCount
            url
          }
          cursor
        }
      }
    }
  `;
  try {
    const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });
    if (!response.ok) throw new Error("Erreur Product Hunt API");
    const data = await response.json();
    return data.data.posts.edges.map(p => ({
      nom: p.node.name,
      description: p.node.tagline,
      votes: p.node.votesCount,
      source: "Product Hunt",
      url: p.node.url,
      cursor: p.cursor
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Fonction principale
async function afficherOutils() {
  const githubRepos = await getGitHubTrending(5);
  
const productHuntPosts = await getProductHunt(process.env.PRODUCTHUNT_TOKEN, "NEWEST", 5);

  const outils = [...productHuntPosts, ...githubRepos];
  const container = document.getElementById("contenu");

  outils.forEach(o => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h2><a href="${o.url}" target="_blank">${o.nom}</a></h2>
                      <p>${o.description || "Pas de description disponible"}</p>
                      <small>Source: ${o.source}${o.votes ? " | Votes: " + o.votes : ""}</small>`;
    container.appendChild(card);
  });
}

afficherOutils();

