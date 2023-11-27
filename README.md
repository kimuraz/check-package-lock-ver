# Check package-lock versions

This project aims to verify multiple package-lock files (v3) in different folders to analyze the different versions on each of the common dependencies between the projects.

## How to install it

The project is written in javascript and can be install as binary on the system via `npm` or other node package manager.

```sh
$ npm i && npm i -g .
```

## How to use it 

```sh 
Execute package-lock checker

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -r, --root     Root directory                          [string] [default: "."]
  -d, --dirs     Directories to check for package-lock.json from root directory
                                                        [string] [default: null]
```

> The root directory should be the parent directory that contains the projects' folders 

Example:

```sh
$ check-package-lock-ver -r=../check-package-lock-ver-demo
```

Here the `check-package-lock-ver-demo` folder should look like:

```sh 
.
├── bla
│   ├── node_modules
│   ├── package.json
│   └── package-lock.json
└── bla2
    ├── node_modules
    ├── package.json
    └── package-lock.json
```
