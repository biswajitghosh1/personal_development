class WordlistGenerator:
    def __init__(self, preferences):
        self.preferences = preferences

    def generate_wordlist(self):
        wordlist = []
        length_range = self.preferences.length_range
        include_numbers = self.preferences.include_numbers
        include_special_chars = self.preferences.include_special_chars

        # Generate words based on preferences
        for length in range(length_range[0], length_range[1] + 1):
            word = self._generate_word(length, include_numbers, include_special_chars)
            wordlist.append(word)

        return wordlist

    def _generate_word(self, length, include_numbers, include_special_chars):
        import random
        import string

        characters = string.ascii_lowercase
        if include_numbers:
            characters += string.digits
        if include_special_chars:
            characters += string.punctuation

        return ''.join(random.choice(characters) for _ in range(length))