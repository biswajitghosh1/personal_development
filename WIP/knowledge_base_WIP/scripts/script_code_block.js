    document.addEventListener("DOMContentLoaded", () => {
      hljs.highlightAll();
      hljs.initLineNumbersOnLoad();

      document.querySelectorAll(".copy-btn").forEach(button => {
        button.addEventListener("click", () => {
          const codeBlock = button.nextElementSibling.querySelector("code");
          const text = codeBlock.innerText;

          navigator.clipboard.writeText(text).then(() => {
            button.textContent = "Copied!";
            setTimeout(() => {
              button.textContent = "Copy";
            }, 1500);
          });
        });
      });
    });