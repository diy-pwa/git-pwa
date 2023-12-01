import 'mocha' ;
import 'mocha/mocha.css';
import './styles.css';
import {expect} from 'chai';
import { WebContainer } from '@webcontainer/api';
import FsPromises from './Promises.js';
import GitLoader from './GitLoader.js';
mocha.setup('bdd');
const webcontainerInstance = await WebContainer.boot();

describe('test', () => {
  it('passes', async () => {
    expect(1).to.eql(1);
  });
  it("boots a container, mounts an fs and checks that the file is what we think", async () => {
    webcontainerInstance.mount({
        // This is a file - provide its path as a key:
        'rich.txt': {
            // Because it's a file, add the "file" key
            file: {
                // Now add its contents
                contents: "Rich was here!"
            },
        },
    });
    const sContents = await webcontainerInstance.fs.readFile("rich.txt", "utf-8");
    expect(sContents).to.eql("Rich was here!");
  });
  it("decorates the webcontainer fs with promises", async () =>{
    webcontainerInstance.mount({
      // This is a file - provide its path as a key:
      'rich.txt': {
          // Because it's a file, add the "file" key
          file: {
              // Now add its contents
              contents: "Rich was here!"
          },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    expect(fs.promises).not.to.eql(null);

  });

  it("decorates the webcontainer fs with promises and reads a file", async () =>{
    webcontainerInstance.mount({
      // This is a file - provide its path as a key:
      'rich.txt': {
          // Because it's a file, add the "file" key
          file: {
              // Now add its contents
              contents: "Rich was here!"
          },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const sContents = await fs.promises.readFile("rich.txt", "utf8");
    expect(sContents).to.eql("Rich was here!");

  });
  it("decorates the webcontainer fs with promises and writes and reads a file", async () =>{
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    await fs.promises.writeFile("test.txt", "This is a test.");
    const sContents = await fs.promises.readFile("test.txt", "utf8");
    expect(sContents).to.eql("This is a test.");

  });
  it("decorates the webcontainer fs with promises and unlinks a file", async () =>{
    webcontainerInstance.mount({
      // This is a file - provide its path as a key:
      'rich.txt': {
          // Because it's a file, add the "file" key
          file: {
              // Now add its contents
              contents: "Rich was here!"
          },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    await fs.promises.unlink("rich.txt");
    // just getting here is good enough
    expect(1).to.eql(1);


  });

  it("decorates the webcontainer fs with promises and reads the src folder", async () =>{
    webcontainerInstance.mount({
      // This is a directory - provide its name as a key
      src: {
        // Because it's a directory, add the "directory" key
        directory: {
          // This is a file - provide its path as a key:
          'main.js': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                console.log('Hello from WebContainers!')
              `,
            },
          },
          // This is another file inside the same folder
          'main.css': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                body {
                  margin: 0;
                }
              `,
            },
          },
        },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    await fs.promises.readdir("src");
    // just getting here is good enough
    expect(1).to.eql(1);


  });
  it("decorates the webcontainer fs with promises and makes a folder", async () =>{
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    await fs.promises.mkdir("test3");
    // just getting here is good enough
    expect(1).to.eql(1);
  });
  it("decorates the webcontainer fs with promises and deletes a folder", async () =>{
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    await fs.promises.mkdir("test4");
    await fs.promises.rmdir("test4");
    // just getting here is good enough
    expect(1).to.eql(1);
  });
  it("does a stat on a folder and knows it is a directory", async ()=>{
    webcontainerInstance.mount({
      // This is a directory - provide its name as a key
      src: {
        // Because it's a directory, add the "directory" key
        directory: {
          // This is a file - provide its path as a key:
          'main.js': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                console.log('Hello from WebContainers!')
              `,
            },
          },
          // This is another file inside the same folder
          'main.css': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                body {
                  margin: 0;
                }
              `,
            },
          },
        },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const stat = await fs.promises.stat("src");
    expect(stat.isDirectory()).to.eql(true);
  })
  it("does a stat on a folder and knows it is not a symbolic link", async ()=>{
    webcontainerInstance.mount({
      // This is a directory - provide its name as a key
      src: {
        // Because it's a directory, add the "directory" key
        directory: {
          // This is a file - provide its path as a key:
          'main.js': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                console.log('Hello from WebContainers!')
              `,
            },
          },
          // This is another file inside the same folder
          'main.css': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                body {
                  margin: 0;
                }
              `,
            },
          },
        },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const stat = await fs.promises.stat("src");
    expect(stat.isSymbolicLink()).to.eql(false);
  });

  it("does a stat on a file and knows the size", async ()=>{
    webcontainerInstance.mount({
      // This is a directory - provide its name as a key
      src: {
        // Because it's a directory, add the "directory" key
        directory: {
          // This is a file - provide its path as a key:
          'main.js': {
            // Because it's a file, add the "file" key
            file: {
              contents: `console.log('Hello from WebContainers!')`,
            },
          },
          // This is another file inside the same folder
          'main.css': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                body {
                  margin: 0;
                }
              `,
            },
          },
        },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const stat = await fs.promises.stat("src/main.js");
    expect(stat.size).to.eql(40);
  });
  it("gets the size of a file, writes to it and then makes sure the size is different", async () =>{
    webcontainerInstance.mount({
      // This is a file - provide its path as a key:
      'rich.txt': {
          // Because it's a file, add the "file" key
          file: {
              // Now add its contents
              contents: "Rich was here!"
          },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const oStat1 = (await fs.promises.stat("rich.txt")).snapshot();
    await fs.promises.writeFile("rich.txt", "should be changed");
    const sContents = await fs.promises.readFile("rich.txt", "utf8");
    expect(sContents).to.eql("should be changed");
    const oStat2 = await fs.promises.stat("rich.txt");
    expect(oStat1.size != oStat2.size).to.eql(true);
  });
  it("does a stat on a file, not in the root, changes it and sees a different size", async ()=>{
    webcontainerInstance.mount({
      // This is a directory - provide its name as a key
      src: {
        // Because it's a directory, add the "directory" key
        directory: {
          // This is a file - provide its path as a key:
          'main.js': {
            // Because it's a file, add the "file" key
            file: {
              contents: `console.log('Hello from WebContainers!')`,
            },
          },
          // This is another file inside the same folder
          'main.css': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                body {
                  margin: 0;
                }
              `,
            },
          },
        },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const stat = (await fs.promises.stat("src/main.js")).snapshot();
    fs.promises.writeFile("src/main.js", "console.log('hello world')");
    const sContents = await fs.promises.readFile("src/main.js", "utf8");
    expect(sContents).to.eql("console.log('hello world')");
    setTimeout(async ()=>{
      const stat2 = await fs.promises.stat("src/main.js");
      expect(stat.size != stat2.size).to.eql(true);
      // not sure why I had to do this. Something quirky with the container?????
    }, 0);
  });
  it("does a lstat on a file and knows the size", async ()=>{
    webcontainerInstance.mount({
      // This is a directory - provide its name as a key
      src: {
        // Because it's a directory, add the "directory" key
        directory: {
          // This is a file - provide its path as a key:
          'main.js': {
            // Because it's a file, add the "file" key
            file: {
              contents: `console.log('Hello from WebContainers!')`,
            },
          },
          // This is another file inside the same folder
          'main.css': {
            // Because it's a file, add the "file" key
            file: {
              contents: `
                body {
                  margin: 0;
                }
              `,
            },
          },
        },
      },
    });
    const fs = webcontainerInstance.fs;
    fs.promises = new FsPromises({fs:fs});
    const stat = await fs.promises.lstat("src/main.js");
    expect(stat.size).to.eql(40);
  });  
  it("does a git init", async () =>{
    await webcontainerInstance.fs.mkdir("test");
    const oLoader = new GitLoader({fs: webcontainerInstance.fs, argv:{_:['','','init']}, b:"main"});
    // need to do this to workaround problem in isomorphic git
    oLoader.base.gitdir = "test/.git";
    oLoader.base.dir = "test";
    const rc = await oLoader.runCommand();
    expect(rc.match(/on branch main/) == null).toBe(false);
  });
});

mocha.run();