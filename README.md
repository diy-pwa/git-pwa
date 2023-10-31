# git-pwa

## git-cli for use in pwa where git is not installed.

### Quick start

1. Create an empty folder on a machine with a node version 16 or later environment 
OR go to stackblitz.com and select node.js environment
2. `npx git-pwa --branch next clone https://github.com/diy-pwa/coming-soon.git .`

### Workflow

This is meant to support the workflow for creating and maintaining a new repo. For instance:

```bash
echo "# testOct15" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/rhildred/testOct15.git
git push -u origin main
```
It is also meant to support this workflow:

```bash
git remote add origin https://github.com/rhildred/test-of-push-u.git
git branch -M main
git push -u origin main
```


After it has been pushed, git clones, adds, and commits should be the bulk of what is required. Please let me know by filing an issue if it is not.
