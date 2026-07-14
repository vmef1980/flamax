// Bloqueos de teclado/clic-derecho (NO afecta el contenido de la página, es solo cosmético/disuasorio)
    document.addEventListener("keydown", function(e) {
      if (e.key === "F12" || e.keyCode === 123) { e.preventDefault(); return false; }
      if (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C" || e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) { e.preventDefault(); return false; }
      if (e.ctrlKey && (e.key === "u" || e.key === "U" || e.keyCode === 85)) { e.preventDefault(); return false; }
      if (e.ctrlKey && (e.key === "s" || e.key === "S" || e.keyCode === 83)) { e.preventDefault(); return false; }
      if (e.ctrlKey && (e.key === "p" || e.key === "P" || e.keyCode === 80)) { e.preventDefault(); return false; }
    });
    document.addEventListener("contextmenu", function(e) { e.preventDefault(); return false; });