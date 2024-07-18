const POST_PATH_PART: string = "posts";

const getPathParts = (url:string) : Array<string> => {
    const link = document.createElement('a');
    link.href = url;
    return link.pathname.split('/').filter(part => part !== '');
}

const getRootPath = () : string => {
    const pathParts = getPathParts(window.location.pathname);
    for (var i = 0; i < pathParts.length; i++) {
        if (pathParts[i] === POST_PATH_PART) {
            break;
        }
    }
    const l = window.location;
    
    const root = `${l.protocol}//${l.hostname}${(l.port ? ':' + l.port : '')}` + "/" + pathParts.slice(0, i).join('/');
    return root.endsWith('/') ? root.slice(0, -1) : root;
}

const ROOT_PATH: string = getRootPath();

const setWindowTitle = (title: string) : void => {
    document.title = title;
}

const handlePopState = (element: HTMLElement, entryDecorator: Function | undefined) => {
    return (event: PopStateEvent) => {
        const state = event.state;
        if (state) {
            if (state.path && state.title) {   
                loadFile(state.path, element, entryDecorator);
            } else {
                loadHome(element);
            }
        }
    }
}

const handleLinkClickOnEntry = (entry: Entry, element: HTMLElement, entryDecorator: Function | undefined) => {
    return (event: Event) => {
        event.preventDefault();
        console.log(`Navigated to: ${entry.file} (history: ${ROOT_PATH}/${POST_PATH_PART}/${entry.file} title: ${entry.title})`);
        history.pushState({ path: entry.file, title: entry.title }, "", `${ROOT_PATH}/${POST_PATH_PART}/${entry.file}`);
        loadEntry(entry.file, element, entryDecorator);
    }
}

const loadUrl = (url: string) : Promise<string> =>
    fetch(`${url}`, { mode: 'no-cors'})
        .then(response => response.text())
        .then(content => content)
        .catch(err => {
            console.log(`Error fetching ${url}: ${err}`)
            return ''
        })

interface Entry {
    file: string;
    title: string;
    description: string;
}

/*
 *  Entries are loaded from a JSON file that contains an array of Entry objects.
 */
const loadedEntries: Map<string, Entry> = new Map<string, Entry>();

const getEntries = () : Promise<Map<string, Entry>> =>
    loadedEntries.size > 0 ? Promise.resolve(loadedEntries) :
    fetch(`${ROOT_PATH}/entries/entries.json`)
        .then(response => response.text())
        .then(content => {
            loadedEntries.clear()
            const entries = JSON.parse(content)
            for (const entry of entries) {
                loadedEntries.set(entry.file, entry)
            }
            return loadedEntries
        })
        .catch(err => {
            console.log('Error loading post entries:', err)
            return loadedEntries
        })
        
const getEntry = (file: string) : Promise<Entry> =>
    getEntries()
        .then(entries => {
            if (entries.has(file)) {
                return entries.get(file) ?? { file: '', title: '', description: '' } as Entry
            } else {
                throw new Error(`Entry not found for ${file}`)
            }
        })
        
const buildEntriesMenu = (entriesElement: HTMLElement, contentElement: HTMLElement, entryDecorator: Function | undefined) =>
    getEntries()
        .then(entries => {
            entries.forEach(entry => {
                const liElement = document.createElement('li');
                const anchorElement = document.createElement('a');
                anchorElement.href = `/${POST_PATH_PART}/${entry.file}`;
                anchorElement.textContent = entry.title;
                liElement.innerHTML = `${anchorElement.outerHTML} - ${entry.description}`;
                entriesElement.appendChild(liElement);
                entriesElement.lastChild?.firstChild?.addEventListener('click', handleLinkClickOnEntry(entry, contentElement, entryDecorator));
            });
        }).catch(err => {
            console.log('Error fetching data:', err)
        })

const loadEntry = (file: string, element: HTMLElement, entryDecorator: Function | undefined) => {
    getEntry(file)
        .then(entry => {
            setWindowTitle(entry.title);
            loadUrl(`${ROOT_PATH}/entries/${entry.file}`)
                .then(content => {
                    element.textContent = entryDecorator !== undefined ? entryDecorator(content) : content;
                }).catch(err => {
                    console.log('Error fetching data:', err)
                })
        })
        .catch(err => {
            console.log('Error fetching data:', err)
        })
}

const loadHome = (element: HTMLElement) => {
    const title = "Home";
    const file = "home.html"
    setWindowTitle(title);
    loadUrl(`${ROOT_PATH}/${file}`)
        .then(content => {
            element.textContent = content;
        }).catch(err => {
            console.log('Error fetching data:', err)
        })
}

const loadFile = (file: string, element: HTMLElement, entryDecorator: Function | undefined) => {
    const pathParts = getPathParts(window.location.pathname)
    if (pathParts.includes(POST_PATH_PART)) {
        loadEntry(file, element, entryDecorator);
    } else {
        loadHome(element);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const CONTENT_ELEMENT = document.getElementById('content') ?? document.createElement('div');
    const ENTRIES_ELEMENT = document.getElementById('entries') ?? document.createElement('div');
    const pathParts = getPathParts(window.location.pathname)
    
    const entryDecorator = (content: string) : string => {
        return content.replace(/#/, `B`);
    }
    const file = pathParts[pathParts.length - 1];
    loadFile(file, CONTENT_ELEMENT, entryDecorator);
    
    await buildEntriesMenu(ENTRIES_ELEMENT, CONTENT_ELEMENT, entryDecorator);
    
    window.addEventListener('popstate', handlePopState(CONTENT_ELEMENT, entryDecorator));
})

// https://medium.com/swlh/using-react-router-on-github-pages-2702afdd5d0c
