var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { run, getPostAnchors, getPageAnchors } from './app/custom-github-spa.js';
var converter = new showdown.Converter();
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    run("content", (content) => {
        return converter.makeHtml(content);
    }, (pageLink) => __awaiter(void 0, void 0, void 0, function* () {
        const postsElement = document.getElementById('posts');
        if (postsElement !== null) {
            console.log(`callback for ${pageLink}: postsElement: ${postsElement}`);
            const postAnchors = yield getPostAnchors();
            postAnchors.forEach((postAnchor) => {
                const liElement = document.createElement('li');
                liElement.innerHTML = `${postAnchor.element.outerHTML} - ${postAnchor.description}`;
                postsElement.appendChild(liElement);
            });
        }
    }));
    const pageAnchors = yield getPageAnchors();
    const pagesElement = (_a = document.getElementById('pages')) !== null && _a !== void 0 ? _a : document.createElement('ul');
    pageAnchors.forEach((pageAnchor) => {
        const liElement = document.createElement('li');
        liElement.innerHTML = `${pageAnchor.element.outerHTML}`;
        pagesElement.appendChild(liElement);
    });
}));
