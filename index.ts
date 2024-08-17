import {run, getPostAnchors, getPageAnchors, PostAnchor, PageAnchor} from './app/custom-github-spa.js';

var converter = new showdown.Converter();
document.addEventListener('DOMContentLoaded', async () => {
    run("content", (content: string) => {
        return converter.makeHtml(content);
    }, async (pageLink: string) => {
        const postsElement = document.getElementById('posts');
        if (postsElement !== null) {
            console.log(`callback for ${pageLink}: postsElement: ${postsElement}`);
            const postAnchors = await getPostAnchors();
    
            // Display the post anchors
            postAnchors.forEach((postAnchor:PostAnchor) => {
                const liElement = document.createElement('li');
                liElement.innerHTML = `${postAnchor.element.outerHTML} - ${postAnchor.description}`;
                postsElement.appendChild(liElement);
            });
        }
    });

    const pageAnchors = await getPageAnchors();
    
    // Display the page anchors
    const pagesElement = document.getElementById('pages') ?? document.createElement('ul');
    pageAnchors.forEach((pageAnchor: PageAnchor) => {
        const liElement = document.createElement('li');
        liElement.innerHTML = `${pageAnchor.element.outerHTML}`;
        pagesElement.appendChild(liElement);
    }); 
});
