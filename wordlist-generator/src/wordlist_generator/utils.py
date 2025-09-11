def validate_input(input_value):
    # Validate that the input is a non-empty string
    if not isinstance(input_value, str) or not input_value.strip():
        raise ValueError("Input must be a non-empty string.")
    return input_value.strip()

def format_wordlist(wordlist):
    # Format the wordlist into a string with each word on a new line
    return "\n".join(wordlist)

def save_wordlist_to_file(wordlist, filename):
    # Save the generated wordlist to a specified file
    with open(filename, 'w') as file:
        file.write(format_wordlist(wordlist))