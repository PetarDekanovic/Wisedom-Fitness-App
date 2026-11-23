export type HebrewProverbType = 'talmud' | 'biblical' | 'idiom' | 'hasidic' | 'proverb';

export interface HebrewProverbEntry {
  id: string;
  hebrew: string;
  transliteration: string;
  vuk: string;
  serbian: string;
  english: string;
  source: string;
  type: HebrewProverbType;
  literalNote?: string;
  keywords: string[]; // Hebrew words (with or without nikud), roots, or themes for smart matching
}

export function stripNikud(text: string): string {
  return text.replace(/[\u0591-\u05C7]/g, '').trim();
}

export const HEBREW_PROVERBS_AND_IDIOMS: HebrewProverbEntry[] = [
  // =========================================================================
  // 1. TALMUD & PIRKEI AVOT (Ethics of the Fathers — 35 Classics)
  // =========================================================================
  {
    id: 'hp-1',
    hebrew: 'אֵיזֶהוּ חָכָם? הַלּוֹמֵד מִכָּל אָדָם.',
    transliteration: 'Eizehu chacham? Halomed mikol adam.',
    vuk: 'ejzehu haham? halomed mikol adam.',
    serbian: 'Ko je mudar? Onaj ko uči od svakog čoveka.',
    english: 'Who is wise? One who learns from every person.',
    source: 'Pirkei Avot 4:1',
    type: 'talmud',
    keywords: ['חכמה', 'חכם', 'ללמד', 'אדם', 'לדעת', 'דעת', 'מורה', 'תלמיד', 'ח-כ-ם', 'ל-מ-ד']
  },
  {
    id: 'hp-2',
    hebrew: 'אֵיזֶהוּ גִבּוֹר? הַכּוֹבֵשׁ אֶת יִצְרוֹ.',
    transliteration: 'Eizehu gibor? Hakovesh et yitzro.',
    vuk: 'ejzehu gibor? hakoveš et jicro.',
    serbian: 'Ko je snažan junak? Onaj ko savlada sopstvene nagone.',
    english: 'Who is mighty? One who subdues his own impulses.',
    source: 'Pirkei Avot 4:1',
    type: 'talmud',
    keywords: ['גבורה', 'גבור', 'כח', 'אמץ', 'משמעת', 'שליטה', 'חזק', 'ג-ב-ר']
  },
  {
    id: 'hp-3',
    hebrew: 'אֵיזֶהוּ עָשִׁיר? הַשָּׂמֵחַ בְּחֶלְקוֹ.',
    transliteration: 'Eizehu ashir? Hasameach bechelko.',
    vuk: 'ejzehu ašir? hasameah behelko.',
    serbian: 'Ko je bogat? Onaj ko je radostan i zadovoljan onim što ima.',
    english: 'Who is rich? One who rejoices in his portion.',
    source: 'Pirkei Avot 4:1',
    type: 'talmud',
    keywords: ['עשיר', 'שמח', 'שמחה', 'כסף', 'אושר', 'ברכה', 'ש-מ-ח', 'ע-ש-ר']
  },
  {
    id: 'hp-4',
    hebrew: 'אֵיזֶהוּ מְכֻבָּד? הַמְּכַבֵּד אֶת הַבְּרִיּוֹת.',
    transliteration: 'Eizehu mechubad? Hamechabed et habriyot.',
    vuk: 'ejzehu mehubad? hamehabed et habrijot.',
    serbian: 'Ko je dostojan časti? Onaj ko poštuje sva bića.',
    english: 'Who is honored? One who honors all fellow creatures.',
    source: 'Pirkei Avot 4:1',
    type: 'talmud',
    keywords: ['כבוד', 'מכבד', 'אדם', 'חבר', 'ידידות', 'כ-ב-ד']
  },
  {
    id: 'hp-5',
    hebrew: 'אִם אֵין אֲנִי לִי, מִי לִי? וּכְשֶׁאֲנִי לְעַצְמִי, מָה אֲנִי? וְאִם לֹא עַכְשָׁו, אֵימָתָי?',
    transliteration: 'Im ein ani li, mi li? Uchesheani leatzmi, ma ani? Veim lo achshav, eimatai?',
    vuk: 'im ejn ani li, mi li? uhešeani leacmi, ma ani? veim lo ahšav, ejmataj?',
    serbian: 'Ako ja nisam za sebe, ko će biti za mene? Ako sam samo za sebe, šta sam? I ako ne sada, kada?',
    english: 'If I am not for myself, who will be for me? Being only for myself, what am I? And if not now, when?',
    source: 'Hillel Stariji — Pirkei Avot 1:14',
    type: 'talmud',
    keywords: ['אני', 'עכשיו', 'זמן', 'מתי', 'היום', 'אחריות', 'עצמי', 'התחלה']
  },
  {
    id: 'hp-6',
    hebrew: 'לֹא עָלֶיךָ הַמְּלָאכָה לִגְמֹר, וְלֹא אַתָּה בֶן חוֹרִין לִבָּטֵל מִמֶּנָּה.',
    transliteration: 'Lo alecha hamelacha ligmor, velo ata ben chorin libatel mimena.',
    vuk: 'lo aleha hamelaha ligmor, velo ata ben horin libatel mimena.',
    serbian: 'Nije na tebi da završiš ceo posao, ali nisi ni slobodan da od njega odustaneš.',
    english: 'It is not your duty to finish the work, yet neither are you free to desist from it.',
    source: 'Rabi Tarfon — Pirkei Avot 2:16',
    type: 'talmud',
    keywords: ['עבודה', 'לעבוד', 'לסיים', 'להתחיל', 'חרות', 'התמדה', 'מטרה', 'אתגר']
  },
  {
    id: 'hp-7',
    hebrew: 'אֱמֹר מְעַט וַעֲשֵׂה הַרְבֵּה.',
    transliteration: 'Emor meat vaaseh harbeh.',
    vuk: 'emor meat vaase harbe.',
    serbian: 'Govori malo, a čini mnogo.',
    english: 'Say little and do much.',
    source: 'Šamaj — Pirkei Avot 1:15',
    type: 'talmud',
    keywords: ['לעשות', 'עשה', 'לדבר', 'אמר', 'מילה', 'מעשה', 'הרבה', 'מעט']
  },
  {
    id: 'hp-8',
    hebrew: 'בְּמָקוֹם שֶׁאֵין אֲנָשִׁים, הִשְׁתַּדֵּל לִהְיוֹת אִישׁ.',
    transliteration: 'Bemakom sheein anashim, hishtadel lihyot ish.',
    vuk: 'bemakom šeejn anašim, hištadel lihjot iš.',
    serbian: 'Na mestu gde nema ljudi, potrudi se da ti budeš čovek.',
    english: 'In a place where there are no worthy people, strive to be a true human being.',
    source: 'Hillel — Pirkei Avot 2:5',
    type: 'talmud',
    keywords: ['מקום', 'איש', 'אדם', 'להיות', 'מנהיג', 'מנהיגות', 'מוסר']
  },
  {
    id: 'hp-9',
    hebrew: 'אַל תָּדִין אֶת חֲבֵרְךָ עַד שֶׁתַּגִּיעַ לִמְקוֹמוֹ.',
    transliteration: 'Al tadin et chavercha ad shetagia limkomo.',
    vuk: 'al tadin et haverha ad šetagia limkomo.',
    serbian: 'Ne sudi svom bližnjem dok ne dođeš na njegovo mesto.',
    english: 'Do not judge your fellow until you have stood in his place.',
    source: 'Pirkei Avot 2:4',
    type: 'talmud',
    keywords: ['חבר', 'חברה', 'מקום', 'צדק', 'חמלה', 'סליחה', 'להבין']
  },
  {
    id: 'hp-10',
    hebrew: 'אִם אֵין קֶמַח אֵין תּוֹרָה, אִם אֵין תּוֹרָה אֵין קֶמַח.',
    transliteration: 'Im ein kemach ein Torah, im ein Torah ein kemach.',
    vuk: 'im ejn kemah ejn tora, im ejn tora ejn kemah.',
    serbian: 'Bez brašna (hleba) nema učenja, a bez učenja nema ni brašna.',
    english: 'Without sustenance there is no Torah; without Torah there is no sustenance.',
    source: 'Pirkei Avot 3:17',
    type: 'talmud',
    keywords: ['תורה', 'לחם', 'אוכל', 'עבודה', 'פרנסה', 'איזון', 'כסף']
  },
  {
    id: 'hp-11',
    hebrew: 'כָּל הַמְּקַיֵּם נֶפֶשׁ אַחַת, כְּאִלּוּ קִיֵּם עוֹלָם מָלֵא.',
    transliteration: 'Kol hamekayem nefesh achat, keilu kiyem olam male.',
    vuk: 'kol hamekajem nefeš ahat, keilu kijem olam male.',
    serbian: 'Ko spase jedan ljudski život, kao da je spasao čitav svet.',
    english: 'Whoever saves a single life, it is as if they saved an entire universe.',
    source: 'Talmud Sanhedrin 37a',
    type: 'talmud',
    keywords: ['עולם', 'נפש', 'נשמה', 'חיים', 'אחד', 'מלא', 'לעזור', 'רופא', 'בריאות']
  },
  {
    id: 'hp-12',
    hebrew: 'אֵין אָדָם לוֹמֵד תּוֹרָה אֶלָּא מִמָּקוֹם שֶׁלִּבּוֹ חָפֵץ.',
    transliteration: 'Ein adam lomed Torah ela mimakom shelibo chafetz.',
    vuk: 'ejn adam lomed tora ela mimakom šelibo hafec.',
    serbian: 'Čovek uistinu uči samo ono za čim njegovo srce žudi.',
    english: 'A person truly learns only what their heart desires.',
    source: 'Talmud Avodah Zarah 19a',
    type: 'talmud',
    keywords: ['לב', 'ללמד', 'לרצות', 'רצון', 'אהבה', 'ספר', 'תורה']
  },
  {
    id: 'hp-13',
    hebrew: 'סְיָג לַחָכְמָה שְׁתִיקָה.',
    transliteration: 'Seyag lachochmah shtikah.',
    vuk: 'sejag lahohma štika.',
    serbian: 'Ograda mudrosti je tišina.',
    english: 'Silence is a protective fence around wisdom.',
    source: 'Rabi Akiva — Pirkei Avot 3:13',
    type: 'talmud',
    keywords: ['שקט', 'חכמה', 'שתיקה', 'לשמע', 'זהירות', 'התבוננות']
  },
  {
    id: 'hp-14',
    hebrew: 'אַל תִּסְתַּכֵּל בַּקַּנְקַן, אֶלָּא בַּמֶּה שֶׁיֵּשׁ בּוֹ.',
    transliteration: 'Al tistakel bakankan, ela bameh sheyesh bo.',
    vuk: 'al tistakel bakankan, ela bame šejes bo.',
    serbian: 'Ne gledaj u krčag (spoljašnjost), već u ono što se nalazi u njemu.',
    english: 'Do not look at the vessel, but at what is inside it.',
    source: 'Rabi Meir — Pirkei Avot 4:20',
    type: 'talmud',
    keywords: ['לראות', 'ראה', 'מהות', 'יפה', 'יין', 'חדש', 'ישן', 'אמת']
  },
  {
    id: 'hp-15',
    hebrew: 'לְפוּם צַעֲרָא אַגְרָא.',
    transliteration: 'Lefum tzaara agra.',
    vuk: 'lefum caara agra.',
    serbian: 'Prema uloženom trudu i muci dolazi i nagrada.',
    english: 'According to the effort is the reward.',
    source: 'Ben He He — Pirkei Avot 5:23',
    type: 'talmud',
    keywords: ['הצלחה', 'אתגר', 'אימון', 'כח', 'התמדה', 'עבודה', 'משכורת', 'נחישות']
  },
  {
    id: 'hp-16',
    hebrew: 'עֲשֵׂה לְךָ רַב, וּקְנֵה לְךָ חָבֵר.',
    transliteration: 'Aseh lecha rav, ukneh lecha chaver.',
    vuk: 'ase leha rav, ukne leha haver.',
    serbian: 'Pronađi sebi učitelja i stekni sebi pravog prijatelja.',
    english: 'Appoint for yourself a mentor, and acquire for yourself a companion.',
    source: 'Pirkei Avot 1:6',
    type: 'talmud',
    keywords: ['חבר', 'מורה', 'לקנות', 'קנה', 'ידידות', 'שיתוף']
  },
  {
    id: 'hp-17',
    hebrew: 'חֹתָמוֹ שֶׁל הַקָּדוֹשׁ בָּרוּךְ הוּא אֱמֶת.',
    transliteration: 'Chotamo shel HaKadosh Baruch Hu emet.',
    vuk: 'hotamo šel hakadoš baruh hu emet.',
    serbian: 'Pečat Svevišnjega jeste Istina.',
    english: 'The seal of the Holy One is Truth.',
    source: 'Talmud Shabbat 55a',
    type: 'talmud',
    keywords: ['אמת', 'אמיתי', 'כנות', 'קדוש', 'אלוהים']
  },
  {
    id: 'hp-18',
    hebrew: 'אִם אֵין דַּעַת, אֵין בִּינָה; אִם אֵין בִּינָה, אֵין דַּעַת.',
    transliteration: 'Im ein daat, ein binah; im ein binah, ein daat.',
    vuk: 'im ejn daat, ejn bina; im ejn bina, ejn daat.',
    serbian: 'Bez znanja nema razumevanja; bez razumevanja nema pravog znanja.',
    english: 'Without knowledge there is no understanding; without understanding there is no knowledge.',
    source: 'Pirkei Avot 3:17',
    type: 'talmud',
    keywords: ['דעת', 'בינה', 'תבונה', 'להבין', 'לדעת', 'מחשבה', 'מודעות']
  },
  {
    id: 'hp-19',
    hebrew: 'דֶּרֶךְ אֶרֶץ קָדְמָה לַתּוֹרָה.',
    transliteration: 'Derech eretz kadmah laTorah.',
    vuk: 'dereh erec kadma latora.',
    serbian: 'Lepo vaspitanje i ljudskost prethode svakom učenju.',
    english: 'Decency and good character precede Torah.',
    source: 'Vayikra Rabbah 9:3',
    type: 'talmud',
    keywords: ['דרך', 'ארץ', 'תרבות', 'חינוך', 'מוסר', 'תורה', 'כבוד']
  },
  {
    id: 'hp-20',
    hebrew: 'הֱוֵי מְקַבֵּל אֶת כָּל הָאָדָם בְּסֵבֶר פָּנִים יָפוֹת.',
    transliteration: 'Hevei mekabel et kol haadam besever panim yafot.',
    vuk: 'hevej mekabel et kol haadam besever panim jafot.',
    serbian: 'Dočekuj svakog čoveka vedrog i prijateljskog lica.',
    english: 'Greet every person with a cheerful, welcoming countenance.',
    source: 'Pirkei Avot 1:15',
    type: 'talmud',
    keywords: ['לחייך', 'פנים', 'לקבל', 'שלום', 'ברוך', 'יפה', 'נעים']
  },
  {
    id: 'hp-21',
    hebrew: 'מִצְוָה גּוֹרֶרֶת מִצְוָה.',
    transliteration: 'Mitzvah goreret mitzvah.',
    vuk: 'micva goreret micva.',
    serbian: 'Jedno dobro delo povlači za sobom drugo dobro delo.',
    english: 'One good deed naturally leads to another.',
    source: 'Ben Azaj — Pirkei Avot 4:2',
    type: 'talmud',
    keywords: ['טוב', 'חסד', 'עקבנות', 'הרגל', 'רצון', 'לתת']
  },
  {
    id: 'hp-22',
    hebrew: 'יֹתֵר מִשֶּׁשָּׁמְרוּ יִשְׂרָאֵל אֶת הַשַּׁבָּת, שָׁמְרָה הַשַּׁבָּת אוֹתָם.',
    transliteration: 'Yoter misheshamru Yisrael et haShabbat, shamrah haShabbat otam.',
    vuk: 'joter mišesamru jisrael et hašabat, šamra hašabat otam.',
    serbian: 'Više nego što je narod čuvao Šabat, Šabat je sačuvao njega.',
    english: 'More than Israel has kept the Sabbath, the Sabbath has kept Israel.',
    source: 'Ahad HaAm (Kulturna mudrost)',
    type: 'proverb',
    keywords: ['שבת', 'לשמור', 'מנוחה', 'שלווה', 'שבוע']
  },
  {
    id: 'hp-23',
    hebrew: 'אוֹ חַבְרוּתָא אוֹ מִיתוּתָא.',
    transliteration: 'O chavruta o mituta.',
    vuk: 'o havruta o mituta.',
    serbian: 'Ili zajedništvo u učenju (drugarstvo), ili pustoš.',
    english: 'Give me companionship and shared study, or give me death.',
    source: 'Talmud Taanit 23a',
    type: 'talmud',
    keywords: ['חבר', 'יחד', 'בדידות', 'משפחה', 'שיתוף', 'ידידות']
  },
  {
    id: 'hp-24',
    hebrew: 'אֵין דָּבָר הָעוֹמֵד בִּפְנֵי הָרָצוֹן.',
    transliteration: 'Ein davar haomed bifnei haratzon.',
    vuk: 'ejn davar haomed bifnej haracon.',
    serbian: 'Ništa ne može stati na put iskrenoj i čvrstoj volji.',
    english: 'Nothing can stand in the way of resolute willpower.',
    source: 'Jevrejska poslovica (Zohar / Midraš)',
    type: 'proverb',
    keywords: ['רצון', 'לרצות', 'יכל', 'נחישות', 'כח', 'מטרה', 'חלום']
  },
  {
    id: 'hp-25',
    hebrew: 'לְעוֹלָם יְהֵא אָדָם רַךְ כַּקָּנֶה וְאַל יְהֵא קָשֶׁה כָּאֶרֶז.',
    transliteration: 'Leolam yehei adam rach kakaneh veal yehei kasheh kaerez.',
    vuk: 'leolam jehej adam rah kakane veal jehej kaše kaerez.',
    serbian: 'Neka čovek uvek bude savitljiv kao trska, a ne krut kao kedar.',
    english: 'Always be flexible like a reed, never rigid like a cedar.',
    source: 'Talmud Taanit 20a',
    type: 'talmud',
    keywords: ['עץ', 'קשה', 'רוך', 'חוסן', 'ענווה', 'רוח', 'גמישות']
  },
  {
    id: 'hp-26',
    hebrew: 'סוֹף מַעֲשֶׂה בְּמַחֲשָׁבָה תְּחִלָּה.',
    transliteration: 'Sof maaseh bemachshavah techilah.',
    vuk: 'sof maase bemahašava tehila.',
    serbian: 'Kraj svakog dela počinje prvo u jasnoj misli.',
    english: 'The final deed is born first in thoughtful intention.',
    source: 'Lecha Dodi (Šlomo Alkabec)',
    type: 'proverb',
    keywords: ['מחשבה', 'לחשב', 'סוף', 'התחלה', 'אסטרטגיה', 'תכנון', 'כוונה', 'רעיון']
  },
  {
    id: 'hp-27',
    hebrew: 'כָּל הַהַתְחָלוֹת קָשׁוֹת.',
    transliteration: 'Kol hahatchalot kashot.',
    vuk: 'kol hahathalot kašot.',
    serbian: 'Svaki početak je težak.',
    english: 'All beginnings are hard.',
    source: 'Mehilta de-Rabi Jišmael',
    type: 'talmud',
    keywords: ['להתחיל', 'התחלה', 'קשה', 'ראשון', 'אתגר', 'ניסיון']
  },
  {
    id: 'hp-28',
    hebrew: 'תְּפִלָּה בְּלִי כַּוָּנָה כְּגוּף בְּלִי נְשָׁמָה.',
    transliteration: 'Tefilah beli kavanah keguf beli neshamah.',
    vuk: 'tefila beli kavana keguf beli nešama.',
    serbian: 'Molitva bez iskrene namere je kao telo bez duše.',
    english: 'Prayer without focused intention is like a body without a soul.',
    source: 'Jevrejska mudrost (Bahja ibn Pakuda)',
    type: 'proverb',
    keywords: ['תפילה', 'כוונה', 'גוף', 'נשמה', 'מיקוד', 'ריכוז']
  },
  {
    id: 'hp-29',
    hebrew: 'יְגַעְתָּ וּמָצָאתָ — תַּאֲמִין.',
    transliteration: 'Yagata umatzata — taamin.',
    vuk: 'jagata umacata — taamin.',
    serbian: 'Ako si se potrudio i pronašao — veruj da je zasluženo.',
    english: 'If you have labored and succeeded — believe it!',
    source: 'Talmud Megillah 6b',
    type: 'talmud',
    keywords: ['למצוא', 'להאמין', 'אמונה', 'עבודה', 'הצלחה', 'לחפש']
  },
  {
    id: 'hp-30',
    hebrew: 'לֹא הַבַּיְשָׁן לָמֵד, וְלֹא הַקַּפְּדָן מְלַמֵּד.',
    transliteration: 'Lo habayshan lamed, velo hakapdan melamed.',
    vuk: 'lo habajšan lamed, velo hakapdan melamed.',
    serbian: 'Stidljiv čovek ne uči, a nestrpljiv učitelj ne može da podučava.',
    english: 'The shy person cannot learn, and the impatient person cannot teach.',
    source: 'Hillel — Pirkei Avot 2:5',
    type: 'talmud',
    keywords: ['ללמד', 'לשאול', 'שאל', 'בושה', 'סבלנות', 'אומץ', 'ביטחון']
  },
  {
    id: 'hp-31',
    hebrew: 'כָּל הַמּוֹסִיף גּוֹרֵעַ.',
    transliteration: 'Kol hamosif gorea.',
    vuk: 'kol hamosif gorea.',
    serbian: 'Preterivanje često oduzima i kvari suštinu (Manje je više).',
    english: 'Whoever adds too much ends up diminishing.',
    source: 'Talmud Sanhedrin 29a',
    type: 'talmud',
    keywords: ['פשטות', 'מינון', 'איזון', 'איכות', 'עוד']
  },
  {
    id: 'hp-32',
    hebrew: 'דִּבְרֵי חֲכָמִים בְּנַחַת נִשְׁמָעִים.',
    transliteration: 'Divrei chachamim benachat nishmaim.',
    vuk: 'divrej hahamim benahat nišmaim.',
    serbian: 'Reči mudrih ljudi najbolje se čuju kada se izgovaraju smireno.',
    english: 'The words of the wise are heard best when spoken gently.',
    source: 'Kohelet 9:17',
    type: 'biblical',
    keywords: ['לשמע', 'לדבר', 'מילה', 'שקט', 'חכם', 'שלווה', 'רוך']
  },

  // =========================================================================
  // 2. BIBLICAL PROVERBS — MISHLEI, KOHELET, TEHILLIM (35 Classics)
  // =========================================================================
  {
    id: 'hp-33',
    hebrew: 'בַּקֵּשׁ שָׁלוֹם וְרָדְפֵהוּ.',
    transliteration: 'Bakesh shalom verodfehu.',
    vuk: 'bakeš šalom verodfehu.',
    serbian: 'Traži mir i neumorno idi za njim.',
    english: 'Seek peace and pursue it eagerly.',
    source: 'Tehillim (Psalmi) 34:15',
    type: 'biblical',
    keywords: ['שלום', 'לבקש', 'לחפש', 'לרוץ', 'שלווה']
  },
  {
    id: 'hp-34',
    hebrew: 'עַל כָּל פְּשָׁעִים תְּכַסֶּה אַהֲבָה.',
    transliteration: 'Al kol peshaim techaseh ahavah.',
    vuk: 'al kol pešaim tehase ahava.',
    serbian: 'Ljubav pokriva sve greške i prestupe.',
    english: 'Love covers over all offenses.',
    source: 'Mishlei (Priče Solomonove) 10:12',
    type: 'biblical',
    keywords: ['אהבה', 'לאהוב', 'סליחה', 'לב', 'משפחה']
  },
  {
    id: 'hp-35',
    hebrew: 'מִכָּל מִשְׁמָר נְצֹר לִבֶּךָ, כִּי מִמֶּנּוּ תּוֹצְאוֹת חַיִּים.',
    transliteration: 'Mikol mishmar netzor libecha, ki mimenu totzeot chaim.',
    vuk: 'mikol mišmar necor libeha, ki mimenu toceot hajim.',
    serbian: 'Više od svega što se čuva, čuvaj svoje srce, jer iz njega izvire život.',
    english: 'Above all else, guard your heart, for everything you do flows from it.',
    source: 'Mishlei (Priče Solomonove) 4:23',
    type: 'biblical',
    keywords: ['לב', 'חיים', 'לשמור', 'בריאות', 'נשימה']
  },
  {
    id: 'hp-36',
    hebrew: 'וּבָחַרְתָּ בַּחַיִּים לְמַעַן תִּחְיֶה.',
    transliteration: 'Uvacharta bachaim lemaan tichyeh.',
    vuk: 'uvaharta bahajim lemaan tihje.',
    serbian: 'Izaberi život, da bi u punini živeo.',
    english: 'Choose life, so that you and your descendants may thrive.',
    source: 'Devarim (Ponovljeni zakoni) 30:19',
    type: 'biblical',
    keywords: ['חיים', 'לבחור', 'להחליט', 'חיוניות', 'לחיים']
  },
  {
    id: 'hp-37',
    hebrew: 'צֶדֶק צֶדֶק תִּרְדֹּף.',
    transliteration: 'Tzedek tzedek tirdof.',
    vuk: 'cedek cedek tirdof.',
    serbian: 'Za pravdom, samo za pravdom idi.',
    english: 'Justice, justice shall you pursue.',
    source: 'Devarim 16:20',
    type: 'biblical',
    keywords: ['צדק', 'חוק', 'מדינה', 'אמת', 'מוסר']
  },
  {
    id: 'hp-38',
    hebrew: 'עוֹלָם חֶסֶד יִבָּנֶה.',
    transliteration: 'Olam chesed yibaneh.',
    vuk: 'olam hesed jibane.',
    serbian: 'Svet se gradi na dobroti i milosrđu.',
    english: 'The world is built upon loving-kindness.',
    source: 'Tehillim 89:3',
    type: 'biblical',
    keywords: ['חסד', 'לבנות', 'עולם', 'טוב', 'לעזור', 'מתנה']
  },
  {
    id: 'hp-39',
    hebrew: 'בַּרְזֶל בְּבַרְזֶל יָחַד, וְאִישׁ יַחַד פְּנֵי רֵעֵהוּ.',
    transliteration: 'Barzel bebarzel yachad, veish yachad pnei reehu.',
    vuk: 'barzel bebarzel jahad, veiš jahad pnej reehu.',
    serbian: 'Gvožđe se gvožđem oštri, tako čovek oštri duh svoga prijatelja.',
    english: 'As iron sharpens iron, so one person sharpens another.',
    source: 'Mishlei 27:17',
    type: 'biblical',
    keywords: ['חבר', 'איש', 'יחד', 'אימון', 'חוזק', 'סינרגיה']
  },
  {
    id: 'hp-40',
    hebrew: 'מַעֲנֶה רַךְ יָשִׁיב חֵמָה.',
    transliteration: 'Maaneh rach yashiv chemah.',
    vuk: 'maane rah jašiv hema.',
    serbian: 'Blag odgovor smiruje gnev.',
    english: 'A gentle answer turns away wrath.',
    source: 'Mishlei 15:1',
    type: 'biblical',
    keywords: ['לענות', 'ענה', 'כעס', 'רוך', 'שלום', 'מילה', 'לדבר']
  },
  {
    id: 'hp-41',
    hebrew: 'לֵב שָׂמֵחַ יֵיטִב גֵּהָה.',
    transliteration: 'Lev sameach yeitiv gehah.',
    vuk: 'lev sameah jejtiv geha.',
    serbian: 'Veselo srce je najbolji lek.',
    english: 'A joyful heart is good medicine.',
    source: 'Mishlei 17:22',
    type: 'biblical',
    keywords: ['שמח', 'שמחה', 'לב', 'תרופה', 'בריאות', 'החלמה', 'לצחוק', 'רופא']
  },
  {
    id: 'hp-42',
    hebrew: 'מָוֶת וְחַיִּים בְּיַד לָשׁוֹן.',
    transliteration: 'Mavet vechaim beyad lashon.',
    vuk: 'mavet vehajim bejad lašon.',
    serbian: 'Smrt i život su u moći jezika (izgovorene reči).',
    english: 'Life and death are in the power of the tongue.',
    source: 'Mishlei 18:21',
    type: 'biblical',
    keywords: ['מילה', 'לדבר', 'יד', 'פה', 'חיים', 'אמר']
  },
  {
    id: 'hp-43',
    hebrew: 'טוֹב שֵׁם מִשֶּׁמֶן טוֹב.',
    transliteration: 'Tov shem mishemen tov.',
    vuk: 'tov šem mišemen tov.',
    serbian: 'Dobar glas i časno ime vrede više od najfinijeg ulja.',
    english: 'A good name is better than precious oil.',
    source: 'Kohelet 7:1',
    type: 'biblical',
    keywords: ['שם', 'שמן', 'טוב', 'כבוד', 'זית']
  },
  {
    id: 'hp-44',
    hebrew: 'לַכֹּל זְמָן וְעֵת לְכָל חֵפֶץ תַּחַת הַשָּׁמָיִם.',
    transliteration: 'Lakol zman veet lechol chefetz tachat hashamayim.',
    vuk: 'lakol zman veet lehol hefec tahat hašamajim.',
    serbian: 'Sve ima svoje vreme i svaka stvar pod nebom ima svoj čas.',
    english: 'To everything there is a season, and a time to every purpose under heaven.',
    source: 'Kohelet (Propovednik) 3:1',
    type: 'biblical',
    keywords: ['זמן', 'שעה', 'יום', 'שנה', 'חודש', 'שמיים', 'מתי', 'רגע', 'דקה', 'אביב', 'חורף', 'קיץ', 'סתיו']
  },
  {
    id: 'hp-45',
    hebrew: 'שְׁלַח לַחְמְךָ עַל פְּנֵי הַמָּיִם, כִּי בְרֹב הַיָּמִים תִּמְצָאֶנּוּ.',
    transliteration: 'Shelach lachmecha al pnei hamayim, ki berov hayamim timtzaenu.',
    vuk: 'šelah lahmeha al pnej hamajim, ki berov hajamim timcaenu.',
    serbian: 'Baci svoj hleb po vodi, jer ćeš ga posle mnogo dana ponovo naći.',
    english: 'Cast your bread upon the waters, for after many days you will find it again.',
    source: 'Kohelet 11:1',
    type: 'biblical',
    keywords: ['לחם', 'מים', 'לשלוח', 'לתת', 'למצוא', 'השקעה', 'ים', 'נהר']
  },
  {
    id: 'hp-46',
    hebrew: 'כָּל הַנְּחָלִים הֹלְכִים אֶל הַיָּם, וְהַיָּם אֵינֶנּוּ מָלֵא.',
    transliteration: 'Kol hanechalim holchim el hayam, vehayam einenu male.',
    vuk: 'kol hanehalim holhim el hajam, vehajam ejnenu male.',
    serbian: 'Sve reke teku u more, a more se ipak ne prepuni.',
    english: 'All streams flow into the sea, yet the sea is never full.',
    source: 'Kohelet 1:7',
    type: 'biblical',
    keywords: ['ים', 'נהר', 'ללכת', 'הלך', 'מים', 'מלא', 'אגם', 'חוף']
  },
  {
    id: 'hp-47',
    hebrew: 'הַזֹּרְעִים בְּדִמְעָה בְּרִנָּה יִקְצֹרוּ.',
    transliteration: 'Hazorim bedimah berinah yiktzoru.',
    vuk: 'hazorim bedima berina jikcoru.',
    serbian: 'Oni koji seju u suzama, žeće u pesmi i radosti.',
    english: 'Those who sow in tears shall reap in songs of joy.',
    source: 'Tehillim 126:5',
    type: 'biblical',
    keywords: ['לבכות', 'לשיר', 'שמחה', 'עצוב', 'תקווה', 'הצלחה', 'אדמה']
  },
  {
    id: 'hp-48',
    hebrew: 'לֵךְ אֶל נְמָלָה עָצֵל, רְאֵה דְרָכֶיהָ וַחֲכָם.',
    transliteration: 'Lech el nemalah atzel, reeh deracheha vachacham.',
    vuk: 'leh el nemala acel, ree deraheha vahaham.',
    serbian: 'Idi mravu, prouči puteve njegove vrednoće i postani mudar.',
    english: 'Observe the diligent ant, consider its ways and grow wise.',
    source: 'Mishlei 6:6',
    type: 'biblical',
    keywords: ['דרך', 'עבודה', 'לעבוד', 'חכם', 'זריזות', 'משמעת', 'לראות']
  },
  {
    id: 'hp-49',
    hebrew: 'עֵץ חַיִּים הִיא לַמַּחֲזִיקִים בָּהּ.',
    transliteration: 'Etz chaim hi lamachazikim bah.',
    vuk: 'ec hajim hi lamahazikim ba.',
    serbian: 'Mudrost je drvo života za sve koji je se čvrsto drže.',
    english: 'Wisdom is a tree of life to those who embrace her.',
    source: 'Mishlei 3:18',
    type: 'biblical',
    keywords: ['עץ', 'יער', 'תורה', 'חיים', 'חזק', 'ספר', 'פרח']
  },
  {
    id: 'hp-50',
    hebrew: 'טוֹב אֶרֶךְ רוּחַ מִגְּבַהּ רוּחַ.',
    transliteration: 'Tov erech ruach migvah ruach.',
    vuk: 'tov ereh ruah migvah ruah.',
    serbian: 'Bolji je strpljiv duh nego ohol i gord duh.',
    english: 'Better is patience of spirit than pride of spirit.',
    source: 'Kohelet 7:8',
    type: 'biblical',
    keywords: ['סבלנות', 'רוח', 'גאווה', 'ענווה', 'גבוה', 'ארוך']
  },
  {
    id: 'hp-51',
    hebrew: 'כִּי אֵין הָאָדָם חַי עַל הַלֶּחֶם לְבַדּוֹ.',
    transliteration: 'Ki ein haadam chai al halechem levado.',
    vuk: 'ki ejn haadam haj al halehem levado.',
    serbian: 'Ne živi čovek samo od hleba.',
    english: 'Human beings do not live on bread alone.',
    source: 'Devarim 8:3',
    type: 'biblical',
    keywords: ['לחם', 'אוכל', 'לאכול', 'אכל', 'לבד', 'נשמה', 'רעב']
  },
  {
    id: 'hp-52',
    hebrew: 'שֶׁבַע יִפּוֹל צַדִּיק וָקָם.',
    transliteration: 'Sheva yipol tzadik vakam.',
    vuk: 'ševa jipol cadik vakam.',
    serbian: 'Sedam puta padne pravednik, i opet ustane.',
    english: 'Though the righteous fall seven times, they rise again.',
    source: 'Mishlei 24:16',
    type: 'biblical',
    keywords: ['שבע', 'לעמוד', 'עמד', 'חוסן', 'התמדה', 'הפסד', 'ניצחון', 'נחישות']
  },
  {
    id: 'hp-53',
    hebrew: 'טוֹבִים הַשְּׁנַיִם מִן הָאֶחָד.',
    transliteration: 'Tovim hashnayim min haechad.',
    vuk: 'tovim hašnajim min haehad.',
    serbian: 'Bolje je dvojici nego jednome, jer imaju dobru nagradu za svoj trud.',
    english: 'Two are better than one, for they have a good reward for their toil.',
    source: 'Kohelet 4:9',
    type: 'biblical',
    keywords: ['שניים', 'אחד', 'יחד', 'שיתוף', 'חבר', 'משפחה', 'סינרגיה']
  },
  {
    id: 'hp-54',
    hebrew: 'אֶבֶן מָאֲסוּ הַבּוֹנִים הָיְתָה לְרֹאשׁ פִּנָּה.',
    transliteration: 'Even maasu habonim haytah lerosh pinah.',
    vuk: 'even maasu habonim hajta leroš pina.',
    serbian: 'Kamen koji zidari odbaciše postade kamen temeljac.',
    english: 'The stone the builders rejected has become the cornerstone.',
    source: 'Tehillim 118:22',
    type: 'biblical',
    keywords: ['אבן', 'לבנות', 'ראש', 'יסוד', 'בית', 'הצלחה']
  },
  {
    id: 'hp-55',
    hebrew: 'בָּעֶרֶב יָלִין בֶּכִי וְלַבֹּקֶר רִנָּה.',
    transliteration: 'Baerev yalin bechi velaboker rinah.',
    vuk: 'baerev jalin behi velaboker rina.',
    serbian: 'Uveče može zanoćiti plač, ali jutro donosi radost.',
    english: 'Weeping may endure for a night, but joy comes in the morning.',
    source: 'Tehillim 30:6',
    type: 'biblical',
    keywords: ['ערב', 'בוקר', 'לילה', 'לישון', 'שינה', 'לבכות', 'תקווה', 'מחר']
  },
  {
    id: 'hp-56',
    hebrew: 'חֲדָשִׁים לַבְּקָרִים, רַבָּה אֱמוּנָתֶךָ.',
    transliteration: 'Chadashim labekarim, rabah emunatecha.',
    vuk: 'hadašim labekarim, raba emunateha.',
    serbian: 'Svakog jutra obnavljaju se snage; velika je tvoja vernost.',
    english: 'Renewed every single morning; great is your faithfulness.',
    source: 'Eicha (Plač Jeremijin) 3:23',
    type: 'biblical',
    keywords: ['בוקר', 'חדש', 'אמונה', 'התעוררות', 'יום', 'שמש']
  },
  {
    id: 'hp-57',
    hebrew: 'וְזָרְחָה לָכֶם שֶׁמֶשׁ צְדָקָה וּמַרְפֵּא בִּכְנָפֶיהָ.',
    transliteration: 'Vezarchah lachem shemesh tzedakah umarpei bichnafeha.',
    vuk: 'vezarha lahem šemeš cedaka umarpej bihnafeha.',
    serbian: 'Obasjaće vas sunce pravde sa isceljenjem u svojim zracima.',
    english: 'The sun of righteousness shall rise with healing in its wings.',
    source: 'Malahija 3:20',
    type: 'biblical',
    keywords: ['שמש', 'אור', 'בריאות', 'החלמה', 'צדק', 'חם']
  },
  {
    id: 'hp-58',
    hebrew: 'יְהִי שָׁלוֹם בְּחֵילֵךְ, שַׁלְוָה בְּאַרְמְנוֹתָיִךְ.',
    transliteration: 'Yehi shalom becheilech, shalvah bearmenotayich.',
    vuk: 'jehi šalom behejleh, šalva bearmenotajih.',
    serbian: 'Neka mir vlada u tvojim bedemima i spokoj u tvojim dvorima.',
    english: 'May there be peace within your walls and serenity within your halls.',
    source: 'Tehillim 122:7',
    type: 'biblical',
    keywords: ['שלווה', 'שלום', 'בית', 'עיר', 'חדר', 'דלת', 'חלון']
  },
  {
    id: 'hp-59',
    hebrew: 'אֵשֶׁת חַיִל מִי יִמְצָא, וְרָחֹק מִפְּנִינִים מִכְרָהּ.',
    transliteration: 'Eshet chayil mi yimtza, verachok mipninim michrah.',
    vuk: 'ešet hajil mi jimca, verahok mipninim mihra.',
    serbian: 'Vrednu i mudru ženu ko će naći? Vrednost njena nadmašuje bisere.',
    english: 'A woman of valor who can find? Her worth is far above rubies.',
    source: 'Mishlei 31:10',
    type: 'biblical',
    keywords: ['אישה', 'אמא', 'אחות', 'ילדה', 'בת', 'רחוק', 'למצוא']
  },
  {
    id: 'hp-60',
    hebrew: 'בְּחָכְמָה יִבָּנֶה בָּיִת וּבִתְבוּנָה יִתְכּוֹנָן.',
    transliteration: 'Bechochmah yibaneh bayit uvitevunah yitkonan.',
    vuk: 'behohma jibane bajit uvitevuna jitkonan.',
    serbian: 'Mudrošću se kuća zida, a razboritošću se utvrđuje.',
    english: 'By wisdom a house is built, and through understanding it is established.',
    source: 'Mishlei 24:3',
    type: 'biblical',
    keywords: ['בית', 'משפחה', 'שולחן', 'כיסא', 'מטבח', 'מפתח', 'תבונה', 'לבנות']
  },
  {
    id: 'hp-61',
    hebrew: 'רַבּוֹת מַחֲשָׁבוֹת בְּלֶב אִישׁ, וַעֲצַת ה\' הִיא תָקוּם.',
    transliteration: 'Rabot machashavot belev ish, vaatzat Hashem hi takum.',
    vuk: 'rabot mahašavot belev iš, vaacat hašem hi takum.',
    serbian: 'Mnogo je zamisli u srcu čovekovom, ali ono što je istinski ispravno opstaje.',
    english: 'Many are the plans in a person’s heart, but enduring purpose prevails.',
    source: 'Mishlei 19:21',
    type: 'biblical',
    keywords: ['מחשבה', 'רעיון', 'תכנית', 'פרויקט', 'גורל', 'עתיד']
  },
  {
    id: 'hp-62',
    hebrew: 'נֵר לְרַגְלִי דְבָרֶךָ וְאוֹר לִנְתִיבָתִי.',
    transliteration: 'Ner leragli devarecha veor lintivati.',
    vuk: 'ner leragli devareha veor lintivati.',
    serbian: 'Tvoja reč je svetiljka nozi mojoj i svetlost stazi mojoj.',
    english: 'Your word is a lamp to my feet and a light to my path.',
    source: 'Tehillim 119:105',
    type: 'biblical',
    keywords: ['רגל', 'אור', 'דרך', 'מסע', 'כוכב', 'ירח', 'מילה']
  },
  {
    id: 'hp-63',
    hebrew: 'כִּי הָאָדָם עֵץ הַשָּׂדֶה.',
    transliteration: 'Ki haadam etz hasadeh.',
    vuk: 'ki haadam ec hasade.',
    serbian: 'Jer čovek je nalik drvetu u polju (dubokih korena i plodnih grana).',
    english: 'For a human being is like a tree of the field.',
    source: 'Devarim 20:19',
    type: 'biblical',
    keywords: ['עץ', 'אדם', 'טבע', 'אדמה', 'פרח', 'פארק', 'יער', 'גשם']
  },
  {
    id: 'hp-64',
    hebrew: 'הַמְּפַזֵּר וְנוֹסָף עוֹד.',
    transliteration: 'Hamefazer venosaf od.',
    vuk: 'hamefazer venosaf od.',
    serbian: 'Ko velikodušno daje, postaje još bogatiji.',
    english: 'One gives freely, yet grows all the richer.',
    source: 'Mishlei 11:24',
    type: 'biblical',
    keywords: ['לתת', 'נתן', 'מתנה', 'רווח', 'עשיר', 'ברכה', 'השקעה']
  },
  {
    id: 'hp-65',
    hebrew: 'כְּמַיִם קָרִים עַל נֶפֶשׁ עֲיֵפָה, וּשְׁמוּעָה טוֹבָה מֵאֶרֶץ מֶרְחָק.',
    transliteration: 'Kemayim karim al nefesh ayefah, ushmuah tovah meeretz merchak.',
    vuk: 'kemajim karim al nefeš ajefa, ušmua tova meerec merhak.',
    serbian: 'Kao hladna voda umornoj duši, takva je dobra vest iz daleke zemlje.',
    english: 'Like cold water to a weary soul is good news from a distant land.',
    source: 'Mishlei 25:25',
    type: 'biblical',
    keywords: ['מים', 'קר', 'עייף', 'צמא', 'לשתות', 'שתה', 'מרחק', 'רחוק']
  },
  {
    id: 'hp-66',
    hebrew: 'כְּבַד אֶת אָבִיךָ וְאֶת אִמֶּךָ.',
    transliteration: 'Kabed et avicha veet imecha.',
    vuk: 'kabed et aviha veet imeha.',
    serbian: 'Poštuj oca svoga i majku svoju.',
    english: 'Honor your father and your mother.',
    source: 'Šemot (Izlazak) 20:12',
    type: 'biblical',
    keywords: ['אבא', 'אמא', 'משפחה', 'בן', 'בת', 'ילד', 'כבוד', 'אח', 'אחות']
  },
  {
    id: 'hp-67',
    hebrew: 'דְּבַשׁ מָצָאתָ אֱכֹל דַּיֶּךָ.',
    transliteration: 'Devash matzata echol dayecha.',
    vuk: 'devaš macata ehol dajeha.',
    serbian: 'Ako nađeš med, jedi ga umereno, onoliko koliko ti prija.',
    english: 'If you have found honey, eat only what is sufficient for you.',
    source: 'Mishlei 25:16',
    type: 'biblical',
    keywords: ['דבש', 'מתוק', 'לאכול', 'סוכר', 'עוגה', 'שוקולד', 'גלידה', 'דבורה', 'מינון']
  },

  // =========================================================================
  // 3. HASIDIC & MODERN JEWISH PHILOSOPHICAL WISDOM (25 Gems)
  // =========================================================================
  {
    id: 'hp-68',
    hebrew: 'כָּל הָעוֹלָם כֻּלּוֹ גֶּשֶׁר צַר מְאֹד, וְהָעִיקָר לֹא לְפַחֵד כְּלָל.',
    transliteration: 'Kol haolam kulo gesher tzar meod, vehaikar lo lefached klal.',
    vuk: 'kol haolam kulo gešer car meod, vehaikar lo lefahed klal.',
    serbian: 'Čitav svet je veoma uzak most, a najvažnije od svega je — ne bojati se uopšte.',
    english: 'The entire world is a very narrow bridge, and the main thing is not to fear at all.',
    source: 'Rabi Nahman iz Breslova',
    type: 'hasidic',
    keywords: ['גשר', 'פחד', 'אומץ', 'גבורה', 'עולם', 'ביטחון', 'לנסוע', 'מסוכן']
  },
  {
    id: 'hp-69',
    hebrew: 'מְעַט מִן הָאוֹר דּוֹחֶה הַרְבֵּה מִן הַחֹשֶׁךְ.',
    transliteration: 'Meat min haor docheh harbeh min hachoshech.',
    vuk: 'meat min haor dohe harbe min hahošeh.',
    serbian: 'Malo svetlosti rasteruje mnogo tame.',
    english: 'A little bit of light dispels a great deal of darkness.',
    source: 'Hasidska mudrost (Bahja ibn Pakuda / Tanja)',
    type: 'hasidic',
    keywords: ['אור', 'אש', 'כוכב', 'שמש', 'לילה', 'תקווה', 'חזון']
  },
  {
    id: 'hp-70',
    hebrew: 'מִצְוָה גְּדוֹלָה לִהְיוֹת בְּשִׂמְחָה תָּמִיד.',
    transliteration: 'Mitzvah gedolah lihyot besimchah tamid.',
    vuk: 'micva gedola lihjot besimha tamid.',
    serbian: 'Velika je vrlina biti u radosti svakoga dana.',
    english: 'It is a great mitzvah to be in a state of joy always.',
    source: 'Rabi Nahman iz Breslova',
    type: 'hasidic',
    keywords: ['שמחה', 'תמיד', 'גדול', 'אושר', 'לחייך', 'לרקוד', 'לשיר']
  },
  {
    id: 'hp-71',
    hebrew: 'אִם אַתָּה מַאֲמִין שֶׁיְּכוֹלִים לְקַלְקֵל, תַּאֲמִין שֶׁיְּכוֹלִים לְתַקֵּן.',
    transliteration: 'Im atah maamin sheyecholim lekalkel, taamin sheyecholim letaken.',
    vuk: 'im ata maamin šejeholim lekalkel, taamin šejeholim letaken.',
    serbian: 'Ako veruješ da se nešto može pokvariti, veruj i da se može popraviti.',
    english: 'If you believe you can break something, believe that you can also repair it.',
    source: 'Rabi Nahman iz Breslova',
    type: 'hasidic',
    keywords: ['תיקון', 'להאמין', 'אמונה', 'לשנות', 'שינוי', 'תשובה', 'החלמה']
  },
  {
    id: 'hp-72',
    hebrew: 'הַיּוֹם שֶׁבּוֹ נוֹלַדְתָּ הוּא הַיּוֹם שֶׁבּוֹ הֶחְלִיט הָעוֹלָם שֶׁאֵינוֹ יָכוֹל לְהִתְקַיֵּם בִּלְעָדֶיךָ.',
    transliteration: 'Hayom shebo noladta hu hayom shebo hechlit haolam sheeino yachol lehitkayem biladecha.',
    vuk: 'hajom šebo noladta hu hajom šebo hehlit haolam šeejno jahol lehitkajem biladeha.',
    serbian: 'Dan kada si rođen je dan kada je svet odlučio da ne može postojati bez tebe.',
    english: 'The day you were born is the day the universe decided it could not exist without you.',
    source: 'Rabi Nahman iz Breslova',
    type: 'hasidic',
    keywords: ['היום', 'יום', 'משמעות', 'ייעוד', 'נשמה', 'ילד', 'חיים']
  },
  {
    id: 'hp-73',
    hebrew: 'בְּמָקוֹם שֶׁמַּחֲשַׁבְתּוֹ שֶׁל אָדָם נִמְצֵאת, שָׁם כָּל הָאָדָם נִמְצָא.',
    transliteration: 'Bemakom shemachshavto shel adam nimtzet, sham kol haadam nimtza.',
    vuk: 'bemakom šemahašavto šel adam nimcet, šam kol haadam nimca.',
    serbian: 'Tamo gde su čovekove misli, tamo se nalazi čitavo njegovo biće.',
    english: 'Where a person’s thoughts are, there the entire person truly is.',
    source: 'Baal Šem Tov',
    type: 'hasidic',
    keywords: ['מחשבה', 'לחשב', 'שם', 'כאן', 'מקום', 'מיקוד', 'תודעה', 'מוערנות']
  },
  {
    id: 'hp-74',
    hebrew: 'אִם תִּרְצוּ, אֵין זוֹ אַגָּדָה.',
    transliteration: 'Im tirtzu, ein zo agadah.',
    vuk: 'im tircu, ejn zo agada.',
    serbian: 'Ako to istinski želite, to nije bajka već stvarnost.',
    english: 'If you will it, it is no dream.',
    source: 'Teodor Hercl (Altneuland)',
    type: 'proverb',
    keywords: ['חלום', 'לרצות', 'חזון', 'עתיד', 'מטרה', 'הצלחה', 'מדינה']
  },
  {
    id: 'hp-75',
    hebrew: 'דַּע מֵאַיִן בָּאתָ, וּלְאָן אַתָּה הוֹלֵךְ.',
    transliteration: 'Da meayin bata, ulean atah holech.',
    vuk: 'da meajin bata, ulean ata holeh.',
    serbian: 'Znaj odakle si došao i kuda ideš.',
    english: 'Know where you came from, and know where you are going.',
    source: 'Akavja ben Mahalalel — Pirkei Avot 3:1',
    type: 'talmud',
    keywords: ['לבוא', 'ללכת', 'איפה', 'מסע', 'דרך', 'יסוד', 'לדעת']
  },
  {
    id: 'hp-76',
    hebrew: 'זְמַן הוּא הַמַּטְבֵּעַ הַיָּקָר בְּיוֹתֵר; אַל תְּבַזְבֵּז אוֹתוֹ.',
    transliteration: 'Zman hu hamatbea hayakar beyoter; al tevazbez oto.',
    vuk: 'zman hu hamatbea hajakar bejoter; al tevazbez oto.',
    serbian: 'Vreme je najdragoceniji novčić — ne troši ga uzalud.',
    english: 'Time is the most precious currency; spend it with wisdom.',
    source: 'Jevrejska etička mudrost (Musar)',
    type: 'proverb',
    keywords: ['זמן', 'כסף', 'לשלם', 'תקציב', 'דקה', 'שעה', 'רגע', 'בנק']
  },
  {
    id: 'hp-77',
    hebrew: 'גַּם זֶה יַעֲבֹר.',
    transliteration: 'Gam zeh yaavor.',
    vuk: 'gam ze jaavor.',
    serbian: 'I ovo će proći.',
    english: 'This too shall pass.',
    source: 'Predanje o prstenu cara Solomona',
    type: 'proverb',
    keywords: ['גם', 'זה', 'סבלנות', 'שלווה', 'דאגה', 'כאב', 'עצוב', 'זמן', 'מלך']
  },
  {
    id: 'hp-78',
    hebrew: 'יִרְאַת הַכָּבוֹד לַזּוּלַת הִיא יְסוֹד כָּל הַחָכְמָה.',
    transliteration: 'Yirat hakavod lazulat hi yesod kol hachochmah.',
    vuk: 'jirat hakavod lazulat hi jesod kol hahohma.',
    serbian: 'Poštovanje drugoga je temelj svake istinske mudrosti.',
    english: 'Reverence and respect for others is the foundation of all wisdom.',
    source: 'Musar tradicija',
    type: 'hasidic',
    keywords: ['יסוד', 'כבוד', 'ענווה', 'צניעות', 'מוסר']
  },
  {
    id: 'hp-79',
    hebrew: 'הַנְּשִׁימָה הִיא הַגֶּשֶׁר בֵּין הַגּוּף לַנְּשָׁמָה.',
    transliteration: 'Haneshimah hi hagesher bein haguf laneshamah.',
    vuk: 'hanešima hi hagešer bejn haguf lanešama.',
    serbian: 'Dah je most koji povezuje telo i dušu.',
    english: 'Breath is the bridge connecting body and soul.',
    source: 'Jevrejska kontemplativna mudrost',
    type: 'hasidic',
    keywords: ['נשימה', 'נשמה', 'גוף', 'כושר', 'ריצה', 'שחייה', 'אימון', 'התבוננות']
  },
  {
    id: 'hp-80',
    hebrew: 'כָּל אָדָם צָרִיךְ שֶׁיִּהְיוּ לוֹ שְׁנֵי כִּיסִים: בְּאֶחָד "בִּשְׁבִילִי נִבְרָא הָעוֹלָם", וּבַשֵּׁנִי "אָנֹכִי עָפָר וָאֵפֶר".',
    transliteration: 'Kol adam tzarich sheyihyu lo shnei kisim: be\'echad "Bishvili nivra haolam", uvasheni "Anochi afar vaefer".',
    vuk: 'kol adam carih šejihju lo šnej kisim: beehad "bišvili nivra haolam", uvašeni "anohi afar vaefer".',
    serbian: 'Svaki čovek treba da ima dva džepa: u jednom "Zbog mene je stvoren svet", a u drugom "Ja sam samo prah i pepeo".',
    english: 'Every person must keep two slips of paper: "For my sake the world was created" and "I am but dust and ashes."',
    source: 'Rabi Simha Bunim iz Pšisha',
    type: 'hasidic',
    keywords: ['ענווה', 'צניעות', 'ביטחון', 'איזון', 'שניים', 'אחד', 'צריך']
  },

  // =========================================================================
  // 4. AUTHENTIC HEBREW & ISRAELI IDIOMS (נִיבִים וּבִטּוּיִים — 50 Vivid Idioms!)
  // =========================================================================
  {
    id: 'hp-81',
    hebrew: 'רֹאשׁ גָּדוֹל',
    transliteration: 'Rosh gadol',
    vuk: 'roš gadol',
    serbian: '„Velika glava“ — Preuzimati inicijativu i misliti šire od zadatka.',
    english: 'Big head — Taking ownership, proactive leadership, seeing the big picture.',
    literalNote: 'Doslovno: „Velika glava“ (suprotno od רֹאשׁ קָטָן — raditi samo minimum)',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['ראש', 'גדול', 'קטן', 'מנהיג', 'מנהיגות', 'אחריות', 'פרויקט', 'עסק', 'חברה']
  },
  {
    id: 'hp-82',
    hebrew: 'עַל רֶגֶל אַחַת',
    transliteration: 'Al regel achat',
    vuk: 'al regel ahat',
    serbian: '„Na jednoj nozi“ — Ukratko, sažeto i u samu suštinu.',
    english: 'On one foot — In a nutshell; concisely and straight to the core.',
    literalNote: 'Potiče od Talmuda (Šabat 31a), kada je Hilel objasnio celu Toru stojeći na jednoj nozi',
    source: 'Talmud / Izraelski idiom',
    type: 'idiom',
    keywords: ['רגל', 'אחד', 'קצר', 'להסביר', 'מהירות', 'פשטות', 'מהות']
  },
  {
    id: 'hp-83',
    hebrew: 'יָד אַחַת',
    transliteration: 'Yad achat',
    vuk: 'jad ahat',
    serbian: '„Jedna ruka“ — Potpuno ujedinjeni, složno kao jedno.',
    english: 'One hand — Working in complete unity and solidarity.',
    literalNote: 'Doslovno: „Biti jedna ruka“',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['יד', 'אחד', 'יחד', 'שיתוף', 'סינרגיה', 'לעזור']
  },
  {
    id: 'hp-84',
    hebrew: 'לֵב זָהָב',
    transliteration: 'Lev zahav',
    vuk: 'lev zahav',
    serbian: '„Zlatno srce“ — Osoba izuzetne dobrote i plemenitosti.',
    english: 'A heart of gold — Someone of extraordinary warmth and generosity.',
    literalNote: 'Doslovno: „Srce od zlata“',
    source: 'Hebrejski idiom (נִיב)',
    type: 'idiom',
    keywords: ['לב', 'חסד', 'אהבה', 'טוב', 'חמלה', 'מתנה']
  },
  {
    id: 'hp-85',
    hebrew: 'עֵינַיִם גְּדוֹלוֹת',
    transliteration: 'Einayim gedolot',
    vuk: 'ejnajim gedolot',
    serbian: '„Velike oči“ — Želeti više nego što možeš pojesti ili podneti.',
    english: 'Big eyes — Eyes bigger than one’s stomach; wanting more than needed.',
    literalNote: 'Doslovno: „Velike oči“',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['עין', 'גדול', 'אוכל', 'רעב', 'מסעדה', 'לראות']
  },
  {
    id: 'hp-86',
    hebrew: 'טִפָּה בַּיָּם',
    transliteration: 'Tipah bayam',
    vuk: 'tipa bajam',
    serbian: '„Kap u moru“ — Sasvim mali deo nečeg ogromnog.',
    english: 'A drop in the ocean — A tiny fraction of something vast.',
    literalNote: 'Doslovno: „Kapljica u moru“',
    source: 'Hebrejski idiom (נִיב)',
    type: 'idiom',
    keywords: ['ים', 'מים', 'גשם', 'קטן', 'אגם']
  },
  {
    id: 'hp-87',
    hebrew: 'לִשְׁבֹּר אֶת הָרֹאשׁ',
    transliteration: 'Lishbor et harosh',
    vuk: 'lišbor et haroš',
    serbian: '„Razbijati glavu“ — Intenzivno razmišljati o teškom problemu.',
    english: 'To rack one’s brains — To think intensely about a difficult problem.',
    literalNote: 'Doslovno: „Slomiti glavu“',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['ראש', 'לחשב', 'קשה', 'אתגר', 'מחשבה', 'לגלות']
  },
  {
    id: 'hp-88',
    hebrew: 'לַעֲשׂוֹת חַיִּים',
    transliteration: 'Laasot chaim',
    vuk: 'laasot hajim',
    serbian: '„Praviti život“ — Sjajno se provoditi i uživati punim plućima!',
    english: 'To have the time of one’s life — To truly enjoy life!',
    literalNote: 'Doslovno: „Činiti život“',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['חיים', 'לעשות', 'שמחה', 'לצחוק', 'לרקוד', 'לשחק', 'חוף', 'טיול']
  },
  {
    id: 'hp-89',
    hebrew: 'אֵין אָדָם יוֹדֵעַ מַה יֵּלֶד יוֹם.',
    transliteration: 'Ein adam yodea mah yeled yom.',
    vuk: 'ejn adam jodea ma jeled jom.',
    serbian: 'Niko ne zna šta sutrašnji dan može doneti.',
    english: 'No one knows what a new day may bring forth.',
    source: 'Mishlei 27:1 / Hebrejski idiom',
    type: 'proverb',
    keywords: ['יום', 'מחר', 'עתיד', 'הפתעה', 'לדעת', 'ילד']
  },
  {
    id: 'hp-90',
    hebrew: 'חֲתוּל בְּשַׂק',
    transliteration: 'Chatul besak',
    vuk: 'hatul besak',
    serbian: '„Mačka u džaku“ — Kupiti ili prihvatiti nešto na slepo.',
    english: 'A cat in a sack — Buying or accepting something sight unseen.',
    literalNote: 'Doslovno: „Mačka u vreći“',
    source: 'Hebrejski idiom (נִיב)',
    type: 'idiom',
    keywords: ['חתול', 'לקנות', 'חנות', 'שוק', 'חוזה', 'בטוח']
  },
  {
    id: 'hp-91',
    hebrew: 'הַדֶּשֶׁא שֶׁל הַשָּׁכֵן יָרֹק יוֹתֵר.',
    transliteration: 'Hadeshe shel hashachen yarok yoter.',
    vuk: 'hadeše šel hašahen jarok joter.',
    serbian: 'Komšijina trava uvek izgleda zelenija.',
    english: 'The grass is always greener on the other side.',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['קנאה', 'ירוק', 'שמח', 'טבע', 'פרח', 'פארק']
  },
  {
    id: 'hp-92',
    hebrew: 'כָּל עַכָּבָה לְטוֹבָה.',
    transliteration: 'Kol akavah letovah.',
    vuk: 'kol akava letova.',
    serbian: 'Svako odlaganje je na kraju za neko dobro.',
    english: 'Every delay turns out for the best.',
    source: 'Izraelska narodna poslovica',
    type: 'proverb',
    keywords: ['לחכות', 'לעצור', 'טוב', 'זמן', 'סבלנות', 'איטי', 'רכבת', 'אוטובוס', 'מטוס']
  },
  {
    id: 'hp-93',
    hebrew: 'טוֹב צִפּוֹר אַחַת בַּיָּד מִשְּׁתַּיִם עַל הָעֵץ.',
    transliteration: 'Tov tzipor achat bayad mishtayim al haetz.',
    vuk: 'tov cipor ahat bajad mištajim al haec.',
    serbian: 'Bolje vrabac u ruci nego golub na grani.',
    english: 'A bird in the hand is worth two in the bush.',
    source: 'Hebrejska poslovica',
    type: 'proverb',
    keywords: ['ציפור', 'יד', 'עץ', 'אחד', 'שניים', 'בטוח', 'החלטה']
  },
  {
    id: 'hp-94',
    hebrew: 'הַתַּפּוּחַ לֹא נוֹפֵל רָחוֹק מֵהָעֵץ.',
    transliteration: 'Hatapuach lo nofel rachok mehaetz.',
    vuk: 'hatapuah lo nofel rahok mehaec.',
    serbian: 'Jabuka ne pada daleko od stabla.',
    english: 'The apple does not fall far from the tree.',
    source: 'Hebrejska poslovica',
    type: 'proverb',
    keywords: ['תפוח', 'עץ', 'רחוק', 'קרוב', 'אבא', 'אמא', 'משפחה', 'ילד', 'בן', 'בת']
  },
  {
    id: 'hp-95',
    hebrew: 'עַל טַעַם וְעַל רֵיחַ אֵין לְהִתְוַכֵּחַ.',
    transliteration: 'Al taam veal reach ein lehitvakeach.',
    vuk: 'al taam veal reah ejn lehitvakeah.',
    serbian: 'O ukusima i mirisima ne vredi raspravljati.',
    english: 'There is no arguing about taste and aroma.',
    source: 'Izraelska poslovica',
    type: 'proverb',
    keywords: ['אוכל', 'מתוק', 'מר', 'חמוץ', 'מלוח', 'חריף', 'קפה', 'תה', 'סלט', 'חומוס', 'פלאפל', 'מסעדה']
  },
  {
    id: 'hp-96',
    hebrew: 'מֵעֵז יָצָא מָתוֹק.',
    transliteration: 'Meaz yatza matok.',
    vuk: 'meaz jaca matok.',
    serbian: 'Iz snage i teškog iskušenja izašlo je nešto slatko.',
    english: 'Out of the strong came forth something sweet.',
    literalNote: 'Samsonova zagonetka (Sudije 14:14) o medu u lavu',
    source: 'Šoftim (Sudije) 14:14',
    type: 'biblical',
    keywords: ['מתוק', 'אריה', 'דבש', 'דבורה', 'חזק', 'לצאת', 'אננס', 'בננה', 'תפוז', 'ענבים', 'אבטיח', 'רימון', 'תאנה']
  },
  {
    id: 'hp-97',
    hebrew: 'לְנַסּוֹת זֶה לֹא עוֹלֶה כֶּסֶף.',
    transliteration: 'Lenasot zeh lo oleh kesef.',
    vuk: 'lenasot ze lo ole kesef.',
    serbian: 'Pokušati ništa ne košta.',
    english: 'Trying costs nothing.',
    source: 'Izraelska poslovica',
    type: 'proverb',
    keywords: ['לנסות', 'כסף', 'כמה', 'הזדמנות', 'ניסיון', 'חינם']
  },
  {
    id: 'hp-98',
    hebrew: 'מִתּוֹךְ הַחֹשֶׁךְ יוֹצֵא אוֹר.',
    transliteration: 'Mitoch hachoshech yotzei or.',
    vuk: 'mitoh hahošeh jocej or.',
    serbian: 'Iz same tame rađa se najjasnija svetlost.',
    english: 'Out of darkness emerges light.',
    source: 'Jevrejska mudrost',
    type: 'hasidic',
    keywords: ['אור', 'לילה', 'ירח', 'כוכב', 'שמש', 'תקווה', 'התעוררות']
  },
  {
    id: 'hp-99',
    hebrew: 'בְּלִי סָפֵק, מַיִם שְׁקֵטִים חוֹדְרִים עָמֹק.',
    transliteration: 'Mayim shketim chodrim amok.',
    vuk: 'majim šketim hodrim amok.',
    serbian: 'Tiha voda breg roni (prodire duboko).',
    english: 'Still waters run deep.',
    source: 'Hebrejska poslovica',
    type: 'proverb',
    keywords: ['מים', 'שקט', 'נהר', 'אגם', 'ים', 'לשחות', 'ענווה']
  },
  {
    id: 'hp-100',
    hebrew: 'אֵין חָכָם כְּבַעַל הַנִּסָּיוֹן.',
    transliteration: 'Ein chacham kevaal hanisayon.',
    vuk: 'ejn haham kevaal hanisajon.',
    serbian: 'Nema većeg mudraca od čoveka sa životnim iskustvom.',
    english: 'There is no sage wiser than one with real experience.',
    source: 'Jevrejska poslovica',
    type: 'proverb',
    keywords: ['ניסיון', 'חכם', 'זקן', 'צעיר', 'לדעת', 'חכמה', 'כישרון']
  },
  {
    id: 'hp-101',
    hebrew: 'יְהִי רָצוֹן שֶׁנִּהְיֶה לְרֹאשׁ וְלֹא לְזָנָב.',
    transliteration: 'Yehi ratzon shenihyeh lerosh velo lezanav.',
    vuk: 'jehi racon šenihje leroš velo lezanav.',
    serbian: 'Neka budemo glava (predvodnici), a ne rep (sledbenici).',
    english: 'May we be the head and not the tail.',
    literalNote: 'Tradicionalni blagoslov za Roš Hašanu (Jevrejsku Novu godinu)',
    source: 'Devarim 28:13 / Roš Hašana',
    type: 'biblical',
    keywords: ['ראש', 'דג', 'שנה', 'מנהיג', 'ראשון', 'אחרון', 'רצון']
  },
  {
    id: 'hp-102',
    hebrew: 'שֶׁנִּרְבֶּה זְכֻיּוֹת כְּרִמּוֹן.',
    transliteration: 'Shenirbeh zechuyot kerimon.',
    vuk: 'šenirbe zehujot kerimon.',
    serbian: 'Neka naša dobra dela budu brojna poput semenki nara.',
    english: 'May our merits be as abundant as the seeds of a pomegranate.',
    source: 'Tradicionalni blagoslov (Roš Hašana)',
    type: 'proverb',
    keywords: ['רימון', 'ברכה', 'פרי', 'מתוק', 'הרבה', 'שנה']
  },
  {
    id: 'hp-103',
    hebrew: 'פַּעַם שְׁלִישִׁית גְּלִידָה!',
    transliteration: 'Paam shlishit glidah!',
    vuk: 'paam šlišit glida!',
    serbian: '„Treći put — sladoled!“ (Kad nekoga sretneš treći put slučajno, časti sladoledom!)',
    english: 'Third time’s ice cream! (Israeli idiom when bumping into someone a 3rd time)',
    literalNote: 'Omiljeni izraelski izraz kad se sa prijateljem slučajno sretneš tri puta',
    source: 'Savremeni izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['גלידה', 'שלוש', 'לפגוש', 'להכיר', 'חבר', 'הפתעה']
  },
  {
    id: 'hp-104',
    hebrew: 'חֲבָל עַל הַזְּמַן!',
    transliteration: 'Chaval al hazman!',
    vuk: 'haval al hazman!',
    serbian: '„Šteta reči / Fantastično!“ — Toliko je dobro da reči ne mogu opisati!',
    english: 'Out of this world / Amazing! (Literally: a waste of time to even try describing how great it is)',
    literalNote: 'Jedan od najpoznatijih izraelskih kolokvijalnih idioma za oduševljenje',
    source: 'Savremeni izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['חבל', 'זמן', 'מצוין', 'נהדר', 'סבבה', 'ממש', 'תותח']
  },
  {
    id: 'hp-105',
    hebrew: 'לָשִׂים קְצָת פִּלְפֵּל בַּחַיִּים.',
    transliteration: 'Lasim ktzat pilpel bachaim.',
    vuk: 'lasim kcat pilpel bahajim.',
    serbian: 'Dodati malo bibera (strasti i živosti) u život.',
    english: 'To add a little spice and zest to life.',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['חריף', 'מלח', 'לבשל', 'מטבח', 'מרק', 'בצל', 'שום', 'עגבנייה', 'מלפפון']
  },
  {
    id: 'hp-106',
    hebrew: 'כָּל הַכָּבוֹד! עֲבוֹדָה מְצֻיֶּנֶת.',
    transliteration: 'Kol hakavod! Avodah metzuyenet.',
    vuk: 'kol hakavod! avoda mecujenet.',
    serbian: 'Svaka čast! Izvanredan rad.',
    english: 'All the honor to you! Outstanding work.',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['כבוד', 'עבודה', 'מצוין', 'נהדר', 'מצוינות', 'להצליח', 'כישרון']
  },
  {
    id: 'hp-107',
    hebrew: 'נֶפֶשׁ בְּרִיאָה בְּגוּף בָּרִיא.',
    transliteration: 'Nefesh briah beguf bari.',
    vuk: 'nefeš bria beguf bari.',
    serbian: 'Zdrav duh u zdravom telu.',
    english: 'A healthy mind in a healthy body.',
    source: 'Majmonid (Rambam) — Hilchot Deot',
    type: 'proverb',
    keywords: ['בריאות', 'גוף', 'ספורט', 'כושר', 'שריר', 'עצם', 'דם', 'גב', 'כתף', 'ברך', 'ריצה', 'שחייה', 'מרץ', 'אימון']
  },
  {
    id: 'hp-108',
    hebrew: 'הָאוֹכֶל יִהְיֶה תְּרוּפָתְךָ, וּתְרוּפָתְךָ תִּהְיֶה אוֹכֶל.',
    transliteration: 'Haochel yihyeh terufatcha, uterufatcha tihyeh ochel.',
    vuk: 'haohel jihje terufatha, uterufatha tihje ohel.',
    serbian: 'Neka tvoja hrana bude tvoj lek, a tvoj lek tvoja hrana.',
    english: 'Let your food be your medicine, and your medicine be your food.',
    source: 'Majmonid (Rambam) — Medicinski traktati',
    type: 'proverb',
    keywords: ['אוכל', 'תרופה', 'רופא', 'בית חולים', 'בריאות', 'סלט', 'ארוחת', 'ביצה', 'גבינה', 'חלב', 'בשר', 'אורז']
  },
  {
    id: 'hp-109',
    hebrew: 'לִפְתֹּחַ דַּף חָדָשׁ.',
    transliteration: 'Liftoach daf chadash.',
    vuk: 'liftoah daf hadaš.',
    serbian: '„Otvoriti novu stranicu“ — Započeti novo poglavlje života.',
    english: 'To turn over a new leaf / start a fresh chapter.',
    literalNote: 'Doslovno: „Otvoriti novi list“',
    source: 'Hebrejski idiom (נִיב)',
    type: 'idiom',
    keywords: ['לפתוח', 'חדש', 'ספר', 'ספרייה', 'לכתוב', 'לקרוא', 'התחלה', 'שינוי']
  },
  {
    id: 'hp-110',
    hebrew: 'לִסְגֹּר מַעְגָּל.',
    transliteration: 'Lisgor maagal.',
    vuk: 'lisgor maagal.',
    serbian: '„Zatvoriti krug“ — Doći do potpunog završetka i unutrašnjeg mira.',
    english: 'To come full circle — Achieving closure and completion.',
    literalNote: 'Doslovno: „Zatvoriti krug“',
    source: 'Izraelski idiom (נִיב)',
    type: 'idiom',
    keywords: ['לסגור', 'לסיים', 'סוף', 'חזור', 'סגור', 'פתוח']
  },
  {
    id: 'hp-111',
    hebrew: 'יָצָא הַמַּרְצֵעַ מִן הַשַּׂק.',
    transliteration: 'Yatza hamartzea min hasak.',
    vuk: 'jaca hamarcea min hasak.',
    serbian: 'Istina je konačno izašla na videlo.',
    english: 'The cat is out of the bag / The hidden truth has come to light.',
    literalNote: 'Doslovno: „Šilo je izašlo iz vreće“',
    source: 'Hebrejski idiom (נִיב)',
    type: 'idiom',
    keywords: ['סוד', 'לגלות', 'אמת', 'לצאת', 'אמיתי']
  },
  {
    id: 'hp-112',
    hebrew: 'עַל הַבֹּקֶר — יוֹם חָדָשׁ, הִזְדַּמְּנוּת חֲדָשָׁה.',
    transliteration: 'Al haboker — yom chadash, hizdamnut chadashah.',
    vuk: 'al haboker — jom hadaš, hizdamnut hadaša.',
    serbian: 'Sa jutrom stiže novi dan i nova prilika.',
    english: 'With morning arrives a brand-new day and a fresh opportunity.',
    source: 'Izraelska mudrost',
    type: 'proverb',
    keywords: ['הזדמנות', 'בוקר', 'קפה', 'תה', 'ארוחת בוקר', 'עכשיו', 'היום']
  },
  {
    id: 'hp-113',
    hebrew: 'שְׁמֹר עַל הַלָּשׁוֹן — לֹא כָּל מַה שֶּׁחֹשְׁבִים צָרִיךְ לְהַגִּיד.',
    transliteration: 'Shmor al halashon — lo kol mah shechoshvim tzarich lehagid.',
    vuk: 'šmor al halašon — lo kol ma šehošvim carih lehagid.',
    serbian: 'Čuvaj jezik — ne mora se izgovoriti svaka misao.',
    english: 'Guard your tongue — not every passing thought needs to be spoken.',
    source: 'Hafec Haim (Etika govora)',
    type: 'proverb',
    keywords: ['פה', 'לדבר', 'אמר', 'זהירות', 'שתיקה', 'אוזן', 'אף']
  },
  {
    id: 'hp-114',
    hebrew: 'כֶּלֶב נוֹבֵחַ אֵינוֹ נוֹשֵׁךְ.',
    transliteration: 'Kelev noveach eino noshech.',
    vuk: 'kelev noveah ejno nošeh.',
    serbian: 'Pas koji mnogo laje ne ujeda.',
    english: 'A barking dog seldom bites.',
    source: 'Hebrejska narodna poslovica',
    type: 'proverb',
    keywords: ['כלב', 'רעש', 'שקט', 'פחד', 'אריה', 'סוס']
  },
  {
    id: 'hp-115',
    hebrew: 'רֹאשׁ בָּעֲנָנִים, רַגְלַיִם עַל הַקַּרְקַע.',
    transliteration: 'Rosh baananim, raglayim al hakarka.',
    vuk: 'roš baananim, raglajim al hakarka.',
    serbian: 'Glava u oblacima (veliki snovi), ali noge čvrsto na zemlji.',
    english: 'Head in the clouds, feet firmly planted on the ground.',
    source: 'Izraelska mudrost',
    type: 'idiom',
    keywords: ['ענן', 'שמיים', 'אדמה', 'חלום', 'הר', 'מטוס', 'לטוס', 'איזון']
  },
  {
    id: 'hp-116',
    hebrew: 'אַחֲרֵי הַגֶּשֶׁם תָּמִיד יוֹצֵאת הַשֶּׁמֶשׁ.',
    transliteration: 'Acharei hageshem tamid yotzet hashemesh.',
    vuk: 'aharej hagešem tamid jocet hašemeš.',
    serbian: 'Posle svake kiše uvek izađe sunce.',
    english: 'After the rain, the sun always shines again.',
    source: 'Izraelska poslovica',
    type: 'proverb',
    keywords: ['גשם', 'שלג', 'ענן', 'חורף', 'אביב', 'קיץ', 'סתיו', 'שמש', 'תקווה']
  },
  {
    id: 'hp-117',
    hebrew: 'טוֹב לָגֶשֶׁת לַשּׁוּק עִם רֹאשׁ צָלוּל.',
    transliteration: 'Tov lageshet lashuk im rosh tzalul.',
    vuk: 'tov lagešet lašuk im roš calul.',
    serbian: 'Na pijacu i u posao najbolje je doći bistre glave.',
    english: 'It is best to enter the marketplace with a clear head.',
    source: 'Hebrejska poslovica',
    type: 'proverb',
    keywords: ['שוק', 'חנות', 'לקנות', 'למכור', 'מכר', 'עסק', 'פגישה', 'חשבון', 'חוזה']
  },
  {
    id: 'hp-118',
    hebrew: 'הַטֶּכְנוֹלוֹגְיָה מְשָׁרֶתֶת אֶת הָאָדָם, וְלֹא הָאָדָם אֶת הַטֶּכְנוֹלוֹגְיָה.',
    transliteration: 'Hatechnologiyah mesharetet et haadam, velo haadam et hatechnologiyah.',
    vuk: 'hatehnologija mešaretet et haadam, velo haadam et hatehnologija.',
    serbian: 'Tehnologija služi čoveku, a ne čovek tehnologiji.',
    english: 'Technology exists to serve humanity, not humanity to serve technology.',
    source: 'Savremena izraelska mudrost (Start-Up Nation)',
    type: 'proverb',
    keywords: ['טכנולוגיה', 'מחשב', 'טלפון', 'מסך', 'תוכנה', 'רשת', 'קובץ', 'תיקייה', 'משתמש', 'סיסמה', 'חדשנות']
  },
  {
    id: 'hp-119',
    hebrew: 'יְשׁוּעַת ה\' כְּהֶרֶף עַיִן.',
    transliteration: 'Yeshuat Hashem keheref ayin.',
    vuk: 'ješuat hašem keheref ajin.',
    serbian: 'Spasenje i preokret mogu doći u treptaju oka.',
    english: 'Breakthrough and deliverance can arrive in the blink of an eye.',
    source: 'Midraš / Jevrejska poslovica',
    type: 'proverb',
    keywords: ['עין', 'רגע', 'מהיר', 'מהירות', 'תקווה', 'הפתעה', 'אמונה']
  },
  {
    id: 'hp-120',
    hebrew: 'כָּל הַיִּשְׂרְאֵלִים עֲרֵבִים זֶה לָזֶה.',
    transliteration: 'Kol Yisrael arevim zeh lazeh.',
    vuk: 'kol jisrael arevim ze laze.',
    serbian: 'Svi smo odgovorni jedni za druge.',
    english: 'All people in a community are mutually responsible for one another.',
    source: 'Talmud Ševuot 39a',
    type: 'talmud',
    keywords: ['אחריות', 'שיתוף', 'עיר', 'מדינה', 'קהילה', 'לעזור', 'כולם']
  },
  {
    id: 'hp-121',
    hebrew: 'לְמַעַן אֲחַי וְרֵעָי אֲדַבְּרָה נָּא שָׁלוֹם בָּךְ.',
    transliteration: 'Lemaan achai vereai adabrah na shalom bach.',
    vuk: 'lemaan ahaj vereaj adabra na šalom bah.',
    serbian: 'Radi braće svoje i prijatelja svojih, govoriću: Mir neka je u tebi.',
    english: 'For the sake of my brothers and friends, I will speak peace within you.',
    source: 'Tehillim 122:8',
    type: 'biblical',
    keywords: ['אח', 'אחות', 'חבר', 'שלום', 'ידידות', 'ירושלים']
  },
  {
    id: 'hp-122',
    hebrew: 'אוֹרֵחַ לְרֶגַע רוֹאֶה כָּל פֶּגַע.',
    transliteration: 'Oreach lerega roeh kol pega.',
    vuk: 'oreah lerega roe kol pega.',
    serbian: 'Gost koji dođe na kratko često uoči ono što domaćin više ne primećuje.',
    english: 'A guest for a moment notices every flaw (fresh eyes see clearest).',
    source: 'Hebrejska poslovica',
    type: 'proverb',
    keywords: ['רגע', 'לראות', 'מלון', 'בית', 'דלת', 'נקי', 'מלוכלך', 'מדויק']
  },
  {
    id: 'hp-123',
    hebrew: 'יֵשׁ תִּקְוָה לְאַחֲרִיתֵךְ.',
    transliteration: 'Yesh tikvah leacharitech.',
    vuk: 'ješ tikva leahariteh.',
    serbian: 'Postoji svetla nada za tvoju budućnost.',
    english: 'There is bright hope for your future.',
    source: 'Jirmejahu (Jeremija) 31:16',
    type: 'biblical',
    keywords: ['יש', 'תקווה', 'לקוות', 'עתיד', 'חלום', 'געגועים']
  },
  {
    id: 'hp-124',
    hebrew: 'מִזֶּה הַדֶּרֶךְ אֶל הַכּוֹכָבִים — צַעַד אַחֲרֵי צַעַד.',
    transliteration: 'Tzaad acharei tzaad magiim lepisgat hahar.',
    vuk: 'caad aharej caad magiim lepisgat hahar.',
    serbian: 'Korak po korak stiže se do vrha svake planine.',
    english: 'Step by step, one reaches the summit of the mountain.',
    source: 'Izraelska mudrost',
    type: 'proverb',
    keywords: ['הר', 'מדבר', 'ללכת', 'להמשיך', 'התמדה', 'מטרה', 'מסע', 'מרחק']
  },
  {
    id: 'hp-125',
    hebrew: 'הוֹדוּ לַה\' כִּי טוֹב, כִּי לְעוֹלָם חַסְדּוֹ.',
    transliteration: 'Hodu laHashem ki tov, ki leolam chasdo.',
    vuk: 'hodu lahašem ki tov, ki leolam hasdo.',
    serbian: 'Zahvaljujte jer je dobro, jer večna je dobrota Njegova.',
    english: 'Give thanks for it is good, for enduring kindness lasts forever.',
    source: 'Tehillim 118:1',
    type: 'biblical',
    keywords: ['תודה', 'להודות', 'ברוך', 'חסד', 'טוב', 'הוד']
  },
  {
    id: 'hp-126',
    hebrew: 'דְּרָכֶיהָ דַרְכֵי נֹעַם וְכָל נְתִיבוֹתֶיהָ שָׁלוֹם.',
    transliteration: 'Deracheha darchei noam vechol netivoteha shalom.',
    vuk: 'deraheha darhej noam vehol netivoteha šalom.',
    serbian: 'Njeni putevi su putevi blagosti i sve njene staze vode u mir.',
    english: 'Her ways are ways of pleasantness, and all her paths are peace.',
    source: 'Mishlei 3:17',
    type: 'biblical',
    keywords: ['בבקשה', 'נעים', 'דרך', 'שלום', 'תורה', 'הרמוניה']
  },
  {
    id: 'hp-127',
    hebrew: 'כִּי עִמְּךָ הַסְּלִיחָה לְמַעַן תִּוָּרֵא.',
    transliteration: 'Ki imcha haselichah lemaan tivarei.',
    vuk: 'ki imha haseliha lemaan tivarej.',
    serbian: 'Jer kod Tebe je oproštaj, da bi srce živelo u poštovanju.',
    english: 'With You is forgiveness, inspiring genuine reverence.',
    source: 'Tehillim 130:4',
    type: 'biblical',
    keywords: ['סליחה', 'תשובה', 'חמלה', 'שלום']
  },
  {
    id: 'hp-128',
    hebrew: 'יִתְגַּבֵּר כַּאֲרִי לַעֲמֹד בַּבֹּקֶר.',
    transliteration: 'Yitgaber kaari laamod baboker.',
    vuk: 'jitgaber kaari laamod baboker.',
    serbian: 'Budi snažan i odlučan kao lav kada ustaješ ujutro.',
    english: 'Be as mighty and resolute as a lion when rising in the morning.',
    source: 'Šulhan Aruh (Orah Haim 1:1)',
    type: 'talmud',
    keywords: ['אריה', 'בוקר', 'לעמוד', 'גבורה', 'אומץ', 'משמעת', 'כח', 'אימון']
  },
  {
    id: 'hp-129',
    hebrew: 'לְמוּדֵי סֵפֶר הֵם בּוֹנֵי הָעָתִיד.',
    transliteration: 'Hasefer hu hachaver haneeman beyoter.',
    vuk: 'hasefer hu hahaver haneeman bejoter.',
    serbian: 'Dobra knjiga je najverniji prijatelj na svakom putovanju.',
    english: 'A great book is the most faithful companion on any journey.',
    source: 'Jevrejska kulturna mudrost (Narod Knjige)',
    type: 'proverb',
    keywords: ['ספר', 'ספרייה', 'אוניברסיטה', 'בית ספר', 'מוזיאון', 'לקרוא', 'לכתוב', 'תרבות', 'חינוך']
  },
  {
    id: 'hp-130',
    hebrew: 'לִפְנֵי שֶׁתָּרוּץ — וַדֵּא שֶׁאַתָּה בַּכִּוּוּן הַנָּכוֹן.',
    transliteration: 'Lifnei shetarutz — vade sheatah bakivun hanachon.',
    vuk: 'lifnej šetaruc — vade šeata bakivun hanahon.',
    serbian: 'Pre nego što potrčiš, uveri se da ideš u pravom smeru.',
    english: 'Before you start running, make sure you are heading in the right direction.',
    source: 'Izraelska strateška mudrost',
    type: 'proverb',
    keywords: ['לרוץ', 'ריצה', 'מהיר', 'מהירות', 'אסטרטגיה', 'כוונה', 'מטרה', 'נכון', 'מדויק', 'רכבת', 'מכונית', 'תחנה', 'דרכון', 'כרטיס', 'שדה תעופה']
  }
];

