// import {run, getPostAnchors, PostAnchor } from './app/custom-github-spa.js';
import {run, getPostListWithCategories, getPageAnchors, PageAnchor} from './app/custom-github-spa.js';

var converter = new showdown.Converter();
document.addEventListener('DOMContentLoaded', async () => {
    run(
        "content", 
    // Post decorator
    (content: string) => {
        return converter.makeHtml(content);
    }, 
    // Page link callback
    async (url: string) => {
        var postsElement = document.getElementById('posts');
        if (postsElement !== null) {
            getPostListWithCategories().then((postList) => {
                postsElement?.appendChild(postList);
            });
                
                
            // const postAnchors = await getPostAnchors();
    
            // // Display the post anchors
            // postAnchors.forEach((postAnchor:PostAnchor) => {
            //     const liElement = document.createElement('li');
            //     liElement.innerHTML = `${postAnchor.element.outerHTML} - ${postAnchor.description}`;
            //     postsElement.appendChild(liElement);
            // });
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
