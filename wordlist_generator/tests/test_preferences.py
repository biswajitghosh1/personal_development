import unittest
from wordlist_generator.preferences import Preferences

class TestPreferences(unittest.TestCase):

    def setUp(self):
        self.preferences = Preferences()

    def test_default_preferences(self):
        self.assertEqual(self.preferences.length, 8)
        self.assertEqual(self.preferences.include_numbers, False)
        self.assertEqual(self.preferences.include_special_chars, False)

    def test_set_preferences(self):
        self.preferences.set_length(12)
        self.preferences.set_include_numbers(True)
        self.preferences.set_include_special_chars(True)

        self.assertEqual(self.preferences.length, 12)
        self.assertEqual(self.preferences.include_numbers, True)
        self.assertEqual(self.preferences.include_special_chars, True)

    def test_invalid_length(self):
        with self.assertRaises(ValueError):
            self.preferences.set_length(0)

    def test_invalid_include_numbers(self):
        with self.assertRaises(ValueError):
            self.preferences.set_include_numbers("yes")

    def test_invalid_include_special_chars(self):
        with self.assertRaises(ValueError):
            self.preferences.set_include_special_chars("no")

if __name__ == '__main__':
    unittest.main()