import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Trophy, 
  BookOpen, 
  Award, 
  Gamepad2, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy, 
  Check,
  Zap,
  LayoutGrid,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface HebrewVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

export interface HebrewVocabItem {
  id: string;
  char: string;
  transliteration: string;
  vuk: string;
  translation: string;
  english: string;
  emoji: string;
  category: 'mudrost' | 'svakodnevno' | 'priroda' | 'glagoli' | 'misaoni';
  categoryLabel: string;
  root?: string;
  visualTip?: string;
}

const HEBREW_VOCAB_DATA: HebrewVocabItem[] = [
  // Mudrost & Filozofija (30 items)
  { id: 'h1', char: 'שָׁלוֹם', transliteration: 'Shalom', vuk: 'šalom', translation: 'Mir / Spokoj', english: 'Peace / Harmony / Hello', emoji: '🕊️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-ל-ם', visualTip: 'Wholeness & total harmony' },
  { id: 'h2', char: 'אַהֲבָה', transliteration: 'Ahava', vuk: 'ahava', translation: 'Ljubav', english: 'Love', emoji: '💖', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-ה-ב', visualTip: 'Unconditional heart connection' },
  { id: 'h3', char: 'אוֹר', transliteration: 'Or', vuk: 'or', translation: 'Svetlost', english: 'Light', emoji: '✨', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-ו-ר', visualTip: 'Illuminating spark in dark' },
  { id: 'h4', char: 'חַיִּים', transliteration: 'Chaim', vuk: 'chajim', translation: 'Život', english: 'Life', emoji: '🌱', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-י-ה', visualTip: 'Plural form: two-fold vital breath' },
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
  { id: '20', char: 'רוּחַ', transliteration: 'Ruach', vuk: 'ruah', translation: 'Duh / Vetar', english: 'Spirit / Wind', emoji: '💨', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ר-ו-ח', visualTip: 'Invisible driving energy' },
  { id: 'h21', char: 'חֶסֶד', transliteration: 'Chesed', vuk: 'hesed', translation: 'Dobrota / Milost', english: 'Kindness / Loving-kindness', emoji: '🤝', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ח-ס-ד', visualTip: 'Active empathy and grace' },
  { id: 'h22', char: 'צֶדֶק', transliteration: 'Tzedek', vuk: 'cedek', translation: 'Pravda', english: 'Justice / Righteousness', emoji: '⚖️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'צ-ד-ק', visualTip: 'Moral equilibrium' },
  { id: 'h23', char: 'תְּשׁוּבָה', transliteration: 'Teshuva', vuk: 'tešuva', translation: 'Povratak / Obnova', english: 'Return / Repentance', emoji: '🔄', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ש-ו-ב', visualTip: 'Returning to core purpose' },
  { id: 'h24', char: 'עוֹלָם', transliteration: 'Olam', vuk: 'olam', translation: 'Svet / Večnost', english: 'World / Eternity', emoji: '🌍', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ע-ל-ם', visualTip: 'Hidden vast cosmos' },
  { id: 'h25', char: 'בִּינָה', transliteration: 'Binah', vuk: 'bina', translation: 'Razumevanje', english: 'Understanding / Discernment', emoji: '🧠', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ב-י-ן', visualTip: 'Analytical connection between ideas' },
  { id: 'h26', char: 'דַּעַת', transliteration: 'Daat', vuk: 'daat', translation: 'Znanje / Svest', english: 'Knowledge / Awareness', emoji: '💡', category: 'mudrost', categoryLabel: 'Mudrost', root: 'י-ד-ע', visualTip: 'Experiential realization' },
  { id: 'h27', char: 'אֱמוּנָה', transliteration: 'Emunah', vuk: 'emuna', translation: 'Vera / Poverenje', english: 'Faith / Trust', emoji: '🛡️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'א-מ-ן', visualTip: 'Unshakable conviction' },
  { id: 'h28', char: 'סַבְלָנוּת', transliteration: 'Savlanut', vuk: 'savlanut', translation: 'Strpljenje', english: 'Patience / Endurance', emoji: '⏳', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ס-ב-ל', visualTip: 'Bearing heavy loads gracefully' },
  { id: 'h29', char: 'עֲנָוָה', transliteration: 'Anavah', vuk: 'anava', translation: 'Skromnost', english: 'Humility / Modesty', emoji: '🌾', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ע-נ-ה', visualTip: 'Occupying your true space' },
  { id: 'h30', char: 'גְּבוּרָה', transliteration: 'Gvurah', vuk: 'gvura', translation: 'Hrabrost / Disciplina', english: 'Courage / Restraint', emoji: '🛡️', category: 'mudrost', categoryLabel: 'Mudrost', root: 'ג-ב-ר', visualTip: 'Inner self-conquest' },

  // Svakodnevno & Imenice (30 items)
  { id: 'h31', char: 'תּוֹדָה', transliteration: 'Todah', vuk: 'toda', translation: 'Hvala', english: 'Thank you', emoji: '🙏', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h32', char: 'בְּבַקָּשָׁה', transliteration: 'Bevakasha', vuk: 'bevakaša', translation: 'Molim / Nema na čemu', english: 'Please / You are welcome', emoji: '😊', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h33', char: 'לְהִתְרָאוֹת', transliteration: 'Lehitraot', vuk: 'lehitraot', translation: 'Doviđenja', english: 'Goodbye / See you later', emoji: '👋', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h34', char: 'בֹּקֶר טוֹב', transliteration: 'Boker Tov', vuk: 'boker tov', translation: 'Dobro jutro', english: 'Good morning', emoji: '🌅', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h35', char: 'לַיְלָה טוֹב', transliteration: 'Layla Tov', vuk: 'lajla tov', translation: 'Laku noć', english: 'Good night', emoji: '🌙', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h36', char: 'כֵּן', transliteration: 'Ken', vuk: 'ken', translation: 'Da', english: 'Yes', emoji: '✅', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h37', char: 'לֹא', transliteration: 'Lo', vuk: 'lo', translation: 'Ne', english: 'No', emoji: '❌', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h38', char: 'סְלִיחָה', transliteration: 'Slicha', vuk: 'sliha', translation: 'Izvini / Oprostite', english: 'Sorry / Excuse me', emoji: '🙇', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h39', char: 'בַּיִת', transliteration: 'Bayit', vuk: 'bajit', translation: 'Kuća / Dom', english: 'House / Home', emoji: '🏠', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h40', char: 'מַפְתֵּחַ', transliteration: 'Mafteach', vuk: 'mafteah', translation: 'Ključ', english: 'Key', emoji: '🔑', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h41', char: 'סֵפֶר', transliteration: 'Sefer', vuk: 'sefer', translation: 'Knjiga', english: 'Book', emoji: '📖', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h42', char: 'מַיִם', transliteration: 'Mayim', vuk: 'majim', translation: 'Voda', english: 'Water', emoji: '💧', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h43', char: 'לֶחֶם', transliteration: 'Lechem', vuk: 'lehem', translation: 'Hleb', english: 'Bread', emoji: '🍞', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h44', char: 'יַיִן', transliteration: 'Yayin', vuk: 'jajin', translation: 'Vino', english: 'Wine', emoji: '🍷', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h45', char: 'כֶּסֶף', transliteration: 'Kesef', vuk: 'kesef', translation: 'Novac / Srebro', english: 'Money / Silver', emoji: '💵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h46', char: 'חָבֵר', transliteration: 'Chaver', vuk: 'haver', translation: 'Prijatelj', english: 'Friend', emoji: '🤝', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h47', char: 'מִשְׁפָּחָה', transliteration: 'Mishpacha', vuk: 'mišpaha', translation: 'Porodica', english: 'Family', emoji: '👨‍👩‍👧‍👦', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h48', char: 'אִישׁ', transliteration: 'Ish', vuk: 'iš', translation: 'Čovek / Muškarac', english: 'Man / Person', emoji: '🧔', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h49', char: 'אִשָּׁה', transliteration: 'Isha', vuk: 'iša', translation: 'Žena', english: 'Woman', emoji: '👩', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h50', char: 'יֶלֶד', transliteration: 'Yeled', vuk: 'jeled', translation: 'Dete / Dečak', english: 'Child / Boy', emoji: '👦', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h51', char: 'יוֹם', transliteration: 'Yom', vuk: 'jom', translation: 'Dan', english: 'Day', emoji: '☀️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h52', char: 'זְמַן', transliteration: 'Zman', vuk: 'zman', translation: 'Vreme', english: 'Time', emoji: '⏳', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h53', char: 'יְרוּשָׁלַיִם', transliteration: 'Yerushalayim', vuk: 'jerusalim', translation: 'Jerusalim', english: 'Jerusalem', emoji: '🕌', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h54', char: 'תֵּה', transliteration: 'Te', vuk: 'te', translation: 'Čaj', english: 'Tea', emoji: '🍵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h55', char: 'קָפֶה', transliteration: 'Kafe', vuk: 'kafe', translation: 'Kafa', english: 'Coffee', emoji: '☕', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h56', char: 'עִיר', transliteration: 'Ir', vuk: 'ir', translation: 'Grad', english: 'City / Town', emoji: '🏙️', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h57', char: 'מְכוֹנִית', transliteration: 'Mekhonit', vuk: 'mehonit', translation: 'Auto', english: 'Car / Vehicle', emoji: '🚗', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h58', char: 'טֶלֶפֿוֹן', transliteration: 'Telefon', vuk: 'telefon', translation: 'Telefon', english: 'Phone', emoji: '📱', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h59', char: 'מַחְשֵׁב', transliteration: 'Makhshev', vuk: 'mahšev', translation: 'Računar', english: 'Computer', emoji: '💻', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },
  { id: 'h60', char: 'שֻׁלְחָן', transliteration: 'Shulchan', vuk: 'šulhan', translation: 'Sto', english: 'Table / Desk', emoji: '🪵', category: 'svakodnevno', categoryLabel: 'Svakodnevno' },

  // Priroda & Stvaranje (25 items)
  { id: 'h61', char: 'אֶרֶץ', transliteration: 'Eretz', vuk: 'erec', translation: 'Zemlja / Tlo', english: 'Land / Earth', emoji: '🌍', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h62', char: 'שָׁמַיִם', transliteration: 'Shamayim', vuk: 'šamajim', translation: 'Nebo', english: 'Sky / Heavens', emoji: '☁️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h63', char: 'שֶׁמֶשׁ', transliteration: 'Shemesh', vuk: 'šemeš', translation: 'Sunce', english: 'Sun', emoji: '☀️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h64', char: 'יָרֵחַ', transliteration: 'Yareach', vuk: 'jareah', translation: 'Mesec', english: 'Moon', emoji: '🌙', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h65', char: 'כּוֹכָבִים', transliteration: 'Kokhavim', vuk: 'kohavim', translation: 'Zvezde', english: 'Stars', emoji: '🌟', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h66', char: 'אֵשׁ', transliteration: 'Esh', vuk: 'eš', translation: 'Vatra', english: 'Fire', emoji: '🔥', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h67', char: 'יָם', transliteration: 'Yam', vuk: 'jam', translation: 'More / Okean', english: 'Sea / Ocean', emoji: '🌊', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h68', char: 'הַר', transliteration: 'Har', vuk: 'har', translation: 'Planina', english: 'Mountain', emoji: '🏔️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h69', char: 'עֵץ', transliteration: 'Etz', vuk: 'ec', translation: 'Drvo', english: 'Tree', emoji: '🌳', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h70', char: 'פֶּרַח', transliteration: 'Perach', vuk: 'perah', translation: 'Cvet', english: 'Flower', emoji: '🌸', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h71', char: 'דֶּרֶךְ', transliteration: 'Derekh', vuk: 'derek', translation: 'Put / Staza', english: 'Way / Path / Road', emoji: '🛣️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h72', char: 'גַּן', transliteration: 'Gan', vuk: 'gan', translation: 'Bašta / Vrt', english: 'Garden', emoji: '🏡', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h73', char: 'גֶּשֶׁם', transliteration: 'Geshem', vuk: 'gešem', translation: 'Kiša', english: 'Rain', emoji: '🌧️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h74', char: 'נָהָר', transliteration: 'Nahar', vuk: 'nahar', translation: 'Reka', english: 'River', emoji: '🏞️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h75', char: 'אֲגַם', transliteration: 'Agam', vuk: 'agam', translation: 'Jezero', english: 'Lake', emoji: '🌊', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h76', char: 'מִדְבָּר', transliteration: 'Midbar', vuk: 'midbar', translation: 'Pustinja', english: 'Desert', emoji: '🏜️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h77', char: 'שָׂדֶה', transliteration: 'Sadeh', vuk: 'sade', translation: 'Polje', english: 'Field / Meadow', emoji: '🌾', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h78', char: 'עָנָן', transliteration: 'Anan', vuk: 'anan', translation: 'Oblak', english: 'Cloud', emoji: '☁️', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h79', char: 'אֲבָנִים', transliteration: 'Avanim', vuk: 'avanim', translation: 'Kamenje', english: 'Stones / Rocks', emoji: '🪨', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h80', char: 'חַיָּה', transliteration: 'Chayah', vuk: 'haja', translation: 'Životinja', english: 'Animal', emoji: '🦁', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h81', char: 'צִפּוֹר', transliteration: 'Tzippor', vuk: 'cipor', translation: 'Ptica', english: 'Bird', emoji: '🐦', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h82', char: 'דָּג', transliteration: 'Dag', vuk: 'dag', translation: 'Riba', english: 'Fish', emoji: '🐟', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h83', char: 'אֲדָמָה', transliteration: 'Adamah', vuk: 'adama', translation: 'Zemlja / Tlo', english: 'Soil / Earth', emoji: '🪵', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h84', char: 'קֶשֶׁת', transliteration: 'Keshet', vuk: 'kešet', translation: 'Duga / Luk', english: 'Rainbow / Bow', emoji: '🌈', category: 'priroda', categoryLabel: 'Priroda' },
  { id: 'h85', char: 'יַעַר', transliteration: 'Yaar', vuk: 'jaar', translation: 'Šuma', english: 'Forest / Woods', emoji: '🌲', category: 'priroda', categoryLabel: 'Priroda' },

  // Glagoli & Radnja (25 items)
  { id: 'h86', char: 'לִלְמֹד', transliteration: 'Lilmod', vuk: 'lilmod', translation: 'Učiti', english: 'To learn / study', emoji: '🎓', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ל-מ-ד' },
  { id: 'h87', char: 'לֶאֱכֹל', transliteration: 'Leekhol', vuk: 'lehol', translation: 'Jesti', english: 'To eat', emoji: '🍎', category: 'glagoli', categoryLabel: 'Glagoli', root: 'א-כ-ל' },
  { id: 'h88', char: 'לִשְׁתּוֹת', transliteration: 'Lishtot', vuk: 'lištot', translation: 'Piti', english: 'To drink', emoji: '🥤', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-ת-ה' },
  { id: 'h89', char: 'לָלֶכֶת', transliteration: 'Lalekhet', vuk: 'lalehet', translation: 'Ići / Hodati', english: 'To walk / go', emoji: '🚶', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ה-ל-ך' },
  { id: 'h90', char: 'לִרְצוֹת', transliteration: 'Lirtzot', vuk: 'lircot', translation: 'Želeti', english: 'To want / desire', emoji: '💭', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ר-צ-ה' },
  { id: 'h91', char: 'לָדַעַת', transliteration: 'Ladaat', vuk: 'ladaat', translation: 'Znati / Razumeti', english: 'To know / understand', emoji: '💡', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-ד-ע' },
  { id: 'h92', char: 'לִרְאוֹת', transliteration: 'Lirot', vuk: 'lirot', translation: 'Videti / Gledati', english: 'To see / look', emoji: '👁️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ר-א-ה' },
  { id: 'h93', char: 'לִשְׁמֹעַ', transliteration: 'Lishmoa', vuk: 'lišmoa', translation: 'Slušati / Čuti', english: 'To hear / listen', emoji: '👂', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-מ-ע' },
  { id: 'h94', char: 'לְדַבֵּר', transliteration: 'Ledaber', vuk: 'ledaber', translation: 'Govoriti', english: 'To speak / talk', emoji: '💬', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ד-ב-ר' },
  { id: 'h95', char: 'לִכְתֹּב', transliteration: 'Likhtov', vuk: 'lihtov', translation: 'Pisati', english: 'To write', emoji: '✍️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'כ-ת-ב' },
  { id: 'h96', char: 'לִקְרֹא', transliteration: 'Likro', vuk: 'likro', translation: 'Čitati', english: 'To read', emoji: '📖', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ק-ר-א' },
  { id: 'h97', char: 'לֶאֱהֹב', transliteration: 'Leehov', vuk: 'lehov', translation: 'Voleti', english: 'To love', emoji: '🥰', category: 'glagoli', categoryLabel: 'Glagoli', root: 'א-ה-ב' },
  { id: 'h98', char: 'לַעֲשׂוֹת', transliteration: 'Laasot', vuk: 'laasot', translation: 'Raditi / Činiti', english: 'To do / make', emoji: '🛠️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ע-ש-ה' },
  { id: 'h99', char: 'לָשִׁיר', transliteration: 'Lashir', vuk: 'lašir', translation: 'Pevati', english: 'To sing', emoji: '🎵', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ש-י-ר' },
  { id: 'h100', char: 'לַחֲשֹׁב', transliteration: 'Lachshov', vuk: 'lahšov', translation: 'Misliti', english: 'To think', emoji: '🧠', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ח-ש-ב' },
  { id: 'h101', char: 'לָרוּץ', transliteration: 'Larutz', vuk: 'laruc', translation: 'Trčati', english: 'To run', emoji: '🏃', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ר-ו-צ' },
  { id: 'h102', char: 'לִישׁוֹן', transliteration: 'Lishon', vuk: 'lišon', translation: 'Spavati', english: 'To sleep', emoji: '😴', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-ש-נ' },
  { id: 'h103', char: 'לִצְחֹק', transliteration: 'Litzchok', vuk: 'licohk', translation: 'Smejati se', english: 'To laugh', emoji: '😄', category: 'glagoli', categoryLabel: 'Glagoli', root: 'צ-ח-ק' },
  { id: 'h104', char: 'לִבְכּוֹת', transliteration: 'Livkot', vuk: 'livkot', translation: 'Plakati', english: 'To weep / cry', emoji: '😢', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ב-כ-ה' },
  { id: 'h105', char: 'לִקְנוֹת', transliteration: 'Liknot', vuk: 'liknot', translation: 'Kupiti', english: 'To buy', emoji: '🛍️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ק-נ-ה' },
  { id: 'h106', char: 'לִמְכֹּר', transliteration: 'Limkor', vuk: 'limkor', translation: 'Prodati', english: 'To sell', emoji: '🪙', category: 'glagoli', categoryLabel: 'Glagoli', root: 'מ-כ-ר' },
  { id: 'h107', char: 'לָבוֹא', transliteration: 'Lavo', vuk: 'lavo', translation: 'Doći', english: 'To come', emoji: '🚶‍♂️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ב-ו-א' },
  { id: 'h108', char: 'לָצֵאת', transliteration: 'Latzet', vuk: 'laceat', translation: 'Izaći', english: 'To go out / exit', emoji: '🚪', category: 'glagoli', categoryLabel: 'Glagoli', root: 'י-צ-א' },
  { id: 'h109', char: 'לִמְצֹא', transliteration: 'Limtzo', vuk: 'limco', translation: 'Naći / Pronaći', english: 'To find', emoji: '🔍', category: 'glagoli', categoryLabel: 'Glagoli', root: 'מ-צ-א' },
  { id: 'h110', char: 'לִבְנוֹת', transliteration: 'Livnot', vuk: 'livnot', translation: 'Graditi', english: 'To build', emoji: '🏗️', category: 'glagoli', categoryLabel: 'Glagoli', root: 'ב-נ-ה' },

  // Misaoni & Stoik Stanja (15 items)
  { id: 'h111', char: 'שַׁלְוָה', transliteration: 'Shalva', vuk: 'šalva', translation: 'Duševni mir', english: 'Serenity / Peace of mind', emoji: '🧘', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h112', char: 'כַּוָּנָה', transliteration: 'Kavanah', vuk: 'kavana', translation: 'Svesna namera', english: 'Intention / Focus', emoji: '🎯', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h113', char: 'נְדִיבוּת', transliteration: 'Nedivut', vuk: 'nedivut', translation: 'Velikodušnost', english: 'Generosity / Noble heart', emoji: '🎁', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h114', char: 'הַכָּרַת טוֹב', transliteration: 'Hakarat Tov', vuk: 'hakarat tov', translation: 'Zahvalnost', english: 'Gratitude / Recognizing good', emoji: '🙏', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h115', char: 'אֹמֶץ', transliteration: 'Ometz', vuk: 'omec', translation: 'Odvažnost', english: 'Boldness / Moral courage', emoji: '🦁', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h116', char: 'נִצָּחוֹן', transliteration: 'Nitzachon', vuk: 'nicahon', translation: 'Pobeda nad sobom', english: 'Victory over self', emoji: '🏆', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h117', char: 'מַחְשָׁבָה', transliteration: 'Machshava', vuk: 'mahšava', translation: 'Misao', english: 'Thought / Mindset', emoji: '💭', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h118', char: 'רָצוֹן', transliteration: 'Ratzon', vuk: 'racon', translation: 'Volja / Želja', english: 'Will / Determination', emoji: '⚡', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h119', char: 'שְׁלֵמוּת', transliteration: 'Shlemut', vuk: 'šlemut', translation: 'Celovitost', english: 'Completeness / Integrity', emoji: '⚪', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h120', char: 'סַלְחָנוּת', transliteration: 'Salkhanut', vuk: 'salhanut', translation: 'Opraštanje', english: 'Forgiveness', emoji: '🤝', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h121', char: 'יְגִיעָה', transliteration: 'Yegiah', vuk: 'jegia', translation: 'Trud / Istrajnost', english: 'Effort / Diligent endeavor', emoji: '💦', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h122', char: 'תְּבוּנָה', transliteration: 'Tevunah', vuk: 'tevuna', translation: 'Razboritost', english: 'Prudence / Reason', emoji: '🧠', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h123', char: 'נֶאֱמָנוּת', transliteration: 'Neemanut', vuk: 'neemanut', translation: 'Vernost', english: 'Fidelity / Loyalty', emoji: '🤝', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h124', char: 'שְׁקִידָה', transliteration: 'Shkida', vuk: 'škida', translation: 'Posvećenost učenju', english: 'Devoted study', emoji: '📚', category: 'misaoni', categoryLabel: 'Misaoni Stoik' },
  { id: 'h125', char: 'הִתְבּוֹנְנוּת', transliteration: 'Hitbonenut', vuk: 'hitbonenut', translation: 'Kontemplacija', english: 'Deep meditation', emoji: '👁️', category: 'misaoni', categoryLabel: 'Misaoni Stoik' }
];

export const HebrewVocabView: React.FC<HebrewVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  // Navigation: Dictionary, Emoji Canvas, AI Weaver or Quiz
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mudrost' | 'svakodnevno' | 'priroda' | 'glagoli' | 'misaoni'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Weaver state
  const [selectedWeaverItems, setSelectedWeaverItems] = useState<HebrewVocabItem[]>([]);
  const [wovenSentence, setWovenSentence] = useState<{ hebrew: string; vuk: string; serbian: string } | null>(null);

  // Game States
  const [quizStarted, setQuizStarted] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState<{
    vocab: HebrewVocabItem;
    options: string[];
    correctIndex: number;
    questionType: 'meaning' | 'vuk' | 'character' | 'listen';
  }[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Persistence States
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [isPronouncing, setIsPronouncing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (item: HebrewVocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${item.emoji} ${item.char} [${item.transliteration}] (${item.vuk})\n🇭🇷 ${item.translation}\n🇬🇧 ${item.english}\n${item.root ? `🌱 Koren: ${item.root}\n` : ''}✨ WiseFit Sanctuary Hebrew`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      playSound('correct');
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    });
  };

  const playSound = (type: 'correct' | 'wrong' | 'complete') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.setValueAtTime(110, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'complete') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.08);
          osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const speakHebrewAudioFallback = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=he&client=tw-ob&q=${encodeURIComponent(text)}`);
    audio.play().then(() => {
      if (id) setTimeout(() => setIsPronouncing(null), 1200);
    }).catch(err => {
      console.warn("Audio playback issue:", err);
      if (id) setIsPronouncing(null);
    });
  };

  const speakHebrew = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    if (!('speechSynthesis' in window)) {
      speakHebrewAudioFallback(text, id);
      return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const heVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith('he') || 
      v.name.toLowerCase().includes('hebrew')
    );

    if (heVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.rate = 0.85;
      utterance.voice = heVoice;
      utterance.onend = () => { if (id) setIsPronouncing(null); };
      utterance.onerror = () => speakHebrewAudioFallback(text, id);
      window.speechSynthesis.speak(utterance);
    } else {
      speakHebrewAudioFallback(text, id);
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'progress', 'hebrew');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setMasteredIds(data.masteredIds || []);
            setHighScore(data.highScore || 0);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        const localMastered = localStorage.getItem('wf_hebrew_mastered');
        const localHighScore = localStorage.getItem('wf_hebrew_highscore');
        if (localMastered) setMasteredIds(JSON.parse(localMastered));
        if (localHighScore) setHighScore(parseInt(localHighScore, 10));
      }
    };
    loadProgress();
  }, [user]);

  const saveProgress = async (newMastered: string[], newHighScore: number) => {
    setMasteredIds(newMastered);
    if (newHighScore > highScore) setHighScore(newHighScore);

    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid, 'progress', 'hebrew');
        await setDoc(docRef, {
          masteredIds: newMastered,
          highScore: Math.max(highScore, newHighScore),
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('wf_hebrew_mastered', JSON.stringify(newMastered));
      localStorage.setItem('wf_hebrew_highscore', Math.max(highScore, newHighScore).toString());
    }
  };

  const filteredVocab = useMemo(() => {
    return HEBREW_VOCAB_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.char.toLowerCase().includes(q) ||
        item.transliteration.toLowerCase().includes(q) ||
        item.vuk.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        (item.root && item.root.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (masteredIds.includes(id)) {
      updated = masteredIds.filter(mid => mid !== id);
    } else {
      updated = [...masteredIds, id];
      playSound('correct');
    }
    saveProgress(updated, highScore);
  };

  const generateQuizRound = () => {
    const shuffled = [...HEBREW_VOCAB_DATA].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    const questionsList = selected.map(vocab => {
      const types: ('meaning' | 'vuk' | 'character' | 'listen')[] = ['meaning', 'vuk', 'character', 'listen'];
      const questionType = types[Math.floor(Math.random() * types.length)];
      
      const otherVocabs = HEBREW_VOCAB_DATA.filter(v => v.id !== vocab.id);
      const wrongShuffled = otherVocabs.sort(() => Math.random() - 0.5).slice(0, 3);
      
      let correctAnswer = '';
      let wrongAnswers: string[] = [];

      if (questionType === 'meaning') {
        correctAnswer = `${vocab.emoji} ${vocab.translation} (${vocab.english})`;
        wrongAnswers = wrongShuffled.map(w => `${w.emoji} ${w.translation} (${w.english})`);
      } else if (questionType === 'vuk') {
        correctAnswer = `Vuk: "${vocab.vuk}" [${vocab.transliteration}]`;
        wrongAnswers = wrongShuffled.map(w => `Vuk: "${w.vuk}" [${w.transliteration}]`);
      } else if (questionType === 'character') {
        correctAnswer = `${vocab.char} — ${vocab.transliteration}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.transliteration}`);
      } else {
        correctAnswer = `${vocab.char} — ${vocab.emoji} ${vocab.translation}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.emoji} ${w.translation}`);
      }

      const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      const correctIndex = allOptions.indexOf(correctAnswer);

      return { vocab, options: allOptions, correctIndex, questionType };
    });

    setRoundQuestions(questionsList);
    setQuestionIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setLives(3);
    setScore(0);
    setQuizComplete(false);
    setQuizStarted(true);
    
    if (questionsList[0].questionType === 'listen') {
      setTimeout(() => speakHebrew(questionsList[0].vocab.char), 600);
    }
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    
    const currentQ = roundQuestions[questionIdx];
    const isCorrect = optionIndex === currentQ.correctIndex;
    
    if (isCorrect) {
      playSound('correct');
      setScore(prev => prev + 10);
      if (!masteredIds.includes(currentQ.vocab.id)) {
        saveProgress([...masteredIds, currentQ.vocab.id], Math.max(highScore, score + 10));
      }
    } else {
      playSound('wrong');
      setLives(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextQuestion = () => {
    if (lives <= 0) {
      setQuizComplete(true);
      playSound('complete');
      return;
    }

    if (questionIdx < roundQuestions.length - 1) {
      const nextIdx = questionIdx + 1;
      setQuestionIdx(nextIdx);
      setSelectedAnswer(null);
      setIsAnswered(false);
      if (roundQuestions[nextIdx].questionType === 'listen') {
        setTimeout(() => speakHebrew(roundQuestions[nextIdx].vocab.char), 400);
      }
    } else {
      setQuizComplete(true);
      playSound('complete');
    }
  };

  const handleToggleWeaverSelect = (item: HebrewVocabItem) => {
    if (selectedWeaverItems.find(i => i.id === item.id)) {
      setSelectedWeaverItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (selectedWeaverItems.length >= 3) return;
      setSelectedWeaverItems(prev => [...prev, item]);
    }
  };

  const weaveSentence = () => {
    if (selectedWeaverItems.length === 0) return;
    const wordsHeb = selectedWeaverItems.map(i => i.char).join(' ');
    const wordsVuk = selectedWeaverItems.map(i => i.vuk).join(' ');
    const wordsSer = selectedWeaverItems.map(i => i.translation.split('/')[0].trim()).join(', ');

    setWovenSentence({
      hebrew: `בְּתוֹךְ הַלֵּב שֶׁלִּי יֵשׁ ${wordsHeb}`,
      vuk: `betoh halev šeli ješ ${wordsVuk}`,
      serbian: `U mom srcu nalazi se ${wordsSer} - put mudrosti.`
    });
    speakHebrew(`בְּתוֹךְ הַלֵּב שֶׁלִּי יֵשׁ ${wordsHeb}`);
  };

  const getRankInfo = (count: number) => {
    if (count >= 100) return { name: 'Hebrejski Mudrac (Chakham)', desc: 'Potpuno vladanje rečnikom mudrosti i svakodnevnog života', icon: '👑' };
    if (count >= 60) return { name: 'Učenik Tore (Talmid)', desc: 'Duboko razumevanje korena i rečeničnih sklopova', icon: '📜' };
    if (count >= 30) return { name: 'Mislilac (Hoshik)', desc: 'Preko 30 savladanih reči i izraza', icon: '🕯️' };
    return { name: 'Tragalac (Doresh)', desc: 'Započeta staza usvajanja drevnog jezika', icon: '🌱' };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
              🇮🇱 125 Odabranih Reči i Korena
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Vuk Transliteracija
            </span>
          </div>
          <h2 className={cn(
            "text-2xl md:text-3xl font-black tracking-tight mt-2 flex items-center gap-2",
            isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
          )}>
            Hebrejska Riznica & Koreni (עִבְרִית)
          </h2>
          <p className="text-xs md:text-sm font-medium text-zinc-400 mt-1">
            Učite visokonaponske imenice, glagole i stoik mudrosti uz vizuelne emodžije i fonetsku Vuk Karadžić transliteraciju.
          </p>
        </div>

        {/* View Mode Nav */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "p-1 rounded-xl border flex items-center gap-1",
            isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-200"
          )}>
            <button
              onClick={() => setActiveTab('learn')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'learn'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <BookOpen className="w-3.5 h-3.5" /> Rečnik
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'canvas'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Visual Canvas
            </button>
            <button
              onClick={() => setActiveTab('weaver')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'weaver'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-purple-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Wand2 className="w-3.5 h-3.5" /> Sklop Rečenica
            </button>
            <button
              onClick={() => { setActiveTab('quiz'); generateQuizRound(); }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                activeTab === 'quiz'
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-blue-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          <div className={cn(
            "px-3 py-1.5 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-blue-400" : "bg-blue-50 border-blue-100 text-blue-700"
          )}>
            <Trophy className="w-4 h-4 text-blue-500 fill-blue-500 animate-pulse" />
            <span>{masteredIds.length}/{HEBREW_VOCAB_DATA.length}</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* REČNIK / DICTIONARY VIEW */}
        {activeTab === 'learn' && (
          <motion.div key="learn-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Rank Banner */}
            <div className={cn(
              "p-5 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-4",
              isDarkMode ? "bg-gradient-to-r from-blue-950/40 via-zinc-900 to-zinc-950 border-blue-500/20" : "bg-gradient-to-r from-blue-50 via-white to-blue-50/50 border-blue-100"
            )}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getRankInfo(masteredIds.length).icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-blue-500 font-mono">Čin Akademije:</span>
                    <span className="text-sm font-black tracking-tight">{getRankInfo(masteredIds.length).name}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{getRankInfo(masteredIds.length).desc}</p>
                </div>
              </div>
              <div className="text-right font-mono text-xs font-bold text-blue-500">
                Savladano {Math.round((masteredIds.length / HEBREW_VOCAB_DATA.length) * 100)}% rečnika
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Pretraži reči, koren ili prevod..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-blue-500" : "bg-white border-zinc-200 text-zinc-900 focus:border-blue-500"
                  )}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                {[
                  { id: 'all', label: `Sve (${HEBREW_VOCAB_DATA.length})` },
                  { id: 'mudrost', label: ' Mudrost' },
                  { id: 'svakodnevno', label: ' Svakodnevno' },
                  { id: 'priroda', label: ' Priroda' },
                  { id: 'glagoli', label: ' Glagoli' },
                  { id: 'misaoni', label: ' Misaoni Stoik' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                      selectedCategory === cat.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200" : "bg-white border-zinc-200 text-zinc-600"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVocab.map(item => {
                const isMastered = masteredIds.includes(item.id);
                const isSpeaking = isPronouncing === item.id;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "p-5 rounded-3xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden group hover:scale-[1.01]",
                      isMastered 
                        ? (isDarkMode ? "bg-emerald-950/20 border-emerald-500/30" : "bg-emerald-50/60 border-emerald-200")
                        : (isDarkMode ? "bg-zinc-900/50 border-zinc-800/80 hover:border-blue-500/40" : "bg-white border-zinc-200 shadow-sm hover:border-blue-300")
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.emoji}</span>
                          <div>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md font-mono border",
                              isDarkMode ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                            )}>
                              {item.categoryLabel}
                            </span>
                            {item.root && (
                              <span className="ml-1 text-[9px] font-bold text-blue-500 font-mono">
                                Koren: {item.root}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => toggleMastered(item.id, e)}
                          className={cn(
                            "p-1.5 rounded-xl border transition-all",
                            isMastered 
                              ? "bg-emerald-500 text-white border-emerald-500" 
                              : isDarkMode ? "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-zinc-300" : "bg-zinc-100 text-zinc-400 border-zinc-200 hover:text-zinc-700"
                          )}
                          title={isMastered ? "Savladano" : "Onači kao savladano"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-2xl font-serif font-black text-blue-500 font-sans tracking-wide">
                            {item.char}
                          </h3>
                          <span className="text-xs font-mono font-bold text-zinc-400">
                            {item.transliteration}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-emerald-500 font-bold">Vuk:</span>
                          <span className={cn("font-extrabold", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>
                            "{item.vuk}"
                          </span>
                        </div>
                      </div>

                      <div className="border-t pt-2 border-zinc-800/10 dark:border-zinc-800/60 space-y-1">
                        <p className={cn("text-xs font-bold", isDarkMode ? "text-zinc-200" : "text-zinc-800")}>
                          🇭🇷 {item.translation}
                        </p>
                        <p className="text-[11px] font-medium text-zinc-400">
                          🇬🇧 {item.english}
                        </p>
                        {item.visualTip && (
                          <p className="text-[10px] italic text-blue-400/90 pt-0.5">
                            💡 {item.visualTip}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800/10 dark:border-zinc-800/60">
                      <button
                        onClick={() => speakHebrew(item.char, item.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                          isSpeaking 
                            ? "bg-blue-600 text-white animate-pulse" 
                            : isDarkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                        )}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Izgovor</span>
                      </button>

                      <button
                        onClick={(e) => handleCopy(item, e)}
                        className={cn(
                          "p-1.5 rounded-xl text-xs transition-all",
                          copiedId === item.id ? "text-emerald-500" : "text-zinc-400 hover:text-zinc-200"
                        )}
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* EMOJI VISUAL CANVAS VIEW */}
        {activeTab === 'canvas' && (
          <motion.div key="canvas-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium">
              🎨 <strong>Vizuelni Emodži Sklop:</strong> Učite asocijacijom! Velike vizuelne kartice sa uočljivim emodžijima i korenom za brzo pamćenje.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredVocab.map(item => (
                <div
                  key={`canvas-${item.id}`}
                  onClick={() => speakHebrew(item.char, item.id)}
                  className={cn(
                    "p-4 rounded-2xl border text-center flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all",
                    isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-blue-500/50" : "bg-white border-zinc-200 shadow-sm hover:border-blue-300"
                  )}
                >
                  <span className="text-4xl my-2 filter drop-shadow-sm">{item.emoji}</span>
                  <div className="space-y-0.5 w-full">
                    <p className="text-lg font-bold text-blue-500">{item.char}</p>
                    <p className="text-[10px] font-mono font-bold text-emerald-500">"{item.vuk}"</p>
                    <p className="text-[10px] font-medium text-zinc-400 truncate w-full">{item.translation}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI SENTENCE WEAVER */}
        {activeTab === 'weaver' && (
          <motion.div key="weaver-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className={cn(
              "p-6 rounded-3xl border space-y-4",
              isDarkMode ? "bg-zinc-900/80 border-purple-500/30" : "bg-purple-50/50 border-purple-200"
            )}>
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500 animate-spin" />
                <h3 className="text-base font-black tracking-tight">Interaktivni Sklop Rečenica (Interaktivno Učenje)</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Izaberite do 3 reči iz rečnika ispod i ispletite pravu upotrebljivu hebrejsku rečenicu sa izgovorom!
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedWeaverItems.map(item => (
                  <span key={item.id} className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-600 text-white flex items-center gap-1.5">
                    {item.emoji} {item.char} ({item.vuk})
                    <button onClick={() => handleToggleWeaverSelect(item)} className="hover:text-red-300">×</button>
                  </span>
                ))}
                {selectedWeaverItems.length === 0 && (
                  <span className="text-xs italic text-zinc-500">Kliknite na reči ispod da ih dodate...</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={weaveSentence}
                  disabled={selectedWeaverItems.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4" /> Ispleti Rečenicu & Izgovori
                </button>
                <button
                  onClick={() => { setSelectedWeaverItems([]); setWovenSentence(null); }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-zinc-200"
                >
                  Poništi
                </button>
              </div>

              {wovenSentence && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                  <p className="text-xl font-serif font-bold text-purple-300">{wovenSentence.hebrew}</p>
                  <p className="text-xs font-mono font-bold text-emerald-400">Vuk: "{wovenSentence.vuk}"</p>
                  <p className="text-xs font-medium text-zinc-200">Prevod: {wovenSentence.serbian}</p>
                  <button
                    onClick={() => speakHebrew(wovenSentence.hebrew)}
                    className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-purple-600 text-white flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk Rečenice
                  </button>
                </div>
              )}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {HEBREW_VOCAB_DATA.slice(0, 36).map(item => {
                const isSelected = selectedWeaverItems.some(i => i.id === item.id);
                return (
                  <button
                    key={`weaver-pick-${item.id}`}
                    onClick={() => handleToggleWeaverSelect(item)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all",
                      isSelected 
                        ? "bg-purple-600 border-purple-500 text-white" 
                        : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-purple-500/40" : "bg-white border-zinc-200 text-zinc-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[10px] font-mono font-bold opacity-80">{item.vuk}</span>
                    </div>
                    <p className="text-sm font-bold mt-1">{item.char}</p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* DUOLINGO QUIZ VIEW */}
        {activeTab === 'quiz' && (
          <motion.div key="quiz-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">
            {!quizComplete && quizStarted && roundQuestions.length > 0 && (
              <div className={cn(
                "p-6 md:p-8 rounded-3xl border space-y-6",
                isDarkMode ? "bg-zinc-900/80 border-zinc-800" : "bg-white border-zinc-200 shadow-md"
              )}>
                {/* Status Bar */}
                <div className="flex items-center justify-between font-mono text-xs font-black border-b pb-4 border-zinc-800/30">
                  <div className="flex items-center gap-1 text-red-500">
                    {'❤️'.repeat(lives)}
                  </div>
                  <div className="text-blue-500">
                    Pitanje {questionIdx + 1} / {roundQuestions.length}
                  </div>
                  <div className="text-emerald-500">
                    Poeni: {score}
                  </div>
                </div>

                {/* Question */}
                <div className="text-center space-y-3 my-4">
                  <span className="text-5xl">{roundQuestions[questionIdx].vocab.emoji}</span>
                  <h3 className="text-3xl font-serif font-black text-blue-500">
                    {roundQuestions[questionIdx].vocab.char}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Izaberite tačan prevod ili Vuk izgovor:
                  </p>
                  <button
                    onClick={() => speakHebrew(roundQuestions[questionIdx].vocab.char)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 inline-flex items-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk
                  </button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-3">
                  {roundQuestions[questionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswer === oIdx;
                    const isCorrect = oIdx === roundQuestions[questionIdx].correctIndex;

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleAnswerSubmit(oIdx)}
                        disabled={isAnswered}
                        className={cn(
                          "p-4 rounded-2xl border text-left text-xs font-bold transition-all flex items-center justify-between",
                          !isAnswered && (isDarkMode ? "bg-zinc-800/60 border-zinc-700 hover:border-blue-500" : "bg-zinc-50 border-zinc-200 hover:border-blue-400"),
                          isAnswered && isCorrect && "bg-emerald-500 text-white border-emerald-500",
                          isAnswered && isSelected && !isCorrect && "bg-red-500 text-white border-red-500"
                        )}
                      >
                        <span>{opt}</span>
                        {isAnswered && isCorrect && <CheckCircle className="w-4 h-4 text-white" />}
                        {isAnswered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500 transition-all"
                    >
                      Sledeće Pitanje →
                    </button>
                  </div>
                )}
              </div>
            )}

            {quizComplete && (
              <div className="p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
                <Trophy className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-black text-white">Kviz Završen!</h3>
                <p className="text-sm font-mono text-emerald-400">Ostvaren rezultat: {score} poena</p>
                <button
                  onClick={generateQuizRound}
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-blue-600 text-white hover:bg-blue-500"
                >
                  Igraj Ponovo 🔄
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
