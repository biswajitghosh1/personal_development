class Preferences:
    def __init__(self):
        self.preferences = {
            "length": 8,
            "include_numbers": True,
            "include_special_characters": False,
            "case_sensitive": True,
            "word_count": 100
        }

    def set_preference(self, key, value):
        if key in self.preferences:
            self.preferences[key] = value
        else:
            raise KeyError(f"Preference '{key}' does not exist.")

    def get_preference(self, key):
        if key in self.preferences:
            return self.preferences[key]
        else:
            raise KeyError(f"Preference '{key}' does not exist.")

    def get_all_preferences(self):
        return self.preferences.copy()