const setWindowTitle = (title) => {
    document.title = title;
}
    
const getPathParts = (url) => {
    const link = document.createElement('a');
    link.href = url;
    return link.pathname.split('/').filter(part => part !== '');
}

const getRootPath = () => {
    const pathParts = getPathParts(window.location.pathname);
    for (var i = 0; i < pathParts.length; i++) {
        if (pathParts[i] === "posts") {
            break;
        }
    }
    const l = window.location;
    return `${l.protocol}//${l.hostname}${(l.port ? ':' + l.port : '')}` + "/" + pathParts.slice(0, i).join('/');
}

const handlePopState = (event) => {
    const state = event.state;
    if (state) {
        setWindowTitle(state.title);
        loadFile(state.path)
            .then(content => {
                document.getElementById('content').textContent = content;
            }).catch(err => {
                console.log('Error fetching data:', err)
            })
    }
}

const handleLinkClick = (event) => {
    event.preventDefault();
    const url = event.target.href;
    const title = event.target.textContent;
    const pathParts = getPathParts(url);
    const historyUrl = `/posts/${pathParts[1]}`;
    console.log(`Navigated to: ${url} (history: ${historyUrl} title: ${title})`);
    history.pushState({ path: url, title: title }, null, historyUrl);
    setWindowTitle(title);
    loadFile(url)
        .then(content => {
            document.getElementById('content').textContent = content;
        }).catch(err => {
            console.log('Error fetching data:', err)
        })
}

const loadFile = (file) =>
    fetch(`${file}`, { mode: 'no-cors'})
        .then(response => response.text())
        .then(content => content)
        .catch(err => {
            console.log(`Error fetching ${file}: ${err}`)
        })

const loadEntries = () =>
    fetch(`entries/entries.json`)
        .then(response => response.text())
        .then(content => JSON.parse(content))
        .catch(err => {
            console.log('Error loading post entries:', err)
        })

const displayEntries = (atElementId) =>
    loadEntries()
        .then(entries => {
            const ulElement = document.getElementById(atElementId);
            entries.forEach(entry => {
                const liElement = document.createElement('li');
                liElement.innerHTML = `<a href="/entries/${entry.file}">${entry.title}</a> - ${entry.description}`;
                ulElement.appendChild(liElement);
            });
        }).catch(err => {
            console.log('Error fetching data:', err)
        })

document.addEventListener('DOMContentLoaded', async () => {
    const pathParts = getPathParts(window.location.pathname)
    
    // if we got here from 404
    if (pathParts[0] == "posts") {
        const file = pathParts[1];
        loadEntries()
            .then(entries => { 
                const entry = entries.find(entry => entry.file === file);
                setWindowTitle(entry.title);
                loadFile(`entries/${entry.file}`)
                    .then(content => {
                        document.getElementById('content').textContent = content;
                    }).catch(err => {
                        console.log('Error fetching data:', err)
                    })
        })
        .catch(err => {
            console.log('Error fetching data:', err)
        })
        
    // if we got here from the root
    } else {
        const rootPath = getRootPath();
        const title = "Home";
        const url = `home.html`
        setWindowTitle("Home");
        loadFile(url)
            .then(content => {
                history.pushState({ path: url, title: title }, null, rootPath);
                document.getElementById('content').textContent = content;
            }).catch(err => {
                console.log('Error fetching data:', err)
            })
    }
    
    await displayEntries("entries");
    
    document.querySelectorAll('a').forEach(link => {
        const title = link.textContent;
        console.log(title);
        link.addEventListener('click', handleLinkClick);
    });
})
window.addEventListener('popstate', handlePopState);

// https://medium.com/swlh/using-react-router-on-github-pages-2702afdd5d0c
