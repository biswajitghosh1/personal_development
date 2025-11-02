# Wordlist Generator

## Overview
The Wordlist Generator is a Python application that allows users to create customized wordlists based on their preferences. It features a graphical user interface (GUI) for easy interaction and a command-line interface (CLI) for advanced users.

## Features
- User-friendly GUI for entering wordlist preferences.
- Command-line interface for generating wordlists directly from the terminal.
- Customizable options for wordlist generation, including length, character sets, and more.
- Utility functions for input validation and formatting.

## Installation
To install the Wordlist Generator, clone the repository and install the required dependencies:

```bash
git clone https://github.com/yourusername/wordlist-generator.git
cd wordlist-generator
pip install -r requirements.txt
```

## Usage
### GUI
To start the GUI application, run the following command:

```bash
python -m src.wordlist_generator.main
```

### CLI
To generate a wordlist using the command line, use the following command:

```bash
python -m src.scripts.cli --options
```

Replace `--options` with your desired parameters for wordlist generation.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.