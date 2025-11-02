import argparse
from wordlist_generator.generator import WordlistGenerator
from wordlist_generator.preferences import Preferences

def main():
    parser = argparse.ArgumentParser(description='Generate a wordlist based on user preferences.')
    parser.add_argument('--length', type=int, help='Length of the words in the wordlist')
    parser.add_argument('--count', type=int, help='Number of words to generate')
    parser.add_argument('--include-numbers', action='store_true', help='Include numbers in the wordlist')
    parser.add_argument('--include-special', action='store_true', help='Include special characters in the wordlist')

    args = parser.parse_args()

    preferences = Preferences()
    if args.length:
        preferences.set_length(args.length)
    if args.count:
        preferences.set_count(args.count)
    preferences.set_include_numbers(args.include_numbers)
    preferences.set_include_special(args.include_special)

    generator = WordlistGenerator(preferences)
    wordlist = generator.generate_wordlist()

    for word in wordlist:
        print(word)

if __name__ == '__main__':
    main()