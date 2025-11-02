from tkinter import Tk, Label, Entry, Button, StringVar, messagebox
from wordlist_generator.preferences import Preferences
from wordlist_generator.generator import WordlistGenerator

class WordlistGeneratorGUI:
    def __init__(self, master):
        self.master = master
        master.title("Wordlist Generator")

        self.preferences = Preferences()

        self.label = Label(master, text="Enter your preferences:")
        self.label.pack()

        self.length_var = StringVar()
        self.length_label = Label(master, text="Word Length:")
        self.length_label.pack()
        self.length_entry = Entry(master, textvariable=self.length_var)
        self.length_entry.pack()

        self.count_var = StringVar()
        self.count_label = Label(master, text="Number of Words:")
        self.count_label.pack()
        self.count_entry = Entry(master, textvariable=self.count_var)
        self.count_entry.pack()

        self.generate_button = Button(master, text="Generate Wordlist", command=self.generate_wordlist)
        self.generate_button.pack()

    def generate_wordlist(self):
        try:
            length = int(self.length_var.get())
            count = int(self.count_var.get())
            self.preferences.set_length(length)
            self.preferences.set_count(count)

            generator = WordlistGenerator(self.preferences)
            wordlist = generator.generate_wordlist()

            messagebox.showinfo("Generated Wordlist", "\n".join(wordlist))
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid integers for length and count.")

if __name__ == "__main__":
    root = Tk()
    gui = WordlistGeneratorGUI(root)
    root.mainloop()