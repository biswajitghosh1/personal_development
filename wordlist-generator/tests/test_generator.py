import unittest
from wordlist_generator.generator import WordlistGenerator

class TestWordlistGenerator(unittest.TestCase):

    def setUp(self):
        self.generator = WordlistGenerator()

    def test_generate_wordlist_basic(self):
        preferences = {
            'length': 5,
            'count': 10,
            'include_numbers': False,
            'include_special_chars': False
        }
        wordlist = self.generator.generate_wordlist(preferences)
        self.assertEqual(len(wordlist), 10)
        for word in wordlist:
            self.assertEqual(len(word), 5)
            self.assertTrue(word.isalpha())

    def test_generate_wordlist_with_numbers(self):
        preferences = {
            'length': 5,
            'count': 10,
            'include_numbers': True,
            'include_special_chars': False
        }
        wordlist = self.generator.generate_wordlist(preferences)
        self.assertEqual(len(wordlist), 10)
        for word in wordlist:
            self.assertEqual(len(word), 5)
            self.assertTrue(any(char.isdigit() for char in word))

    def test_generate_wordlist_with_special_chars(self):
        preferences = {
            'length': 5,
            'count': 10,
            'include_numbers': False,
            'include_special_chars': True
        }
        wordlist = self.generator.generate_wordlist(preferences)
        self.assertEqual(len(wordlist), 10)
        for word in wordlist:
            self.assertEqual(len(word), 5)
            self.assertTrue(any(not char.isalnum() for char in word))

    def test_generate_wordlist_invalid_length(self):
        preferences = {
            'length': -1,
            'count': 10,
            'include_numbers': False,
            'include_special_chars': False
        }
        with self.assertRaises(ValueError):
            self.generator.generate_wordlist(preferences)

    def test_generate_wordlist_invalid_count(self):
        preferences = {
            'length': 5,
            'count': 0,
            'include_numbers': False,
            'include_special_chars': False
        }
        with self.assertRaises(ValueError):
            self.generator.generate_wordlist(preferences)

if __name__ == '__main__':
    unittest.main()