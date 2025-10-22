# Wordlist Generator Usage Documentation

## Overview
The Wordlist Generator is a Python application that allows users to create customized wordlists based on their preferences. This tool is particularly useful for tasks such as password generation, brainstorming, and linguistic studies.

## Features
- User-friendly graphical interface for entering wordlist preferences.
- Options to customize word length, character sets, and patterns.
- Ability to save generated wordlists to a file.
- Command-line interface for quick access and automation.

## Getting Started
To use the Wordlist Generator, follow these steps:

1. **Installation**:
   - Clone the repository:
     ```
     git clone https://github.com/yourusername/wordlist-generator.git
     ```
   - Navigate to the project directory:
     ```
     cd wordlist-generator
     ```
   - Install the required packages:
     ```
     pip install -r requirements.txt
     ```

2. **Running the Application**:
   - To launch the graphical user interface, run:
     ```
     python -m src.wordlist_generator.main
     ```
   - Alternatively, you can use the command-line interface:
     ```
     python -m src.scripts.cli
     ```

## Using the GUI
- Upon launching the application, you will see the main window where you can enter your preferences.
- **Word Length**: Specify the minimum and maximum length of the words.
- **Character Sets**: Choose from options like lowercase, uppercase, numbers, and special characters.
- **Patterns**: Define any specific patterns you want the words to follow (e.g., alternating cases).
- After setting your preferences, click the "Generate" button to create your wordlist.
- You can save the generated wordlist by clicking the "Save" button and choosing a file location.

## Examples
- To generate a wordlist of 5 to 10 character long words using lowercase letters and numbers, set the following:
  - Minimum Length: 5
  - Maximum Length: 10
  - Character Sets: [Lowercase, Numbers]

- For a command-line example, you can generate a wordlist with:
  ```
  python -m src.scripts.cli --min-length 5 --max-length 10 --include lowercase,numbers
  ```

## Conclusion
The Wordlist Generator is a versatile tool that can be tailored to meet various needs. Whether you prefer a graphical interface or command-line access, this application provides a straightforward way to generate wordlists efficiently.