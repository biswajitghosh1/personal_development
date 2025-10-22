# Introduction
This repository will host and keep a track of security tools which is being tested and will also have the projects and applications created for this purpose. This is completely a hobby and should be treated as such without any explicit or implicit warranty.

# Installation & Git setup (VSCode, SSH keys, GPG keys, GitHub)

This document provides step-by-step instructions to:
- Install Visual Studio Code (VSCode)
- Create and install an SSH key for GitHub
- Create and install a GPG key for commit signing
- Configure Git and VSCode to use those keys

Use the instructions that match your OS (Windows / macOS / Linux). Replace example emails and filenames with your own values.

---

## 1. Prerequisites
- A GitHub account
- Administrative or install privileges on your machine
- Git installed and on your PATH
- Recommended: use Git Bash on Windows or WSL for UNIX-like tooling

---

## 2. Install Visual Studio Code

1. Download the stable installer:
   - Windows: https://code.visualstudio.com/
   - macOS: https://code.visualstudio.com/
   - Linux: use distro package manager or download the .deb/.rpm from the site.

2. Install and open VSCode.

3. Recommended settings and extensions:
   - Settings Sync: enable to sync settings across machines (Sign in with GitHub or Microsoft).
   - Extensions: GitLens, Git Graph, Prettier, ESLint, Python (if relevant), Remote - WSL (Windows WSL users).
   - Configure your Git user (see section 5).

4. Optional: Enable Auto Fetch and set preferred shell in VSCode terminal.

---

## 3. Create an SSH key (for Git operations)

Preferred key type: ed25519. Use RSA 4096 if ed25519 is unavailable.

Linux / macOS / Git Bash (Windows):
```sh
# Generate key (replace email)
ssh-keygen -t ed25519 -C "your.email@example.com" -f ~/.ssh/id_ed25519
# Or RSA:
# ssh-keygen -t rsa -b 4096 -C "your.email@example.com" -f ~/.ssh/id_rsa