[![imgtool: Beautiful Social Images, done right 🚀](./social.png)](#installation-📂)

## 📦 Table of Contents

- [📦 Table of Contents](#-table-of-contents)
- [📝 Todo](#-todo)
- [📂 Installation](#-installation)
  - [😎 Posix Users (Linux, MacOS, etc)](#-posix-users-linux-macos-etc)
  - [🪟 Windows Users](#-windows-users)
- [🏃 Usage](#-usage)
  - [🔨 Basic Usage](#-basic-usage)
    - [😎 Posix Users](#-posix-users)
    - [🪟 Windows Users](#-windows-users-1)
  - [🔧 Config](#-config)
    - [🗔 Specifying a Resolution](#-specifying-a-resolution)
    - [⏲ Specifying a Timeout](#-specifying-a-timeout)
    - [🧰 Using a custom template](#-using-a-custom-template)
- [📜 License](#-license)

## 📝 Todo

- [x] Add a way to specify a template file
- [x] Add Emojis to README
- [x] Add a way to specify a resolution
- [ ] Implement a way to specify a background color
- [ ] Add more todo items

## 📂 Installation

> Make sure git (and base-devel-equivalents) is installed<br/>
> - Arch: [`sudo pacman -S git base-devel`](https://wiki.archlinux.org/title/Pacman)<br/>
> - Ubuntu: [`sudo apt install git build-essential`](https://ubuntu.com/server/docs/package-management)<br/>
> - MacOS: [`brew install git`](https://brew.sh/)<br/>
> - Windows: [`git-scm.com/download/win`](https://git-scm.com/download/win)
> 
> Additionally, make sure [PNPM](https://pnpm.io/) is installed.<br/>
> - All POSIX: [`curl -fsSL https://get.pnpm.io/install.sh | sh -`](https://get.pnpm.io/install.sh)
> - Windows: [`iwr https://get.pnpm.io/install.ps1 -useb | iex`](https://get.pnpm.io/install.ps1)
>
> **As with any software, make sure you trust the source before running any commands.**


### 😎 Posix Users (Linux, MacOS, etc)

```bash
# Clone the repository
git clone git@github.com:Exponential-Workload/imgtool.git ~/imgtool;
# Enter the repository
cd ~/imgtool;
# Install dependencies
pnpm i;
echo "export PATH=$PATH:~/imgtool/bin" >> ~/.bashrc;echo "export PATH=$PATH:~/imgtool/bin" >> ~/.zshrc;export PATH=$PATH:~/imgtool/bin
```

### 🪟 Windows Users

```bash
cd %USERPROFILE%
git clone git@github.com:Exponential-Workload/imgtool.git imgtool;
cd ~/imgtool;
pnpm i;
```

## 🏃 Usage

### 🔨 Basic Usage

#### 😎 Posix Users

```bash
imgtool
```

#### 🪟 Windows Users

```batch
cd %USERPROFILE%\imgtool;
pnpm start
```

### 🔧 Config
#### 🗔 Specifying a Resolution

Add
```bash
--res 1920x1080
```
to your arguments.

#### ⏲ Specifying a Timeout

Add
```bash
--timeout 1000
```
to your arguments. This will make the CLI wait 1000ms before taking the screenshot, to ensure the background has loaded.

#### 🧰 Using a custom template

Make a file similar to the [template.html](./template.html) in this repository in the folder you run the CLI in, and it will use that.

## 📜 License

Copyright (c) 2023 Nexus Networks.<br/>
Licensed under the [MIT License](./LICENSE).
