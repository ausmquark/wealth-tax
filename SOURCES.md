SOURCES
=======

Zurich (Canton / City)
- Wegleitung zur Steuererklärung 2024 (Zürcher Steueramt, contains tariff tables and examples):
  https://www.zh.ch/content/dam/zhweb/bilder-dokumente/themen/steuern-finanzen/steuern/natuerlichepersonen/2024/est-wegleitungen/305_Wegleitung_ZH_2024_HA%20bf%20DEF.pdf
- Zürcher Steuerbuch / Steuerwissen (legal rules, notes on taxable wealth and deductions):
  https://www.zh.ch/de/steuern-finanzen/steuern/treuhaender/steuerbuch.html
- Current municipal tax multipliers (Gemeindesteuerfüsse) — Stadt Zürich 2024 = 119% (PDF list):
  https://www.zh.ch/de/steuern-finanzen/steuern/steuerstatistiken/aktuelle-gemeinde-steuerfuesse.html
  https://www.zh.ch/bin/zhweb/publish/regierungsratsbeschluss-unterlagen./2023/1020/5931_Steuerfuss_2024_2025.pdf

Balearic Islands / Mallorca (Spain)
- Manual práctico / normativa autonómica (AEAT / Agencia Tributaria manual pages for autonomous scales):
  https://www3.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/patrimonio-2024/normativa/normativa-autonomica-ip/baleares.html
- BOIB / Ley de presupuestos (2024 references):
  https://www.caib.es/eboibfront/pdf/es/2023/176/1139616

Notes
-----
- The Zurich cantonal tariff table is implemented using promille bands extracted from the canton Wegleitung PDF. The Zurich calculation in `script.js` applies the Staatssteuerfuss (98%) and the Stadt Zürich Gemeindesteuerfuss (119%) to the cantonal base tax. If you need other municipalities, replace `gemeindesteuerfuss` with the appropriate multiplier from the canton list.
- The Mallorca model uses the Balearic autonomous-region scale published for 2024 and the 3,000,000 EUR mínimo exento.
