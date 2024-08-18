// https://medium.com/swlh/using-react-router-on-github-pages-2702afdd5d0c
const POST_PATH_PART: string = "posts";
const PAGES_PATH_PART: string = "pages";

const getPathParts = (url:string) : Array<string> => {
    return url.split('/').filter(part => part !== '');
}

const getRootPath = () : string => {
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
}

const ROOT_PATH: string = getRootPath();

const setWindowTitle = (title: string) : void => {
    document.title = title;
}

const handlePopState = (element: HTMLElement, postDecorator: Function | undefined, pageLinkCallback: Function | undefined) => {
    return (event: PopStateEvent) => {
        const state = event.state;
        if (state !== null) {
            console.log(`PopState: url: ${state.url}`);
            loadView(state.url, element, postDecorator, pageLinkCallback);
        } else {
            console.log('PopState: state is null');
        }
    }
}

const handleLinkClick = (element: HTMLElement, postDecorator: Function | undefined, pageLinkCallback: Function | undefined) => {
    return (event: Event) => {
        if ((event.target as Element).classList.contains('xhr-link')) {
            event.preventDefault();
            const url = (event.target as HTMLAnchorElement).href;
            console.log(`Navigated to ${url}`);
            history.pushState({ url: url }, "", url);
            if ((event.target as Element).classList.contains('post-link')) {
                loadView(url, element, postDecorator, undefined);
            } else if ((event.target as Element).classList.contains('page-link')) {
                loadView(url, element, undefined, pageLinkCallback);
            }
        }
    }
}


/*
 *  Posts are loaded from a JSON file that contains an array of Post objects.
 */
interface Category {
    category: string;
    posts: Array<Post>;
}
interface Post {
    file: string;
    title: string;
    description: string;
}
const loadedPosts: Array<Category> = new Array<Category>();

const getPosts = () : Promise<Array<Category>> =>
    loadedPosts.length > 0 ? Promise.resolve(loadedPosts) :
    fetch(`${ROOT_PATH}/_posts/posts.json`)
        .then(response => response.text())
        .then(content => {
            const catgories = JSON.parse(content)
            for (const catgory of catgories) {
                loadedPosts.push(catgory)
            }
            return loadedPosts
        })
        .catch(err => {
            console.log('Error loading post posts:', err)
            return loadedPosts
        })
        
const getPost = (file: string) : Promise<Post> =>
    getPosts()
        .then(categories => {
            for (const category of categories) {
                for (const post of category.posts) {
                    if (post.file == file) {
                        return post ?? { file: '', title: '', description: '' } as Post
                    }
                }
            }
            throw new Error(`Post not found for ${file}`)
        })


interface PostAnchor {
    element: HTMLElement;
    description: string;
}
const getPostAnchors = async (): Promise<Array<PostAnchor>> => {
    const postAnchors = Array<PostAnchor>();
    await getPosts()
        .then(data => {
            data.forEach((category, i) => {
                category.posts.forEach((post, i) => {
                    const anchorElement = document.createElement('a');
                    anchorElement.href = `${ROOT_PATH}/${POST_PATH_PART}/${post.file}`;
                    anchorElement.textContent = post.title;
                    anchorElement.id = `${post.file}-${i}`;
                    anchorElement.classList.add('xhr-link', 'post-link');
                    postAnchors.push({ element: anchorElement, description: post.description });
                });
            });
        }).catch(err => {
            console.log('Error fetching data:', err)
        })
    return postAnchors;
}

const getPostListWithCategories = async (): Promise<HTMLUListElement> => {
    const outerListElement = document.createElement('ul');
    outerListElement.classList.add('post-list');
    await getPosts()
        .then(data => {
            data.forEach((category, i) => {
                const categoryElement = document.createElement('li');
                categoryElement.textContent = category.category;
                categoryElement.classList.add('category');
                const innerListElement = document.createElement('ul');
                categoryElement.appendChild(innerListElement);
                category.posts.forEach((post, j) => {
                    const anchorElement = document.createElement('a');
                    anchorElement.href = `${ROOT_PATH}/${POST_PATH_PART}/${post.file}`;
                    anchorElement.textContent = post.title;
                    anchorElement.id = `${post.file}-${i}-${j}`;
                    anchorElement.classList.add('xhr-link', 'post-link');
                    const postElement = document.createElement('li');
                    postElement.appendChild(anchorElement);
                    innerListElement.appendChild(postElement);
                });
                outerListElement.appendChild(categoryElement);
            });
        }).catch(err => {
            console.log('Error fetching data:', err)
        })
    return outerListElement;
}
        

/*
 *  Pages are loaded from a JSON file that contains an array of Post objects.
 */
