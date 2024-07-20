var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const POST_PATH_PART = "posts";
const PAGES_PATH_PART = "pages";
const getPathParts = (url) => {
    return url.split('/').filter(part => part !== '');
};
const getRootPath = () => {
    const pathParts = getPathParts(window.location.pathname);
    console.log(`pathParts: ${pathParts}`);
    for (var i = 0; i < pathParts.length; i++) {
        if (pathParts[i] === POST_PATH_PART || pathParts[i] === PAGES_PATH_PART) {
            console.log(`i: ${i}`);
            break;
        }
    }
    const l = window.location;
    const root = `${l.protocol}//${l.hostname}${(l.port ? ':' + l.port : '')}` + "/" + pathParts.slice(0, i).join('/');
    console.log(`Root path: ${root}`);
    return root.endsWith('/') ? root.slice(0, -1) : root;
};
const ROOT_PATH = getRootPath();
const setWindowTitle = (title) => {
    document.title = title;
};
const handlePopState = (element, postDecorator, pageLinkCallback) => {
    return (event) => {
        const state = event.state;
        if (state !== null) {
            console.log(`PopState: url: ${state.url}`);
            loadView(state.url, element, postDecorator, pageLinkCallback);
        }
        else {
            console.log('PopState: state is null');
        }
    };
};
const handleLinkClick = (element, postDecorator, pageLinkCallback) => {
    return (event) => {
        if (event.target.classList.contains('xhr-link')) {
            event.preventDefault();
            const url = event.target.href;
            console.log(`Navigated to ${url}`);
            history.pushState({ url: url }, "", url);
            if (event.target.classList.contains('post-link')) {
                loadView(url, element, postDecorator, undefined);
            }
            else if (event.target.classList.contains('page-link')) {
                loadView(url, element, undefined, pageLinkCallback);
            }
        }
    };
};
const loadedPosts = new Map();
const getPosts = () => loadedPosts.size > 0 ? Promise.resolve(loadedPosts) :
    fetch(`${ROOT_PATH}/_posts/posts.json`)
        .then(response => response.text())
        .then(content => {
        loadedPosts.clear();
        const posts = JSON.parse(content);
        for (const post of posts) {
            loadedPosts.set(post.file, post);
        }
        return loadedPosts;
    })
        .catch(err => {
        console.log('Error loading post posts:', err);
        return loadedPosts;
    });
const getPost = (file) => getPosts()
    .then(posts => {
    var _a;
    if (posts.has(file)) {
        return (_a = posts.get(file)) !== null && _a !== void 0 ? _a : { file: '', title: '', description: '' };
    }
    else {
        throw new Error(`Post not found for ${file}`);
    }
});
const getPostAnchors = () => __awaiter(void 0, void 0, void 0, function* () {
    const postAnchors = Array();
    yield getPosts()
        .then(posts => {
        posts.forEach((post, i) => {
            const anchorElement = document.createElement('a');
            anchorElement.href = `/${POST_PATH_PART}/${post.file}`;
            anchorElement.textContent = post.title;
            anchorElement.id = `${post.file}-${i}`;
            anchorElement.classList.add('xhr-link', 'post-link');
            postAnchors.push({ element: anchorElement, description: post.description });
        });
    }).catch(err => {
        console.log('Error fetching data:', err);
    });
    return postAnchors;
});
const loadedPages = new Map();
const getPages = () => loadedPages.size > 0 ? Promise.resolve(loadedPages) :
    fetch(`${ROOT_PATH}/_pages/pages.json`)
        .then(response => response.text())
        .then(content => {
        loadedPages.clear();
        const pages = JSON.parse(content);
        for (const page of pages) {
            loadedPages.set(page.file, page);
        }
        return loadedPages;
    })
        .catch(err => {
        console.log('Error loading pages:', err);
        return loadedPages;
    });
const getPage = (file) => getPages()
    .then(pages => {
    var _a;
    if (pages.has(file)) {
        return (_a = pages.get(file)) !== null && _a !== void 0 ? _a : { file: '', title: '', description: '' };
    }
    else {
        throw new Error(`Page not found for ${file}`);
    }
});
const getPageAnchors = () => __awaiter(void 0, void 0, void 0, function* () {
    const pageAnchors = Array();
    yield getPages()
        .then(pages => {
        pages.forEach((page, i) => {
            const anchorElement = document.createElement('a');
            anchorElement.href = `/${PAGES_PATH_PART}/${page.file}`;
            anchorElement.textContent = page.title;
            anchorElement.id = `${page.file}-${i}`;
            anchorElement.classList.add('xhr-link', 'page-link');
            pageAnchors.push({ element: anchorElement, description: page.description });
        });
    }).catch(err => {
        console.log('Error fetching data:', err);
    });
    return pageAnchors;
});
const fetchView = (url, slug, title) => {
    console.log(`fetchView: url: ${url}, slug: ${slug}, title: ${title}`);
    return fetch(`${url}`, { mode: 'no-cors' })
        .then(response => response.text())
        .then(content => content)
        .catch(err => {
        console.log(`Error fetching ${url}: ${err}`);
        return '';
    });
};
const loadView = (url, element, postDecorator, pageLinkCallback) => {
    if (url != undefined) {
        const pathParts = getPathParts(url);
        console.log(`loadView: pathParts: ${pathParts}`);
        if (pathParts.includes(POST_PATH_PART)) {
            getPost(pathParts[pathParts.length - 1]).then(post => {
                setWindowTitle(post.title);
                fetchView(`${ROOT_PATH}/_posts/${post.file}`, `posts/${post.file}`, post.title)
                    .then(content => {
                    element.innerHTML = postDecorator !== undefined ? postDecorator(content) : content;
                }).catch(err => {
                    console.log('Error fetching data:', err);
                });
            })
                .catch(err => {
                console.log('Error fetching data:', err);
            });
        }
        else if (pathParts.includes(PAGES_PATH_PART)) {
            getPage(pathParts[pathParts.length - 1]).then(page => {
                setWindowTitle(page.title);
                fetchView(`${ROOT_PATH}/_pages/${page.file}`, `pages/${page.file}`, page.title)
                    .then(content => {
                    element.innerHTML = content;
                    pageLinkCallback !== undefined && pageLinkCallback(url);
                }).catch(err => {
                    console.log('Error fetching data:', err);
                });
            })
                .catch(err => {
                console.log('Error fetching data:', err);
            });
        }
        else {
            element.innerHTML = '';
        }
    }
};
const run = (contentId, postDecorator, pageLinkCallback) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const CONTENT_ELEMENT = (_a = document.getElementById(contentId)) !== null && _a !== void 0 ? _a : document.createElement('div');
    loadView(window.location.href, CONTENT_ELEMENT, postDecorator, pageLinkCallback);
    const url = window.location.href;
    history.pushState({ url: url }, "", url);
    window.addEventListener('popstate', handlePopState(CONTENT_ELEMENT, postDecorator, pageLinkCallback));
    document.addEventListener('click', handleLinkClick(CONTENT_ELEMENT, postDecorator, pageLinkCallback));
});
export { run, getPostAnchors, getPageAnchors };
