# GitHub Pages SPA
This is a Single Page Application (SPA) that uses GitHub Pages with Markdown files as the data source. It's built to create a free blog-like website with a simple and clean design, where users push their posts through git instead of a CMS.

# Development
Because of CORS restrictions, a local server needs to run to test the app. 
It also manages the 404.html page in the same way as as GitHub Pages does.

Run it by:

```bash
tsc; python3 ./simple-server/server.py
```

## Notes

Check https://modern-web.dev/docs/dev-server/overview/

Check https://medium.com/swlh/using-react-router-on-github-pages-2702afdd5d0c

Check https://github.com/rafgraph/spa-github-pages