interface Page {
    file: string;
    title: string;
    description: string;
}
const loadedPages: Map<string, Page> = new Map<string, Page>();

const getPages = () : Promise<Map<string, Page>> => {
    loadedPages.clear();
    loadedPages.set("start.html", { file: "start.html", title: "Start", description: "Start page" });
    return loadedPages.size > 1 ? Promise.resolve(loadedPages) :
    fetch(`${ROOT_PATH}/_pages/pages.json`)
        .then(response => response.text())
        .then(content => {
            const pages = JSON.parse(content)
            for (const page of pages) {
                loadedPages.set(page.file, page)
            }
            return loadedPages
        })
        .catch(err => {
            console.log('Error loading pages:', err)
            return loadedPages
        })
}
        
const getPage = (file: string) : Promise<Page> =>
    getPages()
        .then(pages => {
            if (pages.has(file)) {
                return pages.get(file) ?? { file: '', title: '', description: '' } as Page
            } else {
                throw new Error(`Page not found for ${file}`)
            }
        })
        

interface PageAnchor {
    element: HTMLElement;
    description: string;
}
const getPageAnchors = async (): Promise<Array<PageAnchor>> => {
    const pageAnchors = Array<PageAnchor>();
    await getPages()
        .then(pages => {
            pages.forEach((page, i) => {
                const anchorElement = document.createElement('a');
                anchorElement.href = `${ROOT_PATH}/${PAGES_PATH_PART}/${page.file}`;
                anchorElement.textContent = page.title;
                anchorElement.id = `${page.title}`;
                anchorElement.classList.add('xhr-link', 'page-link');
                pageAnchors.push({ element: anchorElement, description: page.description });
            });
        }).catch(err => {
            console.log('Error fetching data:', err)
        })
    return pageAnchors;
}

/*
 *  Fetches the content of a view from the server.
 */
const fetchView = (url: string, slug: string, title: string) : Promise<string> => {
    console.log(`fetchView: url: ${url}, slug: ${slug}, title: ${title}`)
    return fetch(`${url}`, { mode: 'no-cors'})
        .then(response => response.text())
        .then(content => content)
        .catch(err => {
            console.log(`Error fetching ${url}: ${err}`)
            return ''
        })
}

/*
 *  Loads the fetched view into the content element.
 */
const loadView = (url: string, element: HTMLElement, postDecorator: Function | undefined, pageLinkCallback: Function | undefined) => {
    if (url != undefined) {
        const pathParts = getPathParts(url)
        console.log(`loadView: pathParts: ${pathParts}`)
        if (pathParts.includes(POST_PATH_PART)) {
            getPost(pathParts[pathParts.length-1]).then(post => {
                setWindowTitle(post.title);
                fetchView(`${ROOT_PATH}/_posts/${post.file}`, `posts/${post.file}`, post.title)
                    .then(content => {
                        element.innerHTML = postDecorator !== undefined ? postDecorator(content) : content;
                    }).catch(err => {
                        console.log('Error fetching data:', err)
                    })
            })
            .catch(err => {
                console.log('Error fetching data:', err)
            })
        }
        else if (pathParts.includes(PAGES_PATH_PART)) {
            getPage(pathParts[pathParts.length-1]).then(page => {
                setWindowTitle(page.title);
                fetchView(`${ROOT_PATH}/_pages/${page.file}`, `pages/${page.file}`, page.title)
                    .then(content => {
                        element.innerHTML = content;
                        pageLinkCallback !== undefined && pageLinkCallback(url);
                    }).catch(err => {
                        console.log('Error fetching data:', err)
                    })
            })
            .catch(err => {
                console.log('Error fetching data:', err)
            })
        }
        else {
            element.innerHTML = '';
        }
    }
}

const run = async (contentId: string, postDecorator: Function | undefined, pageLinkCallback: Function | undefined) => {
    const CONTENT_ELEMENT = document.getElementById(contentId) ?? document.createElement('div');
    
    if (window.location.href == `${ROOT_PATH}/`) {
        loadView(window.location.href + "/pages/start.html", CONTENT_ELEMENT, postDecorator, pageLinkCallback);
        const url = `${ROOT_PATH}/pages/start.html`;
        history.pushState({ url: url }, "", url);
    } else {
        loadView(window.location.href, CONTENT_ELEMENT, postDecorator, pageLinkCallback);
        const url = window.location.href;
        history.pushState({ url: url }, "", url);
        
    }
    
    window.addEventListener('popstate', handlePopState(CONTENT_ELEMENT, postDecorator, pageLinkCallback));
    document.addEventListener('click', handleLinkClick(CONTENT_ELEMENT, postDecorator, pageLinkCallback));
}
export { run, getPostAnchors, getPageAnchors, getPostListWithCategories, PostAnchor, PageAnchor };
