// KSD Digital - Headless CMS Engine
const PROJECT_ID = "3ihcc6m0";
const DATASET = "production";

// 1. Check the URL to see which article the user clicked
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get("slug");

if (!slug) {
  document.getElementById("dynamic-content").innerHTML =
    "<p>Article not found. Please return to the homepage.</p>";
} else {
  // 2. Ask Sanity for that specific article
  const query = `*[_type == "article" && slug.current == "${slug}"][0]`;
  const url = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${encodeURIComponent(query)}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const article = data.result;

      if (!article) {
        document.getElementById("dynamic-content").innerHTML =
          "<p>Article not found.</p>";
        return;
      }

      // 3. Inject the Title, Category, and Excerpt into the Header
      document.getElementById("dynamic-title").innerText = article.title;
      document.getElementById("dynamic-category").innerText =
        article.category || "Insight";
      document.getElementById("dynamic-excerpt").innerText =
        article.excerpt || "";

      // 4. Convert the Sanity Rich Text into your Premium HTML
      let htmlContent = "";

      if (article.content) {
        article.content.forEach((block) => {
          if (block._type === "block") {
            // Handle bold and italic text
            let text = block.children
              .map((child) => {
                if (child.marks && child.marks.includes("strong"))
                  return `<strong>${child.text}</strong>`;
                if (child.marks && child.marks.includes("em"))
                  return `<em>${child.text}</em>`;
                return child.text;
              })
              .join("");

            // Apply your custom CSS styling to headers and quotes
            if (block.style === "h3") {
              htmlContent += `<h3 style="margin-top: 50px; margin-bottom: 20px; color: #fff;">${text}</h3>`;
            } else if (block.style === "blockquote") {
              htmlContent += `<blockquote style="border-left: 4px solid var(--primary); padding-left: 20px; margin: 40px 0; font-size: 1.3rem; font-style: italic; color: #fff; background: transparent;">${text}</blockquote>`;
            } else {
              htmlContent += `<p style="margin-bottom: 15px;">${text}</p>`;
            }
          }
        });
      }

      // 5. Drop the finished text into the page!
      document.getElementById("dynamic-content").innerHTML = htmlContent;
    })
    .catch((error) => {
      console.error("Error fetching article:", error);
      document.getElementById("dynamic-content").innerHTML =
        "<p>Error loading content.</p>";
    });
}
