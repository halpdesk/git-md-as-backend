var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { run, getPostListWithCategories, getPageAnchors } from './app/custom-github-spa.js';
var converter = new showdown.Converter();
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    run("content", (content) => {
        return converter.makeHtml(content);
    }, (url) => __awaiter(void 0, void 0, void 0, function* () {
        var postsElement = document.getElementById('posts');
        if (postsElement !== null) {
            getPostListWithCategories().then((postList) => {
                postsElement === null || postsElement === void 0 ? void 0 : postsElement.appendChild(postList);
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
