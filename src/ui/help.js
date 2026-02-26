export const HELP_TEXTS = {
  resources:
    "Rohstoffe: Holz, Lehm, Eisen, Getreide.\n\nProduktion: Rohstofffelder erzeugen pro Stunde. Die Zahl zeigt +X/h.\n\nSpeicher: Lagerhaus (Holz/Lehm/Eisen) und Getreidespeicher begrenzen die Kapazität.\n\nVerbrauch: Truppen verbrauchen Getreide pro Stunde. Wenn Verbrauch > Produktion, sinkt der Getreide-Vorrat.",
  map:
    "Weltkarte: Dein Dorf ist in der Mitte (🏰). Klicke darauf, um zum Dorf-Tab zu wechseln und Gebäude/Felder auszubauen.\n\nDie umliegenden Felder können später für weitere Dörfer genutzt werden.",
  village:
    "Dorfzentrum: 6 Gebäude-Plätze.\n\n• Hauptgebäude: Reduziert Bauzeiten\n• Kaserne: Truppen rekrutieren\n• Lagerhaus: Speicher für Holz, Lehm, Eisen\n• Getreidespeicher: Speicher für Getreide\n• Stadtmauer: Verteidigung\n• Versammlungsplatz: 2. Bau-Queue\n\nRohstofffelder: 4× Holzfäller, 4× Lehmgrube, 4× Eisenmine, 6× Acker. Klicken zum Ausbauen.",
  fields:
    "Rohstofffelder produzieren kontinuierlich:\n\n• Holzfäller → Holz\n• Lehmgrube → Lehm\n• Eisenmine → Eisen\n• Acker → Getreide\n\nJede Stufe erhöht die Produktion. Acker sind teurer (mehr Getreide-Kosten), da Getreide der limitierende Faktor ist.",
  troops:
    "Truppen rekrutieren: Benötigt Kaserne.\n\nJede Einheit verbraucht Getreide pro Stunde (steht bei jedem Typ). Achte darauf, dass deine Getreide-Produktion den Verbrauch deckt.\n\nHauptgebäude und Kaserne beschleunigen die Rekrutierung.",
  reports:
    "Berichte protokollieren alle Aktionen: Bauabschlüsse, Rekrutierungen, Warnungen. Die neuesten stehen oben.",
};

/**
 * @param {{
 *  modalEl: HTMLElement,
 *  titleEl: HTMLElement,
 *  textEl: HTMLElement,
 *  closeBtn: HTMLElement,
 *  modalHelpBtn: HTMLElement,
 * }} els
 */
export function createHelpController(els) {
  let currentModalHelp = "";

  function show(title, text) {
    els.titleEl.textContent = title;
    els.textEl.textContent = text;
    els.modalEl.classList.add("show");
    els.closeBtn.focus?.();
  }

  function hide() {
    els.modalEl.classList.remove("show");
  }

  function showHelp(key) {
    show("Hilfe", HELP_TEXTS[key] || "Keine Hilfe verfügbar.");
  }

  function setModalHelp(text) {
    currentModalHelp = text || "";
    els.modalHelpBtn.style.display = currentModalHelp ? "inline-flex" : "none";
  }

  function showModalHelp() {
    if (!currentModalHelp) return;
    show("Erklärung", currentModalHelp);
  }

  els.closeBtn.addEventListener("click", hide);
  els.modalEl.addEventListener("click", (e) => {
    if (e.target === els.modalEl) hide();
  });
  els.modalHelpBtn.addEventListener("click", showModalHelp);

  return { showHelp, setModalHelp, showModalHelp, hideHelp: hide };
}