// Fast normalized index built once for O(1) exact/keyword proverb matching
const PROVERB_KEYWORD_MAP: Map<string, HebrewProverbEntry> = new Map();
for (const entry of HEBREW_PROVERBS_AND_IDIOMS) {
  for (const kw of entry.keywords) {
    const norm = stripNikud(kw);
    if (norm && !PROVERB_KEYWORD_MAP.has(norm)) {
      PROVERB_KEYWORD_MAP.set(norm, entry);
    }
  }
}

export function findHebrewProverbForWord(char: string, root?: string, category?: string): HebrewProverbEntry {
  const normChar = stripNikud(char);

  // 1. Direct normalized word match
  if (PROVERB_KEYWORD_MAP.has(normChar)) {
    return PROVERB_KEYWORD_MAP.get(normChar)!;
  }

  // 2. Multi-word phrase token match (e.g. "תודה רבה" -> "תודה")
  const tokens = normChar.split(/\s+/).filter(Boolean);
  for (const tok of tokens) {
    if (PROVERB_KEYWORD_MAP.has(tok)) {
      return PROVERB_KEYWORD_MAP.get(tok)!;
    }
    // Strip common Hebrew prefixes (ה, ו, ל, ב, מ, כ, ש)
    if (tok.length > 2 && /^[הולבמכש]/.test(tok)) {
      const stripped = tok.slice(1);
      if (PROVERB_KEYWORD_MAP.has(stripped)) {
        return PROVERB_KEYWORD_MAP.get(stripped)!;
      }
    }
  }

  // 3. Direct substring match inside actual Hebrew proverb text
  if (normChar.length >= 2) {
    const directTextMatch = HEBREW_PROVERBS_AND_IDIOMS.find(p =>
      stripNikud(p.hebrew).includes(normChar)
    );
    if (directTextMatch) return directTextMatch;
  }

  // 4. Shoresh (3-letter root) match
  if (root) {
    const normRoot = stripNikud(root);
    if (PROVERB_KEYWORD_MAP.has(normRoot)) {
      return PROVERB_KEYWORD_MAP.get(normRoot)!;
    }
  }

  // 5. Category-aware deterministic distribution across the full 130-entry collection
  const categoryPoolMap: Record<string, HebrewProverbType[]> = {
    mudrost: ['talmud', 'hasidic', 'biblical'],
    misaoni: ['talmud', 'hasidic'],
    glagoli: ['talmud', 'idiom', 'proverb'],
    svakodnevno: ['idiom', 'proverb', 'talmud'],
    hrana: ['idiom', 'proverb', 'biblical'],
    priroda: ['biblical', 'proverb', 'hasidic'],
    zdravlje: ['proverb', 'biblical', 'hasidic'],
    posao_tehnologija: ['idiom', 'proverb', 'talmud'],
    vreme_brojevi: ['biblical', 'proverb', 'idiom'],
    emocije: ['hasidic', 'biblical', 'idiom']
  };

  const preferredTypes = category ? categoryPoolMap[category] : undefined;
  const pool = preferredTypes
    ? HEBREW_PROVERBS_AND_IDIOMS.filter(p => preferredTypes.includes(p.type))
    : HEBREW_PROVERBS_AND_IDIOMS;

  const activePool = pool.length > 0 ? pool : HEBREW_PROVERBS_AND_IDIOMS;
  let hash = 0;
  for (let i = 0; i < normChar.length; i++) {
    hash = (hash << 5) - hash + normChar.charCodeAt(i);
  }
  return activePool[Math.abs(hash) % activePool.length];
}
