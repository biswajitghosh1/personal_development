# DocTrack — Document URL Tracker

Minimal static web app to track document URLs with section, description and notes. Data is stored in browser `localStorage`.

Files added
- `index.html` — app entry
- `static/styles.css` — styles (subtle red/yellow theme)
- `static/app.js` — app logic (add/edit/delete, import/export)
- `static/logo.svg` — simple logo

Run locally
1. Start a static server in the repo root:

```bash
python3 -m http.server 8000
```

2. Open http://localhost:8000

Notes
- This is a client-only app (no backend). Data is kept in your browser's localStorage.
- Export/import JSON to move data between devices.

# Development Repository

## Overview

This repository is a monorepo for personal and enterprise device management, automation, and knowledge sharing, primarily focused on Workspace ONE (WS1) and related platforms. It contains:

- **Personal Projects** (HTML/JS/CSS, React)
- **Workspace ONE Artifacts** (Profiles, Scripts, Sensors, Email Templates)
- **Platform Automation** (PowerShell, Shell scripts)
- **Reference Documentation** (Markdown knowledge base, platform guides)

---

## Directory Structure

- `0. Personal_Development/`
   - `html/` – Web dashboards, investment tools, and knowledge base (static HTML/JS/CSS)
   - `react/` – React-based projects (e.g., internet speed test, portfolio template)
- `0.2. Platform_Automation/`
   - `PowerShell/` – Device automation scripts for iOS
   - `Shell_Scripting/` – Shell automation (currently a placeholder)
- `0.3. Reference_Files/` – Markdown docs for platforms, workflows, and WS1 operations
- `1. Workspace_One/`
   - `Dev/`, `Product/`, `Test/` – Each with subfolders for `email`, `profiles`, `scripts`, `sensors` by platform (iOS, macOS, Android)

---

## Key Workflows

### 1. Web Dashboards & Tools

- **Device Dashboard**:
   - Path: `0. Personal_Development/html/device_dashboard_WIP/`
   - Uses Bootstrap, Chart.js, and custom JS to visualize device data from Workspace ONE APIs.
   - Configure API credentials in `script.js` before use.

- **Investment Summary**:
   - Path: `0. Personal_Development/html/investment_summary_WIP/`
   - Simple login and dashboard, static authentication in JS.

- **Knowledge Base**:
   - Path: `0. Personal_Development/html/knowledge_base_WIP/`
   - Markdown-driven, with code highlighting and navigation for WS1 operations.

### 2. React Apps

- Each React project (e.g., `internet_speedtest`) uses Create React App conventions.
- Use `npm install` and `npm start` in the respective project directory.

### 3. Workspace ONE Artifacts

- **Profiles**:
   - Store XML/plist or JSON profile payloads for iOS/macOS in `profiles/`.
   - Reference Omnissa KBs for deployment steps (see main `README.md`).

- **Scripts**:
   - Bash, Zsh, or PowerShell scripts for device automation.
   - Place scripts in the appropriate platform subfolder.

- **Email Templates**:
   - HTML templates for device enrollment, compliance, etc.

- **Sensors**:
   - Custom device sensors for WS1, organized by platform.

### 4. Platform Automation

- PowerShell and Shell scripts for device management tasks.
- Scripts are organized by platform and function.

### 5. Reference Files

- Markdown files document assignment groups, compliance policies, workflows, and platform details.
- Use as a quick reference for WS1 operations.

---

## Project Conventions

- **No central build system**: Each app or script is self-contained.
- **Web apps**: Use CDN for dependencies (Bootstrap, Chart.js, Highlight.js).
- **Sensitive data**: API keys and secrets in JS files are placeholders—replace before use.
- **Documentation**: All major workflows and platform details are documented in Markdown under `0.3. Reference_Files/`.

---

## Security

See `SECURITY.md` for supported versions and vulnerability reporting.

---

## Getting Started

1. **Clone the repo** and navigate to the desired project.
2. For React apps:

    ```bash
    cd 0. Personal_Development/react/internet_speedtest
    npm install
    npm start
    ```

3. For HTML tools:

    Open the `.html` file directly in your browser.

4. For scripts:

    Review and run scripts in the appropriate shell or PowerShell environment.

---

## License

See [LICENSE](LICENSE).

