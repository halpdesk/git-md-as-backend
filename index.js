"use strict";
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
const getPathParts = (url) => {
    const link = document.createElement('a');
    link.href = url;
    return link.pathname.split('/').filter(part => part !== '');
};
const getRootPath = () => {
    const pathParts = getPathParts(window.location.pathname);
    for (var i = 0; i < pathParts.length; i++) {
        if (pathParts[i] === POST_PATH_PART) {
            break;
        }
    }
    const l = window.location;
    const root = `${l.protocol}//${l.hostname}${(l.port ? ':' + l.port : '')}` + "/" + pathParts.slice(0, i).join('/');
    return root.endsWith('/') ? root.slice(0, -1) : root;
};
const ROOT_PATH = getRootPath();
const setWindowTitle = (title) => {
    document.title = title;
};
const handlePopState = (element, entryDecorator) => {
    return (event) => {
        const state = event.state;
        if (state) {
            if (state.path && state.title) {
                loadFile(state.path, element, entryDecorator);
            }
            else {
                loadHome(element);
            }
        }
    };
};
const handleLinkClickOnEntry = (entry, element, entryDecorator) => {
    return (event) => {
        event.preventDefault();
        console.log(`Navigated to: ${entry.file} (history: ${ROOT_PATH}/${POST_PATH_PART}/${entry.file} title: ${entry.title})`);
        history.pushState({ path: entry.file, title: entry.title }, "", `${ROOT_PATH}/${POST_PATH_PART}/${entry.file}`);
        loadEntry(entry.file, element, entryDecorator);
    };
};
const loadUrl = (url) => fetch(`${url}`, { mode: 'no-cors' })
    .then(response => response.text())
    .then(content => content)
    .catch(err => {
    console.log(`Error fetching ${url}: ${err}`);
    return '';
});
/*
 *  Entries are loaded from a JSON file that contains an array of Entry objects.
 */
const loadedEntries = new Map();
const getEntries = () => loadedEntries.size > 0 ? Promise.resolve(loadedEntries) :
    fetch(`${ROOT_PATH}/entries/entries.json`)
        .then(response => response.text())
        .then(content => {
        loadedEntries.clear();
        const entries = JSON.parse(content);
        for (const entry of entries) {
            loadedEntries.set(entry.file, entry);
        }
        return loadedEntries;
    })
        .catch(err => {
        console.log('Error loading post entries:', err);
        return loadedEntries;
    });
const getEntry = (file) => getEntries()
    .then(entries => {
    var _a;
    if (entries.has(file)) {
        return (_a = entries.get(file)) !== null && _a !== void 0 ? _a : { file: '', title: '', description: '' };
    }
    else {
        throw new Error(`Entry not found for ${file}`);
    }
});
const buildEntriesMenu = (entriesElement, contentElement, entryDecorator) => getEntries()
    .then(entries => {
    entries.forEach(entry => {
        var _a, _b;
        const liElement = document.createElement('li');
        const anchorElement = document.createElement('a');
        anchorElement.href = `/${POST_PATH_PART}/${entry.file}`;
        anchorElement.textContent = entry.title;
        liElement.innerHTML = `${anchorElement.outerHTML} - ${entry.description}`;
        entriesElement.appendChild(liElement);
        (_b = (_a = entriesElement.lastChild) === null || _a === void 0 ? void 0 : _a.firstChild) === null || _b === void 0 ? void 0 : _b.addEventListener('click', handleLinkClickOnEntry(entry, contentElement, entryDecorator));
    });
}).catch(err => {
    console.log('Error fetching data:', err);
});
const loadEntry = (file, element, entryDecorator) => {
    getEntry(file)
        .then(entry => {
        setWindowTitle(entry.title);
        loadUrl(`${ROOT_PATH}/entries/${entry.file}`)
            .then(content => {
            element.textContent = entryDecorator !== undefined ? entryDecorator(content) : content;
        }).catch(err => {
            console.log('Error fetching data:', err);
        });
    })
        .catch(err => {
        console.log('Error fetching data:', err);
    });
};
const loadHome = (element) => {
    const title = "Home";
    const file = "home.html";
    setWindowTitle(title);
    loadUrl(`${ROOT_PATH}/${file}`)
        .then(content => {
        element.textContent = content;
    }).catch(err => {
        console.log('Error fetching data:', err);
    });
};
const loadFile = (file, element, entryDecorator) => {
    const pathParts = getPathParts(window.location.pathname);
    if (pathParts.includes(POST_PATH_PART)) {
        loadEntry(file, element, entryDecorator);
    }
    else {
        loadHome(element);
    }
};
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const CONTENT_ELEMENT = (_a = document.getElementById('content')) !== null && _a !== void 0 ? _a : document.createElement('div');
    const ENTRIES_ELEMENT = (_b = document.getElementById('entries')) !== null && _b !== void 0 ? _b : document.createElement('div');
    const pathParts = getPathParts(window.location.pathname);
    const entryDecorator = (content) => {
        return content.replace(/#/, `B`);
    };
    const file = pathParts[pathParts.length - 1];
    loadFile(file, CONTENT_ELEMENT, entryDecorator);
    yield buildEntriesMenu(ENTRIES_ELEMENT, CONTENT_ELEMENT, entryDecorator);
    window.addEventListener('popstate', handlePopState(CONTENT_ELEMENT, entryDecorator));
}));
// https://medium.com/swlh/using-react-router-on-github-pages-2702afdd5d0c
