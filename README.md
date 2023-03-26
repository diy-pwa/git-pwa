# diy-pwa

## 80% prototype progressive web app (pwa) for sales engineers.

### Quick start

1. Create an empty folder on a machine with a node version 16 or later environment 
OR go to stackblitz.com and selecy node.js environment
2. `npx diy-pwa create`
3. `npm install`
4. `npm run dev`

To publish this on cloudflare pages from stackblitz:

1. login
2. connect repository
3. login to cloudflare and go to pages
4. go to `create a project`
5. `connect to git`
![create a project](README_IMAGES/connect_repository.png)
7. fill in build command `npm run build` and asset folder `dist/client`
8. set `NODE_VERSION` environment variable to be `17`
![build command](README_IMAGES/project_settings.png)

To publish on cloudflare pages from the command line:

1. follow the steps that start with `git init` when adding a new repository and start with step 2 above.
