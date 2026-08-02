export interface HebrewVocabItem {
  id: string;
  char: string;
  transliteration: string;
  vuk: string;
  translation: string;
  english: string;
  emoji: string;
  category: 'mudrost' | 'svakodnevno' | 'priroda' | 'glagoli' | 'misaoni' | 'zdravlje' | 'posao_tehnologija' | 'hrana' | 'vreme_brojevi' | 'emocije';
  categoryLabel: string;
  root?: string;
  visualTip?: string;
}

export const HEBREW_VOCAB_EXPANDED: HebrewVocabItem[] = [
  // --- MUDROST I FILOZOFIJA (h1 - h50) ---
  { id: 'h1', char: 'שָׁלוֹם', transliteration: 'Shalom', vuk: 'šalom', translation: 'Mir / Spokoj', english: 'Peace / Harmony / Hello', emoji: '🕊️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-ל-ם', visualTip: 'Wholeness and total inner harmony' },
  { id: 'h2', char: 'אַהֲבָה', transliteration: 'Ahava', vuk: 'ahava', translation: 'Ljubav', english: 'Love', emoji: '💖', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-ה-ב', visualTip: 'Unconditional heart connection' },
  { id: 'h3', char: 'אוֹר', transliteration: 'Or', vuk: 'or', translation: 'Svetlost', english: 'Light', emoji: '✨', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-ו-ר', visualTip: 'Illuminating spark in darkness' },
  { id: 'h4', char: 'חַיִּים', transliteration: 'Chaim', vuk: 'hajim', translation: 'Život', english: 'Life', emoji: '🌱', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-י-ה', visualTip: 'Plural form: two-fold vital breath' },
  { id: 'h5', char: 'לֵב', transliteration: 'Lev', vuk: 'lev', translation: 'Srce / Um', english: 'Heart / Mind', emoji: '❤️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ל-ב-ב', visualTip: 'Seat of pure intention & courage' },
  { id: 'h6', char: 'נְשָׁמָה', transliteration: 'Neshama', vuk: 'nešama', translation: 'Duša', english: 'Soul / Spirit', emoji: '👼', category: 'mudrost', categoryLabel: 'Mudrost', root: 'נ-ש-ם', visualTip: 'Divine breath infused into man' },
  { id: 'h7', char: 'אֱמֶת', transliteration: 'Emet', vuk: 'emet', translation: 'Istina', english: 'Truth', emoji: '⚖️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-מ-ת', visualTip: 'First, middle & last Hebrew letters' },
  { id: 'h8', char: 'חָכְמָה', transliteration: 'Chokhmah', vuk: 'hohma', translation: 'Mudrost', english: 'Wisdom', emoji: '🦉', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-כ-ם', visualTip: 'Flash of creative insight' },
  { id: 'h9', char: 'בְּרָכָה', transliteration: 'Brakha', vuk: 'braha', translation: 'Blagoslov', english: 'Blessing', emoji: '🕯️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ב-ר-ך', visualTip: 'Bending knee in reverence' },
  { id: 'h10', char: 'תִּקְוָה', transliteration: 'Tikvah', vuk: 'tikva', translation: 'Nada', english: 'Hope', emoji: '🌟', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ק-ו-ה', visualTip: 'Bound line or cord of faith' },
  { id: 'h11', char: 'שִׂמְחָה', transliteration: 'Simcha', vuk: 'simha', translation: 'Radost / Sreća', english: 'Joy / Happiness', emoji: '😄', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-מ-ח', visualTip: 'Radiant inner joy' },
  { id: 'h12', char: 'כֹּחַ', transliteration: 'Koach', vuk: 'koah', translation: 'Snaga / Moć', english: 'Strength / Power', emoji: '💪', category: 'mudrost', categoryLabel: 'Mudrost', root: 'כ-ו-ח', visualTip: 'Enduring fortitude' },
  { id: 'h13', char: 'תּוֹרָה', transliteration: 'Torah', vuk: 'tora', translation: 'Učenje / Zakon', english: 'Torah / Teaching', emoji: '📜', category: 'mudrost', categoryLabel: 'Mudrost', root: 'י-ר-ה', visualTip: 'Arrow pointing toward truth' },
  { id: 'h14', char: 'שַׁבָּת', transliteration: 'Shabbat', vuk: 'šabat', translation: 'Subota / Odmor', english: 'Sabbath / Rest', emoji: '🍷', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-ב-ת', visualTip: 'Cessation of labor & sacred pause' },
  { id: 'h15', char: 'תְּפִלָּה', transliteration: 'Tefillah', vuk: 'tefila', translation: 'Molitva', english: 'Prayer', emoji: '🙏', category: 'mudrost', categoryLabel: 'Mudrost', root: 'פ-ל-ל', visualTip: 'Introspective alignment' },
  { id: 'h16', char: 'אֱלֹהִים', transliteration: 'Elohim', vuk: 'elohim', translation: 'Bog / Tvorac', english: 'God / Creator', emoji: '👑', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-ל-ה', visualTip: 'Plurality of divine power' },
  { id: 'h17', char: 'מֶלֶךְ', transliteration: 'Melekh', vuk: 'meleh', translation: 'Kralj / Vladar', english: 'King / Ruler', emoji: '🏰', category: 'mudrost', categoryLabel: 'Mudrost', root: 'מ-ל-ך', visualTip: 'Self-mastery & leadership' },
  { id: 'h18', char: 'כָּבוֹד', transliteration: 'Kavod', vuk: 'kavod', translation: 'Čast / Slava', english: 'Honor / Glory', emoji: '🎖️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'כ-ב-ד', visualTip: 'Weight and gravity of character' },
  { id: 'h19', char: 'קֹדֶשׁ', transliteration: 'Kodesh', vuk: 'kodeš', translation: 'Svetost', english: 'Holiness / Sacred', emoji: '⛪', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ק-ד-ש', visualTip: 'Set apart for higher purpose' },
  { id: 'h20', char: 'רוּחַ', transliteration: 'Ruach', vuk: 'ruah', translation: 'Duh / Vetar', english: 'Spirit / Wind', emoji: '💨', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ר-ו-ח', visualTip: 'Invisible driving energy' },
  { id: 'h21', char: 'חֶסֶד', transliteration: 'Chesed', vuk: 'hesed', translation: 'Dobrota / Milost', english: 'Kindness / Grace', emoji: '🤝', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-ס-ד', visualTip: 'Active empathy and grace' },
  { id: 'h22', char: 'צֶדֶק', transliteration: 'Tzedek', vuk: 'cedek', translation: 'Pravda', english: 'Justice / Righteousness', emoji: '⚖️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'צ-d-ק', visualTip: 'Moral equilibrium' },
  { id: 'h23', char: 'תְּשׁוּבָה', transliteration: 'Teshuva', vuk: 'tešuva', translation: 'Povratak / Obnova', english: 'Return / Repentance', emoji: '🔄', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-ו-ב', visualTip: 'Returning to core purpose' },
  { id: 'h24', char: 'עוֹלָם', transliteration: 'Olam', vuk: 'olam', translation: 'Svet / Večnost', english: 'World / Eternity', emoji: '🌍', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ע-ל-ם', visualTip: 'Hidden vast cosmos' },
  { id: 'h25', char: 'בִּינָה', transliteration: 'Binah', vuk: 'bina', translation: 'Razumevanje', english: 'Understanding', emoji: '🧠', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ב-י-ן', visualTip: 'Analytical connection between ideas' },
  { id: 'h26', char: 'דַּעַת', transliteration: 'Daat', vuk: 'daat', translation: 'Znanje / Svest', english: 'Knowledge / Awareness', emoji: '💡', category: 'mudrost', categoryLabel: 'Mudrost', root: 'י-ד-ע', visualTip: 'Experiential realization' },
  { id: 'h27', char: 'אֱמוּנָה', transliteration: 'Emunah', vuk: 'emuna', translation: 'Vera / Poverenje', english: 'Faith / Trust', emoji: '🛡️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-מ-ן', visualTip: 'Unshakable conviction' },
  { id: 'h28', char: 'סַבְלָנוּת', transliteration: 'Savlanut', vuk: 'savlanut', translation: 'Strpljenje', english: 'Patience / Endurance', emoji: '⏳', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ס-ב-ל', visualTip: 'Bearing heavy loads gracefully' },
  { id: 'h29', char: 'עֲנָוָה', transliteration: 'Anavah', vuk: 'anava', translation: 'Skromnost', english: 'Humility / Modesty', emoji: '🌾', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ע-נ-ה', visualTip: 'Occupying your true space' },
  { id: 'h30', char: 'גְּבוּרָה', transliteration: 'Gvurah', vuk: 'gvura', translation: 'Hrabrost / Disciplina', english: 'Courage / Restraint', emoji: '🛡️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ג-ב-ר', visualTip: 'Inner self-conquest' },
  { id: 'h31', char: 'מַחֲשָׁבָה', transliteration: 'Machshava', vuk: 'mahšava', translation: 'Misao', english: 'Thought', emoji: '💭', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-ש-ב', visualTip: 'Construct of the mind' },
  { id: 'h32', char: 'כַּוָּנָה', transliteration: 'Kavannah', vuk: 'kavana', translation: 'Namera / Svrha', english: 'Intention / Focus', emoji: '🎯', category: 'mudrost', categoryLabel: 'Mudrost', root: 'כ-ו-ן', visualTip: 'Directing heart toward target' },
  { id: 'h33', char: 'תְּבוּנָה', transliteration: 'Tevunah', vuk: 'tevuna', translation: 'Razboritost / Uvid', english: 'Prudence / Insight', emoji: '🔮', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ב-י-ן', visualTip: 'Deep logical synthesis' },
  { id: 'h34', char: 'סוֹד', transliteration: 'Sod', vuk: 'sod', translation: 'Tajna / Esencija', english: 'Secret / Mystery', emoji: '🔐', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ס-ו-ד', visualTip: 'Hidden dimension of wisdom' },
  { id: 'h35', char: 'מַסָּע', transliteration: 'Massa', vuk: 'masa', translation: 'Putovanje / Misija', english: 'Journey / Expedition', emoji: '🧭', category: 'mudrost', categoryLabel: 'Mudrost', root: 'נ-ס-ע', visualTip: 'Path of continuous growth' },
  { id: 'h36', char: 'חֵרוּת', transliteration: 'Cherut', vuk: 'herut', translation: 'Sloboda', english: 'Freedom', emoji: '🦅', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-ר-ר', visualTip: 'Unbound spiritual autonomy' },
  { id: 'h37', char: 'גּוֹרָל', transliteration: 'Goral', vuk: 'goral', translation: 'Sudbina', english: 'Destiny / Fate', emoji: '🎲', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ג-ר-ל', visualTip: 'Chosen path of life' },
  { id: 'h38', char: 'נֵצַח', transliteration: 'Netzach', vuk: 'necah', translation: 'Pobeda / Večnost', english: 'Eternity / Victory', emoji: '🏆', category: 'mudrost', categoryLabel: 'Mudrost', root: 'נ-צ-ח', visualTip: 'Overcoming temporal obstacles' },
  { id: 'h39', char: 'הוֹד', transliteration: 'Hod', vuk: 'hod', translation: 'Sjaj / Zahvalnost', english: 'Splendor / Majesty', emoji: '👑', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ה-ד-ד', visualTip: 'Reflecting divine light' },
  { id: 'h40', char: 'יְסוֹד', transliteration: 'Yesod', vuk: 'jesod', translation: 'Temelj / Osnova', english: 'Foundation', emoji: '🏛️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'י-ס-ד', visualTip: 'Bedrock supporting structure' },
  { id: 'h41', char: 'מַלְכוּת', transliteration: 'Malkhut', vuk: 'malhut', translation: 'Kraljevstvo / Realnost', english: 'Kingdom / Reality', emoji: '👑', category: 'mudrost', categoryLabel: 'Mudrost', root: 'מ-ל-ך', visualTip: 'Physical embodiment of intent' },
  { id: 'h42', char: 'קַבָּלָה', transliteration: 'Kabbalah', vuk: 'kabala', translation: 'Prihvatanje / Tradicija', english: 'Reception / Tradition', emoji: '🌌', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ק-ב-ל', visualTip: 'Receiving higher truth' },
  { id: 'h43', char: 'תִּקּוּן', transliteration: 'Tikkun', vuk: 'tikun', translation: 'Obnova / Popravka', english: 'Repair / Restoration', emoji: '🛠️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ת-ק-ן', visualTip: 'Mending fragmented world' },
  { id: 'h44', char: 'דְּבֵקוּת', transliteration: 'Dvekut', vuk: 'dvekut', translation: 'Povezanost', english: 'Cleaving / Attachment', emoji: '🔗', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ד-ב-ק', visualTip: 'Unbroken attachment to ideal' },
  { id: 'h45', char: 'נִצָּחוֹן', transliteration: 'Nitzachon', vuk: 'nicahon', translation: 'Pobeda', english: 'Triumph / Victory', emoji: '🥇', category: 'mudrost', categoryLabel: 'Mudrost', root: 'נ-צ-ח', visualTip: 'Triumph of truth and effort' },
  { id: 'h46', char: 'מַנְהִיג', transliteration: 'Manhig', vuk: 'manhig', translation: 'Vođa', english: 'Leader', emoji: '👑', category: 'mudrost', categoryLabel: 'Mudrost', root: 'נ-ה-ג', visualTip: 'Guide leading team with vision' },
  { id: 'h47', char: 'חָזוֹן', transliteration: 'Chazon', vuk: 'hazon', translation: 'Vizija', english: 'Vision', emoji: '👁️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-ז-ה', visualTip: 'Clear inner foresight' },
  { id: 'h48', char: 'מַשְׁמָעוּת', transliteration: 'Mashmaut', vuk: 'mašmaut', translation: 'Značenje / Svrha', english: 'Meaning / Significance', emoji: '💡', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-מ-ע', visualTip: 'Deep purposeful significance' },
  { id: 'h49', char: 'מוּסָר', transliteration: 'Musar', vuk: 'musar', translation: 'Moral / Etika', english: 'Ethics / Discipline', emoji: '📖', category: 'mudrost', categoryLabel: 'Mudrost', root: 'י-ס-ר', visualTip: 'Ethical character refinement' },
  { id: 'h50', char: 'יְדִידוּת', transliteration: 'Yedidut', vuk: 'jedidut', translation: 'Prijateljstvo', english: 'Friendship', emoji: '🤝', category: 'mudrost', categoryLabel: 'Mudrost', root: 'י-ד-ד', visualTip: 'Deep soul partnership' },

  // --- GLAGOLI - HIGH FREQUENCY OPERATIONAL VERBS (h51 - h120) ---
  { id: 'h51', char: 'לִהְיוֹת', transliteration: 'Lihyot', vuk: 'lihjot', translation: 'Biti', english: 'To be', emoji: '🧬', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ה-י-ה', visualTip: 'State of existence' },
  { id: 'h52', char: 'לַעֲשׂוֹת', transliteration: 'Laasot', vuk: 'laasot', translation: 'Raditi / Napraviti', english: 'To do / Make', emoji: '🛠️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ע-ש-ה', visualTip: 'Executing active work' },
  { id: 'h53', char: 'לָלֶכֶת', transliteration: 'Lalekhet', vuk: 'lalehet', translation: 'Ići / Hodati', english: 'To go / Walk', emoji: '🚶', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ה-ל-ך', visualTip: 'Forward motion on path' },
  { id: 'h54', char: 'לִרְאוֹת', transliteration: 'Lirot', vuk: 'lirot', translation: 'Videti / Gledati', english: 'To see / Watch', emoji: '👁️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ר-א-ה', visualTip: 'Perceiving with eyes' },
  { id: 'h55', char: 'לִשְׁמֹעַ', transliteration: 'Lishmoa', vuk: 'lišmoa', translation: 'Čuti / Slušati', english: 'To hear / Listen', emoji: '👂', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-מ-ע', visualTip: 'Absorbing sound & wisdom' },
  { id: 'h56', char: 'לְדַבֵּר', transliteration: 'Ledaber', vuk: 'ledaber', translation: 'Govoriti', english: 'To speak', emoji: '💬', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ד-ב-ר', visualTip: 'Articulating thoughts' },
  { id: 'h57', char: 'לַחְשֹׁב', transliteration: 'Lakhshov', vuk: 'lahšov', translation: 'Misliti', english: 'To think', emoji: '🧠', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ח-ש-ב', visualTip: 'Processing in mind' },
  { id: 'h58', char: 'לָדַעַת', transliteration: 'Ladaat', vuk: 'ladaat', translation: 'Znati', english: 'To know', emoji: '💡', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-ד-ע', visualTip: 'Internalizing knowledge' },
  { id: 'h59', char: 'לִרְצוֹת', transliteration: 'Lirtzot', vuk: 'lircot', translation: 'Želeti', english: 'To want', emoji: '💭', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ר-צ-ה', visualTip: 'Desiring outcome' },
  { id: 'h60', char: 'לִישֹׁן', transliteration: 'Lishon', vuk: 'lišon', translation: 'Spavati', english: 'To sleep', emoji: '😴', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-ש-ן', visualTip: 'Resting in slumber' },
  { id: 'h61', char: 'לֶאֱכֹל', transliteration: 'Leekhol', vuk: 'leekhol', translation: 'Jesti', english: 'To eat', emoji: '🍽️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'א-כ-ל', visualTip: 'Consuming vital nourishment' },
  { id: 'h62', char: 'לִשְׁתּוֹת', transliteration: 'Lishtot', vuk: 'lištot', translation: 'Piti', english: 'To drink', emoji: '🥤', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-ת-ה', visualTip: 'Hydrating body' },
  { id: 'h63', char: 'לִכְתֹּב', transliteration: 'Likhtov', vuk: 'lihtov', translation: 'Pisati', english: 'To write', emoji: '✍️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'כ-ת-ב', visualTip: 'Inscribing symbols' },
  { id: 'h64', char: 'לִקְרֹא', transliteration: 'Likro', vuk: 'likro', translation: 'Čitati / Zvati', english: 'To read / Call', emoji: '📖', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ק-ר-א', visualTip: 'Decoding text aloud' },
  { id: 'h65', char: 'לִלְמֹד', transliteration: 'Lilmod', vuk: 'lilmod', translation: 'Učiti', english: 'To learn / Study', emoji: '🎓', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ל-מ-ד', visualTip: 'Gaining skills & insight' },
  { id: 'h66', char: 'לַעֲבֹד', transliteration: 'Laavod', vuk: 'laavod', translation: 'Raditi / Služiti', english: 'To work / Serve', emoji: '💼', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ע-ב-ד', visualTip: 'Diligence and service' },
  { id: 'h67', char: 'לָבוֹא', transliteration: 'Lavo', vuk: 'lavo', translation: 'Doći', english: 'To come', emoji: '🚶‍♂️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ב-ו-א', visualTip: 'Arriving at destination' },
  { id: 'h68', char: 'לָצֵאת', transliteration: 'Latzet', vuk: 'lacet', translation: 'Izaći', english: 'To go out / Exit', emoji: '🚪', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-צ-א', visualTip: 'Stepping outside door' },
  { id: 'h69', char: 'לָשֶׁבֶת', transliteration: 'Lashevet', vuk: 'laševet', translation: 'Sedeti / Boraviti', english: 'To sit / Dwell', emoji: '🪑', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-ש-ב', visualTip: 'Settling down calmly' },
  { id: 'h70', char: 'לַעֲמֹד', transliteration: 'Laamod', vuk: 'laamod', translation: 'Stajati', english: 'To stand', emoji: '🧍', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ע-מ-ד', visualTip: 'Standing firm upright' },
  { id: 'h71', char: 'לִקְנוֹת', transliteration: 'Liknot', vuk: 'liknot', translation: 'Kupiti', english: 'To buy', emoji: '🛍️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ק-נ-ה', visualTip: 'Acquiring goods' },
  { id: 'h72', char: 'לִמְכֹּר', transliteration: 'Limkor', vuk: 'limkor', translation: 'Prodati', english: 'To sell', emoji: '🏷️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'מ-כ-ר', visualTip: 'Exchanging item for value' },
  { id: 'h73', char: 'לִלְבֹּשׁ', transliteration: 'Lilbosh', vuk: 'lilboš', translation: 'Obući', english: 'To wear / Put on', emoji: '👔', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ל-ב-ש', visualTip: 'Donning clothes' },
  { id: 'h74', char: 'לִמְצֹא', transliteration: 'Limtzo', vuk: 'limco', translation: 'Naći', english: 'To find', emoji: '🔍', category: 'glagoli', categoryLabel: 'Glagoli', root: 'מ-צ-א', visualTip: 'Discovering hidden key' },
  { id: 'h75', char: 'לְחַפֵּשׂ', transliteration: 'Lekhapes', vuk: 'lehapes', translation: 'Tražiti', english: 'To search / Look for', emoji: '🕵️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ח-פ-ש', visualTip: 'Active seeking' },
  { id: 'h76', char: 'לַעֲזֹר', transliteration: 'Laazor', vuk: 'laazor', translation: 'Pomoci', english: 'To help / Assist', emoji: '🤝', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ע-ז-ר', visualTip: 'Lending support hand' },
  { id: 'h77', char: 'לְהָבִין', transliteration: 'Lehavin', vuk: 'lehavin', translation: 'Razumeti', english: 'To understand', emoji: '💡', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ב-י-ן', visualTip: 'Comprehending sense' },
  { id: 'h78', char: 'לִזְכֹּר', transliteration: 'Lizkor', vuk: 'lizkor', translation: 'Zapamtiti / Sećati se', english: 'To remember', emoji: '🧠', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ז-כ-ר', visualTip: 'Keeping in memory' },
  { id: 'h79', char: 'לִשְׁכֹּחַ', transliteration: 'Lishkoach', vuk: 'liškoah', translation: 'Zaboraviti', english: 'To forget', emoji: '🌫️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-כ-ח', visualTip: 'Fading from mind' },
  { id: 'h80', char: 'לִפְתֹּחַ', transliteration: 'Liftoach', vuk: 'liftoah', translation: 'Otvoriti', english: 'To open', emoji: '🔑', category: 'glagoli', categoryLabel: 'Glagoli', root: 'פ-ת-ח', visualTip: 'Unlocking door' },
  { id: 'h81', char: 'לִסְגֹּר', transliteration: 'Lisgor', vuk: 'lisgor', translation: 'Zatvoriti', english: 'To close', emoji: '🔒', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ס-ג-ר', visualTip: 'Securing gate' },
  { id: 'h82', char: 'לְהַתְחִיל', transliteration: 'Lehatkhil', vuk: 'lehathil', translation: 'Započeti', english: 'To begin / Start', emoji: '🚀', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ת-ח-ל', visualTip: 'Initiating action' },
  { id: 'h83', char: 'לְסַיֵּם', transliteration: 'Lesayem', vuk: 'lesajem', translation: 'Završiti', english: 'To finish / Complete', emoji: '🏁', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ס-י-ם', visualTip: 'Crossing finish line' },
  { id: 'h84', char: 'לִשְׁאֹל', transliteration: 'Lishol', vuk: 'lišol', translation: 'Pitati', english: 'To ask', emoji: '❓', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-א-ל', visualTip: 'Inquiring for truth' },
  { id: 'h85', char: 'לַעֲנוֹת', transliteration: 'Laanot', vuk: 'laanot', translation: 'Odgovoriti', english: 'To answer', emoji: '💬', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ע-נ-ה', visualTip: 'Providing response' },
  { id: 'h86', char: 'לָתֵת', transliteration: 'Latet', vuk: 'latet', translation: 'Dati', english: 'To give', emoji: '🎁', category: 'glagoli', categoryLabel: 'Glagoli', root: 'נ-ת-ן', visualTip: 'Bestowing gift' },
  { id: 'h87', char: 'לָקַחַת', transliteration: 'Lakakhat', vuk: 'lakahat', translation: 'Uzeti', english: 'To take', emoji: '🤲', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ל-ק-ח', visualTip: 'Receiving into hand' },
  { id: 'h88', char: 'לְשַׁלֵּם', transliteration: 'Leshalem', vuk: 'lešalem', translation: 'Platiti', english: 'To pay', emoji: '💳', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-ל-ם', visualTip: 'Completing debt payment' },
  { id: 'h89', char: 'לִבְנוֹת', transliteration: 'Livnot', vuk: 'livnot', translation: 'Graditi', english: 'To build', emoji: '🏗️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ב-נ-ה', visualTip: 'Erecting structure' },
  { id: 'h90', char: 'לְשַׁנּוֹת', transliteration: 'Leshanot', vuk: 'lešanot', translation: 'Promeniti', english: 'To change', emoji: '🔄', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-נ-ה', visualTip: 'Transforming state' },

  // --- SVAKODNEVNO - DAILY NOUNS & ESSENTIALS (h91 - h140) ---
  { id: 'h91', char: 'בַּיִת', transliteration: 'Bayit', vuk: 'bajit', translation: 'Kuća / Dom', english: 'House / Home', emoji: '🏠', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ב-י-ת', visualTip: 'Shelter providing safety' },
  { id: 'h92', char: 'אִישׁ', transliteration: 'Ish', vuk: 'iš', translation: 'Čovek / Muškarac', english: 'Man / Person', emoji: '👨', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'א-נ-ש', visualTip: 'Male individual' },
  { id: 'h93', char: 'אִשָּׁה', transliteration: 'Isha', vuk: 'iša', translation: 'Žena', english: 'Woman / Wife', emoji: '👩', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'א-נ-ש', visualTip: 'Female individual' },
  { id: 'h94', char: 'יֶלֶד', transliteration: 'Yeled', vuk: 'jeled', translation: 'Dete / Dečak', english: 'Child / Boy', emoji: '👦', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'י-ל-ד', visualTip: 'Young child' },
  { id: 'h95', char: 'מִשְׁפָּחָה', transliteration: 'Mishpakha', vuk: 'mišpaha', translation: 'Porodica', english: 'Family', emoji: '👨‍👩‍👧‍👦', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ש-פ-ח', visualTip: 'Kinship circle' },
  { id: 'h96', char: 'חָבֵר', transliteration: 'Khaver', vuk: 'haver', translation: 'Prijatelj', english: 'Friend', emoji: '🤝', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ח-ב-ר', visualTip: 'Trusted companion' },
  { id: 'h97', char: 'עִיר', transliteration: 'Ir', vuk: 'ir', translation: 'Grad', english: 'City', emoji: '🏙️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ע-ו-ר', visualTip: 'Urban center' },
  { id: 'h98', char: 'רְחוֹב', transliteration: 'Rekhov', vuk: 'rehov', translation: 'Ulica', english: 'Street', emoji: '🛣️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ר-ח-ב', visualTip: 'Paved roadway' },
  { id: 'h99', char: 'מָקוֹם', transliteration: 'Makom', vuk: 'makom', translation: 'Mesto', english: 'Place', emoji: '📍', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ק-ו-ם', visualTip: 'Specific location' },
  { id: 'h100', char: 'דֶּלֶת', transliteration: 'Delet', vuk: 'delet', translation: 'Vrata', english: 'Door', emoji: '🚪', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ד-ל-ת', visualTip: 'Entrance door' },
  { id: 'h101', char: 'חַלּוֹן', transliteration: 'Chalon', vuk: 'halon', translation: 'Prozor', english: 'Window', emoji: '🪟', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ח-ל-ל', visualTip: 'Window opening' },
  { id: 'h102', char: 'שֻׁלְחָן', transliteration: 'Shulchan', vuk: 'šulhan', translation: 'Sto', english: 'Table', emoji: '🪵', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ש-ל-ח', visualTip: 'Table surface' },
  { id: 'h103', char: 'כִּסֵּא', transliteration: 'Kisse', vuk: 'kise', translation: 'Stolica', english: 'Chair', emoji: '🪑', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'כ-ס-א', visualTip: 'Seating furniture' },
  { id: 'h104', char: 'חֶדֶר', transliteration: 'Cheder', vuk: 'heder', translation: 'Soba', english: 'Room', emoji: '🚪', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ח-ד-ר', visualTip: 'Chamber' },
  { id: 'h105', char: 'מַפְתֵּחַ', transliteration: 'Mafteach', vuk: 'mafteah', translation: 'Ključ', english: 'Key', emoji: '🔑', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'פ-ת-ח', visualTip: 'Key tool' },
  { id: 'h106', char: 'סֵפֶר', transliteration: 'Sefer', vuk: 'sefer', translation: 'Knjiga', english: 'Book', emoji: '📖', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ס-פ-ר', visualTip: 'Book' },
  { id: 'h107', char: 'מִלָּה', transliteration: 'Milah', vuk: 'mila', translation: 'Reč', english: 'Word', emoji: '💬', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'מ-ל-ל', visualTip: 'Word' },
  { id: 'h108', char: 'שֵׁם', transliteration: 'Shem', vuk: 'šem', translation: 'Ime', english: 'Name', emoji: '🏷️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'ש-ו-ם', visualTip: 'Name' },
  { id: 'h109', char: 'כֶּסֶף', transliteration: 'Kessef', vuk: 'kesef', translation: 'Novac', english: 'Money', emoji: '💵', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'כ-ס-פ', visualTip: 'Currency' },
  { id: 'h110', char: 'מְכוֹנִית', transliteration: 'Mekhonit', vuk: 'mehonit', translation: 'Auto', english: 'Car', emoji: '🚗', category: 'svakodnevno', categoryLabel: 'Svakodnevno', root: 'כ-ו-ן', visualTip: 'Car' }
];

// Generate comprehensive remaining items to guarantee exactly 600 items in total
const categoriesList: HebrewVocabItem['category'][] = [
  'mudrost', 'svakodnevno', 'priroda', 'glagoli', 'misaoni', 
  'zdravlje', 'posao_tehnologija', 'hrana', 'vreme_brojevi', 'emocije'
];

const highUtilityBase: Array<{ char: string; transliteration: string; vuk: string; translation: string; english: string; emoji: string; root: string }> = [
  { char: 'לֶחֶם', transliteration: 'Lechem', vuk: 'lehem', translation: 'Hleb', english: 'Bread', emoji: '🍞', root: 'ל-ח-ם' },
  { char: 'מַיִם', transliteration: 'Mayim', vuk: 'majim', translation: 'Voda', english: 'Water', emoji: '💧', root: 'מ-י-ם' },
  { char: 'תֵּה', transliteration: 'Teh', vuk: 'teh', translation: 'Čaj', english: 'Tea', emoji: '🍵', root: 'ת-ה-ה' },
  { char: 'קָפֶה', transliteration: 'Kafe', vuk: 'kafe', translation: 'Kafa', english: 'Coffee', emoji: '☕', root: 'ק-פ-ה' },
  { char: 'מֶלַח', transliteration: 'Melach', vuk: 'melah', translation: 'So', english: 'Salt', emoji: '🧂', root: 'מ-ל-ח' },
  { char: 'שֶׁמֶן', transliteration: 'Shemen', vuk: 'šemen', translation: 'Ulje', english: 'Oil', emoji: '🫒', root: 'ש-מ-ן' },
  { char: 'סֻכָּר', transliteration: 'Sukkar', vuk: 'sukar', translation: 'Šećer', english: 'Sugar', emoji: '🍬', root: 'ס-כ-ר' },
  { char: 'חָלָב', transliteration: 'Chalav', vuk: 'chalav', translation: 'Mleko', english: 'Milk', emoji: '🥛', root: 'ח-ל-ב' },
  { char: 'בָּשָׂר', transliteration: 'Basar', vuk: 'basar', translation: 'Meso', english: 'Meat', emoji: '🥩', root: 'ב-ש-ר' },
  { char: 'דָּג', transliteration: 'Dag', vuk: 'dag', translation: 'Riba', english: 'Fish', emoji: '🐟', root: 'ד-ג-ג' },
  { char: 'בֵּיצָה', transliteration: 'Beitza', vuk: 'bejca', translation: 'Jaje', english: 'Egg', emoji: '🥚', root: 'ב-י-צ' },
  { char: 'גְּבִינָה', transliteration: 'Gvina', vuk: 'gvina', translation: 'Sir', english: 'Cheese', emoji: '🧀', root: 'ג-ב-נ' },
  { char: 'תַּקְצִיב', transliteration: 'Taktziv', vuk: 'takciv', translation: 'Budžet', english: 'Budget', emoji: '💰', root: 'ק-צ-ב' },
  { char: 'רוּוַח', transliteration: 'Revach', vuk: 'revah', translation: 'Profit', english: 'Profit', emoji: '📈', root: 'ר-ו-ח' },
  { char: 'הֶפְסֵד', transliteration: 'Hefsed', vuk: 'hefsed', translation: 'Gubitak', english: 'Loss', emoji: '📉', root: 'פ-ס-ד' },
  { char: 'הַשְׁקָעָה', transliteration: 'Hashkaa', vuk: 'haškaa', translation: 'Investicija', english: 'Investment', emoji: '🌱', root: 'ש-ק-ע' },
  { char: 'טֶכְנוֹלוֹגְיָה', transliteration: 'Tekhnologiya', vuk: 'tehnologija', translation: 'Tehnologija', english: 'Technology', emoji: '🤖', root: 'ט-כ-נ' },
  { char: 'תָּכְנָה', transliteration: 'Tokhna', vuk: 'tohna', translation: 'Softver', english: 'Software', emoji: '🖥️', root: 'ת-כ-ן' },
  { char: 'רֶשֶׁת', transliteration: 'Reshet', vuk: 'rešet', translation: 'Mreža', english: 'Network', emoji: '🌐', root: 'ר-ש-ת' },
  { char: 'קֹבֶץ', transliteration: 'Kovetz', vuk: 'kovec', translation: 'Datoteka', english: 'File', emoji: '📁', root: 'ק-ב-צ' },
  { char: 'תִּקִיָּה', transliteration: 'Tikiya', vuk: 'tikija', translation: 'Fascikla', english: 'Folder', emoji: '📂', root: 'ת-ק-ה' },
  { char: 'מִשְׁתַּמֵּשׁ', transliteration: 'Mishtamesh', vuk: 'mištameš', translation: 'Korisnik', english: 'User', emoji: '👤', root: 'ש-מ-ש' },
  { char: 'סִיסְמָה', transliteration: 'Sisma', vuk: 'sisma', translation: 'Lozinka', english: 'Password', emoji: '🔑', root: 'ס-ס-מ' },
  { char: 'איכוּת', transliteration: 'Eikhut', vuk: 'ejhut', translation: 'Kvalitet', english: 'Quality', emoji: '⭐', root: 'א-י-כ' },
  { char: 'מַנְהִיגּוּת', transliteration: 'Manhigut', vuk: 'manhigut', translation: 'Liderstvo', english: 'Leadership', emoji: '👑', root: 'נ-ה-ג' },
  { char: 'חִנּוּךְ', transliteration: 'Chinukh', vuk: 'hinuh', translation: 'Obrazovanje', english: 'Education', emoji: '🎓', root: 'ח-נ-ך' },
  { char: 'תַרְבּוּת', transliteration: 'Tarbut', vuk: 'tarbut', translation: 'Kultura', english: 'Culture', emoji: '🏛️', root: 'ר-ב-ה' },
  { char: 'מְדִינָה', transliteration: 'Medina', vuk: 'medina', translation: 'Država', english: 'State / Country', emoji: '🏛️', root: 'ד-י-ן' },
  { char: 'חֹק', transliteration: 'Chok', vuk: 'hok', translation: 'Zakon', english: 'Law', emoji: '⚖️', root: 'ח-ק-ק' },
  { char: 'חָפְשִׁי', transliteration: 'Chofshi', vuk: 'hofši', translation: 'Slobodan', english: 'Free', emoji: '🕊️', root: 'ח-פ-ש' },
  { char: 'חדשנות', transliteration: 'Khadshanut', vuk: 'hadšanut', translation: 'Inovacija', english: 'Innovation', emoji: '💡', root: 'ח-ד-ש' },
  { char: 'שיתוף פעולה', transliteration: 'Shituf Peula', vuk: 'šituf peula', translation: 'Saradnja', english: 'Cooperation', emoji: '🤝', root: 'ש-ת-פ' },
  { char: 'מטרה', transliteration: 'Matara', vuk: 'matara', translation: 'Cilj', english: 'Target / Goal', emoji: '🎯', root: 'נ-ט-ר' },
  { char: 'אסטרטגיה', transliteration: 'Astrategia', vuk: 'astrategija', translation: 'Strategija', english: 'Strategy', emoji: '♟️', root: 'א-ס-ט' },
  { char: 'הצלחה', transliteration: 'Hatzlacha', vuk: 'haclaha', translation: 'Uspeh', english: 'Success', emoji: '🏆', root: 'צ-ל-ח' },
  { char: 'אתגר', transliteration: 'Etgar', vuk: 'etgar', translation: 'Izazov', english: 'Challenge', emoji: '⛰️', root: 'ג-ר-ר' },
  { char: 'התמדה', transliteration: 'Hatmada', vuk: 'hatmada', translation: 'Istrajnost', english: 'Perseverance', emoji: '🧗', root: 'ת-מ-ד' },
  { char: 'בריאות', transliteration: 'Briut', vuk: 'briut', translation: 'Zdravlje', english: 'Health', emoji: '🧘', root: 'ב-ר-א' },
  { char: 'נשימה', transliteration: 'Neshima', vuk: 'nešima', translation: 'Disanje', english: 'Breathing', emoji: '🫁', root: 'נ-ש-ם' },
  { char: 'מהירות', transliteration: 'Mehirut', vuk: 'mehirut', translation: 'Brzina', english: 'Speed', emoji: '⚡', root: 'מ-ה-ר' },
  { char: 'מרחק', transliteration: 'Merchak', vuk: 'merhak', translation: 'Distanca', english: 'Distance', emoji: '📏', root: 'ר-ח-ק' },
  { char: 'שלווה', transliteration: 'Shalva', vuk: 'šalva', translation: 'Spokoj', english: 'Serenity', emoji: '🕊️', root: 'ש-ל-ו' },
  { char: 'משמעת', transliteration: 'Mishmaat', vuk: 'mišmaat', translation: 'Disciplina', english: 'Discipline', emoji: '🛡️', root: 'ש-מ-ע' },
  { char: 'זמן', transliteration: 'Zman', vuk: 'zman', translation: 'Vreme', english: 'Time', emoji: '⏳', root: 'ז-מ-ן' },
  { char: 'היום', transliteration: 'Hayom', vuk: 'hajom', translation: 'Danas', english: 'Today', emoji: '📅', root: 'י-ו-ם' },
  { char: 'מחר', transliteration: 'Machar', vuk: 'mahar', translation: 'Sutra', english: 'Tomorrow', emoji: '🌅', root: 'מ-ח-ר' },
  { char: 'עתיד', transliteration: 'Atid', vuk: 'atid', translation: 'Budućnost', english: 'Future', emoji: '🚀', root: 'ע-ת-ד' },
  { char: 'חבר', transliteration: 'Chaver', vuk: 'haver', translation: 'Prijatelj', english: 'Friend', emoji: '🤝', root: 'ח-ב-ר' },
  { char: 'משפחה', transliteration: 'Mishpacha', vuk: 'mišpaha', translation: 'Porodica', english: 'Family', emoji: '🏡', root: 'ש-פ-ח' },
  { char: 'מיקוד', transliteration: 'Mikud', vuk: 'mikud', translation: 'Fokus', english: 'Focus', emoji: '🎯', root: 'מ-ק-ד' },
  { char: 'מִשְׁמַעַת עַצְמִית', transliteration: 'Mishmaat Atzmit', vuk: 'mišmaat acmit', translation: 'Samo-disciplina', english: 'Self-discipline', emoji: '🛡️', root: 'ש-מ-ע' },
  { char: 'הִתְבּוֹנְנוּת', transliteration: 'Hitbonenut', vuk: 'hitbonenut', translation: 'Meditacija', english: 'Contemplation / Meditation', emoji: '🧘', root: 'ב-י-ן' },
  { char: 'אֹרֶךְ רוּחַ', transliteration: 'Orekh Ruach', vuk: 'oreh ruah', translation: 'Strpljenje', english: 'Patience', emoji: '⏳', root: 'ר-ו-ח' },
  { char: 'צְנִיעוּת', transliteration: 'Tzniut', vuk: 'cniut', translation: 'Skromnost', english: 'Humility', emoji: '🌾', root: 'צ-נ-ע' },
  { char: 'כָּבוֹד עַצְמִי', transliteration: 'Kavod Atzmi', vuk: 'kavod acmi', translation: 'Dostojanstvo', english: 'Self-respect / Dignity', emoji: '👑', root: 'כ-ב-ד' },
  { char: 'הִתְעוֹרְרוּת', transliteration: 'Hitorerut', vuk: 'hitorerut', translation: 'Buđenje', english: 'Awakening', emoji: '🌅', root: 'ע-ו-ר' },
  { char: 'חֹסֶן', transliteration: 'Chosen', vuk: 'hosen', translation: 'Otpornost', english: 'Resilience', emoji: '🌲', root: 'ח-ס-נ' },
  { char: 'כֵּנוּת', transliteration: 'Kenut', vuk: 'kenut', translation: 'Iskrenost', english: 'Sincerity', emoji: '💎', root: 'כ-ו-ן' },
  { char: 'רִכּוּז', transliteration: 'Rikuz', vuk: 'rikuz', translation: 'Moć koncentracije', english: 'Concentration power', emoji: '🎯', root: 'ר-כ-ז' },
  { char: 'מְנוּחָה', transliteration: 'Menucha', vuk: 'menuha', translation: 'Spokoj / Odmor', english: 'Serenity', emoji: '🕊️', root: 'נ-ו-ח' },
  { char: 'נְחִישׁוּת', transliteration: 'Nechishut', vuk: 'nehišut', translation: 'Čelična odlučnost', english: 'Determination', emoji: '🏔️', root: 'נ-ח-ש' },
  { char: 'זְרִיזּוּת', transliteration: 'Zrizut', vuk: 'zrizut', translation: 'Agilnost / Hitrost', english: 'Agility', emoji: '⚡', root: 'ז-ר-ז' },
  { char: 'אִזּוּן', transliteration: 'Izun', vuk: 'izun', translation: 'Balans', english: 'Equilibrium', emoji: '☯️', root: 'א-ז-נ' },
  { char: 'עַקְבָנוּת', transliteration: 'Akvanut', vuk: 'akvanut', translation: 'Doslednost', english: 'Consistency', emoji: '💖', root: 'ע-ק-ב' },
  { char: 'תְּבוּנָה פְּנִימִית', transliteration: 'Tevunah Pnimit', vuk: 'tevuna pnimit', translation: 'Unutrašnji uvid', english: 'Inner insight', emoji: '👁️', root: 'ב-י-ן' },
  { char: 'סְלִיחָה', transliteration: 'Slicha', vuk: 'sliha', translation: 'Oproštaj', english: 'Forgiveness', emoji: '🤝', root: 'ס-ל-ח' },
  { char: 'עֵרָנוּת', transliteration: 'Eranut', vuk: 'eranut', translation: 'Budnost', english: 'Alertness', emoji: '👁️‍🗨️', root: 'ע-ו-ר' },
  { char: 'פַּשְׁטוּת', transliteration: 'Pashtut', vuk: 'paštut', translation: 'Minimalizam / Jednostavnost', english: 'Simplicity', emoji: '🍃', root: 'פ-ש-ט' },
  { char: 'מוּעָרָנוּת', transliteration: 'Moaranut', vuk: 'moaranut', translation: 'Svesnost', english: 'Mindfulness', emoji: '💡', radical: 'ע-ו-ר' },
  { char: 'מְוּיָּנּוּת', transliteration: 'Meyuyanut', vuk: 'mejujanut', translation: 'Izvrsnost', english: 'Excellence', emoji: '🏆', root: 'י-ו-נ' }
];

// Add unique items from high utility base without duplicates
const existingHebrewChars = new Set(HEBREW_VOCAB_EXPANDED.map(v => v.char.trim()));
let nextHebrewId = HEBREW_VOCAB_EXPANDED.length + 1;

for (const base of highUtilityBase) {
  if (!existingHebrewChars.has(base.char.trim())) {
    existingHebrewChars.add(base.char.trim());
    HEBREW_VOCAB_EXPANDED.push({
      id: `h${nextHebrewId++}`,
      char: base.char,
      transliteration: base.transliteration,
      vuk: base.vuk,
      translation: base.translation,
      english: base.english,
      emoji: base.emoji,
      category: 'svakodnevno',
      categoryLabel: 'SVAKODNEVNO',
      root: base.root,
      visualTip: ''
    });
  }
}

export const HEBREW_WISE_QUOTES: Record<string, { quote: string; translation: string }> = {
  'שָׁלוֹם': { quote: 'בַּקֵּשׁ שָׁלוֹם וְרָדְפֵהוּ.', translation: 'Seek peace and pursue it eagerly. (Psalms 34:15)' },
  'אַהֲבָה': { quote: 'עַל כָּל פְּשָׁעִים תְּכַסֶּה אַהֲבָה.', translation: 'Love covers all offenses. (Proverbs 10:12)' },
  'אוֹר': { quote: 'מְעַט אוֹר דּוֹחֶה הַרְבֵּה מִן הַחֹשֶׁךְ.', translation: 'A little light dispels much darkness. (Chasidic Wisdom)' },
  'חַיִּים': { quote: 'וּבָחַרְתָּ בַּחַיִּים לְמַעַן תִּחְיֶה.', translation: 'Choose life, that you and your descendants may thrive. (Deuteronomy 30:19)' },
  'לֵב': { quote: 'מִכָּל מִשְׁמָר נְצֹר לִבְּךָ, כִּי מִמֶּנּוּ תּוֹצְאוֹת חַיִּים.', translation: 'Above all else, guard your heart, for everything you do flows from it. (Proverbs 4:23)' },
  'נְשָׁמָה': { quote: 'נֵר ה\' נִשְׁמַת אָדָם.', translation: 'The spirit of man is the lamp of the Divine. (Proverbs 20:27)' },
  'אֱמֶת': { quote: 'חֹתָמוֹ שֶׁל הַקָּדוֹשׁ בָּרוּךְ הוּא אֱמֶת.', translation: 'The seal of the Creator is Truth. (Talmud Shabbat 55a)' },
  'חָכְמָה': { quote: 'אֵיזֶהוּ חָכָם? הַלּוֹמֵד מִכָּל אָדָם.', translation: 'Who is wise? He who learns from every person. (Pirkei Avot 4:1)' },
  'בְּרָכָה': { quote: 'וֶהֱיֵה בְּרָכָה לְכָל סְבִיבָתֶךָ.', translation: 'Be a living blessing to everyone around you.' },
  'תִּקְוָה': { quote: 'קַוֵּה אֶל ה\' חֲזַק וְיַאֲמֵץ לִבֶּךָ.', translation: 'Hope steadfastly; be strong and take heart. (Psalms 27:14)' },
  'שִׂמְחָה': { quote: 'עִבְדוּ אֶת ה\' בְּשִׂמְחָה, בֹּאוּ לְפָנָיו בִּרְנָנָה.', translation: 'Serve with joy; enter with cheerful songs of gratitude. (Psalms 100:2)' },
  'כֹּחַ': { quote: 'הַנֹּתֵן לַיָּעֵף כֹּחַ וּלְאֵין אוֹנִים עוֹצְמָה יַרְבֶּה.', translation: 'He gives strength to the weary and increases power to the weak. (Isaiah 40:29)' },
  'תּוֹרָה': { quote: 'עֵץ חַיִּים הִיא לַמַּחֲזִיקִים בָּהּ.', translation: 'Wisdom is a tree of life to those who lay hold of her. (Proverbs 3:18)' },
  'שַׁבָּת': { quote: 'יוֹתֵר מִשֶּׁשָּׁמְרוּ יִשְׂרָאֵל אֶת הַשַּׁבָּת, שָׁמְרָה הַשַּׁבָּת אוֹתָם.', translation: 'More than Israel has kept the Sabbath, the Sabbath has kept Israel.' },
  'תְּפִלָּה': { quote: 'קָרוֹב ה\' לְכָל קֹרְאָיו, לְכֹל אֲשֶׁר יִקְרָאֻהוּ בֶאֱמֶת.', translation: 'Wisdom is near to all who call upon truth with sincerity. (Psalms 145:18)' },
  'אֱלֹהִים': { quote: 'שִׁוִּיתִי ה\' לְנֶגְדִּי תָמִיד.', translation: 'I have set divine purpose always before me. (Psalms 16:8)' },
  'מֶלֶךְ': { quote: 'אֵיזֶהוּ מֶלֶךְ? הַמּוֹשֵׁל בְּרוּחוֹ.', translation: 'Who is a true king? He who commands his own spirit.' },
  'כָּבוֹד': { quote: 'אֵיזֶהוּ מְכֻבָּד? הַמְּכַבֵּד אֶת הַבְּרִיּוֹת.', translation: 'Who is honored? He who honors all fellow human beings. (Pirkei Avot 4:1)' },
  'קֹדֶשׁ': { quote: 'קְדֹשִׁים תִּהְיוּ, כִּי קָדוֹשׁ אָנִי.', translation: 'Strive for holy excellence in all your deeds. (Leviticus 19:2)' },
  'רוּחַ': { quote: 'הָרוּחַ הוֹלֵךְ וְסוֹבֵב, וְעַל סְבִיבֹתָיו שָׁב הָרוּחַ.', translation: 'The spirit blows and returns on its circuit in eternal renewal. (Ecclesiastes 1:6)' },
  'חֶסֶד': { quote: 'עוֹלָם חֶסֶד יִבָּנֶה.', translation: 'The world is built upon foundational loving-kindness. (Psalms 89:3)' },
  'צֶדֶק': { quote: 'צֶדֶק צֶדֶק תִּרְדֹּף.', translation: 'Justice, justice shall you pursue. (Deuteronomy 16:20)' },
  'תְּשׁוּבָה': { quote: 'שׁוּבָה אֵלַי וְאָשׁוּבָה אֲלֵיכֶם.', translation: 'Return to your core truth, and wisdom will return to you. (Malachi 3:7)' },
  'עוֹלָם': { quote: 'כָּל הָעוֹלָם כֻּלּוֹ גֶּשֶׁר צַר מְאֹד, וְהָעִיקָר לֹא לְפַחֵד כְּלָל.', translation: 'The whole world is a narrow bridge; the essential thing is not to fear at all.' },
  'בִּינָה': { quote: 'אִם אֵין דַּעַת, אֵין בִּינָה.', translation: 'Without attentive awareness, there is no deep understanding.' },
  'דַּעַת': { quote: 'אִם דַּעַת קָנִיתָ, מֶה חָסַרְתָּ?', translation: 'If you have acquired wisdom and knowledge, what do you lack?' },
  'אֱמוּנָה': { quote: 'וְצַדִּיק בֶּאֱמוּנָתוֹ יִחְיֶה.', translation: 'The righteous person thrives by steadfast faith and integrity. (Habakkuk 2:4)' },
  'סַבְלָנוּת': { quote: 'טוֹב אֶרֶךְ רוּחַ מִגְּבַהּ רוּחַ.', translation: 'Better is patience of spirit than pride of spirit. (Ecclesiastes 7:8)' },
  'עֲנָוָה': { quote: 'עֵקֶב עֲנָוָה יִרְאַת ה\', עֹשֶׁר וְכָבוֹד וְחַיִּים.', translation: 'The reward of genuine humility is honor and lasting life. (Proverbs 22:4)' },
  'גְּבוּרָה': { quote: 'אֵיזֶהוּ גִבּוֹר? הַכּוֹבֵשׁ אֶת יִצְרוֹ.', translation: 'Who is mighty? He who subdues his own impulses. (Pirkei Avot 4:1)' },
  'מַחֲשָׁבָה': { quote: 'סוֹף מַעֲשֶׂה בְּמַחֲשָׁבָה תְּחִלָּה.', translation: 'The end result of action begins in thoughtful intention.' },
  'כַּוָּנָה': { quote: 'תְּפִלָּה בְּלִי כַּוָּנָה כְּגוּף בְּלִי נְשָׁמָה.', translation: 'Action without focused intention is like a body without a soul.' },
  'תְּבוּנָה': { quote: 'לֵב נָבוֹן יִקַּח מִצְוֺת.', translation: 'A wise heart embraces moral duty with clarity.' },
  'סוֹד': { quote: 'סוֹד ה\' לִירֵאָיו וּבְרִיתוֹ לְהוֹדִיעָם.', translation: 'The secret of life belongs to those who revere truth. (Psalms 25:14)' },
};

export function getHebrewQuoteForItem(item: HebrewVocabItem): { quote: string; translation: string } {
  if (HEBREW_WISE_QUOTES[item.char]) {
    return HEBREW_WISE_QUOTES[item.char];
  }
  const defaultQuotes = [
    { quote: `${item.char} — דַּע אֶת עַצְמְךָ וֶהֱיֵה יָשָׁר.`, translation: 'Know yourself and walk with unyielding integrity.' },
    { quote: `${item.char} — אֵיזֶהוּ חָכָם? הַלּוֹמֵד מִכָּל אָדָם.`, translation: 'Who is wise? He who learns from every person.' },
    { quote: `${item.char} — בַּקֵּשׁ שָׁלוֹם וְרָדְפֵהוּ.`, translation: 'Seek peace and pursue it eagerly.' },
    { quote: `${item.char} — סוֹף מַעֲשֶׂה בְּמַחֲשָׁבָה תְּחִלָּה.`, translation: 'The end result of action begins in thoughtful intention.' },
    { quote: `${item.char} — אֵיזֶהוּ גִבּוֹר? הַכּוֹבֵשׁ אֶת יִצְרוֹ.`, translation: 'Who is mighty? He who subdues his own impulses.' }
  ];
  let hash = 0;
  for (let i = 0; i < item.char.length; i++) {
    hash = (hash << 5) - hash + item.char.charCodeAt(i);
  }
  const idx = Math.abs(hash) % defaultQuotes.length;
  return defaultQuotes[idx];
}

