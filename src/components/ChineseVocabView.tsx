import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Trophy, 
  BookOpen, 
  Gamepad2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Copy, 
  Check,
  Zap,
  LayoutGrid,
  Wand2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ChineseVocabViewProps {
  isDarkMode: boolean;
  isGirlyMode: boolean;
  user: User | null;
}

export interface VocabItem {
  id: string;
  char: string;
  pinyin: string;
  vuk: string;
  translation: string;
  english: string;
  emoji: string;
  category: 'strofa_1' | 'refren' | 'glagoli' | 'svakodnevno' | 'filozofija';
  categoryLabel: string;
  radical?: string;
  visualTip?: string;
}

const VOCAB_DATA: VocabItem[] = [
  // Strofa 1 / Poetično (15)
  { id: '1', char: '深处', pinyin: 'shēn chù', vuk: 'šen ču', translation: 'Duboko u / Ponor', english: 'Deep place / Abyss', emoji: '🌌', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '氵 Water', visualTip: 'Water streaming into deep space' },
  { id: '2', char: '在', pinyin: 'zài', vuk: 'dzai', translation: 'U / Na / Nalaziti se', english: 'At / In / On', emoji: '📍', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '土 Earth', visualTip: 'Earth anchor marking a place' },
  { id: '3', char: '我的', pinyin: 'wǒ de', vuk: 'vo de', translation: 'Moj / Moja', english: 'My / Mine', emoji: '👤', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '戈 Spear', visualTip: 'Self with possessive particle' },
  { id: '4', char: '心', pinyin: 'xīn', vuk: 'sin', translation: 'Srce / Um', english: 'Heart / Mind', emoji: '❤️', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '心 Heart', visualTip: 'Pictogram of pumping heart valves' },
  { id: '5', char: '火', pinyin: 'huǒ', vuk: 'huo', translation: 'Vatra', english: 'Fire', emoji: '🔥', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '火 Flame', visualTip: 'Dancing flames shooting upward' },
  { id: '6', char: '燃烧', pinyin: 'rán shāo', vuk: 'ran šao', translation: 'Sagorevati / Goreti', english: 'Burn / Ignite', emoji: '☄️', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '火 Fire', visualTip: 'Sparks flying from fierce fire' },
  { id: '7', char: '燃烧的', pinyin: 'rán shāo de', vuk: 'ran šao de', translation: 'Goruće / Što gori', english: 'Burning / Fiery', emoji: '⚡', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '火 Fire', visualTip: 'Fiery adjective marker' },
  { id: '8', char: '你', pinyin: 'nǐ', vuk: 'ni', translation: 'Ti', english: 'You', emoji: '🫵', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '亻 Person', visualTip: 'Person standing next to title' },
  { id: '9', char: '听', pinyin: 'tīng', vuk: 'ting', translation: 'Slušati / Čuti', english: 'Listen / Hear', emoji: '👂', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '口 Mouth', visualTip: 'Mouth open listening to sound' },
  { id: '10', char: '声音', pinyin: 'shēng yīn', vuk: 'šeng in', translation: 'Glas / Zvuk', english: 'Voice / Sound', emoji: '🔊', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '音 Sound', visualTip: 'Musical vibration in air' },
  { id: '11', char: '风', pinyin: 'fēng', vuk: 'feng', translation: 'Vetar', english: 'Wind', emoji: '💨', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '风 Wind', visualTip: 'Breeze flowing through sail' },
  { id: '12', char: '呼唤', pinyin: 'hū huàn', vuk: 'hu huan', translation: 'Dozivati / Zvati', english: 'Call / Summon', emoji: '🗣️', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '口 Mouth', visualTip: 'Voice calling across distance' },
  { id: '13', char: '寂静', pinyin: 'jì jìng', vuk: 'đji đjing', translation: 'Tišina / Muk', english: 'Silence / Stillness', emoji: '🤫', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '宀 Roof', visualTip: 'Peaceful quiet beneath roof' },
  { id: '14', char: '黑夜', pinyin: 'hēi yè', vuk: 'hej je', translation: 'Tamna noć', english: 'Dark night', emoji: '🌌', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '黑 Black', visualTip: 'Soot from fire in dark night' },
  { id: '15', char: '光明', pinyin: 'guāng míng', vuk: 'guang ming', translation: 'Svetlost i jasnoća', english: 'Brightness / Clarity', emoji: '🌅', category: 'strofa_1', categoryLabel: 'Strofa 1', radical: '日 Sun', visualTip: 'Sun and Moon illuminating together' },

  // Refren / Svetlost (15)
  { id: '16', char: '爱', pinyin: 'ài', vuk: 'ai', translation: 'Ljubav', english: 'Love', emoji: '💖', category: 'refren', categoryLabel: 'Refren', radical: '心 Heart', visualTip: 'Heart held securely between hands' },
  { id: '17', char: '是', pinyin: 'shì', vuk: 'ši', translation: 'Jeste / Biti', english: 'Is / To be', emoji: '🧬', category: 'refren', categoryLabel: 'Refren', radical: '日 Sun', visualTip: 'Sun directly overhead confirming truth' },
  { id: '18', char: '光', pinyin: 'guāng', vuk: 'guang', translation: 'Svetlost', english: 'Light', emoji: '✨', category: 'refren', categoryLabel: 'Refren', radical: '儿 Legs', visualTip: 'Person carrying torch above head' },
  { id: '19', char: '永远', pinyin: 'yǒng yuǎn', vuk: 'jong jien', translation: 'Zauvek / Večno', english: 'Forever / Always', emoji: '♾️', category: 'refren', categoryLabel: 'Refren', radical: '水 Water', visualTip: 'Ever-flowing endless river' },
  { id: '20', char: '不', pinyin: 'bù', vuk: 'bu', translation: 'Ne / Nije', english: 'No / Not', emoji: '❌', category: 'refren', categoryLabel: 'Refren', radical: '一 One', visualTip: 'Sprouting plant blocked at top' },
  { id: '21', char: '熄灭', pinyin: 'xī miè', vuk: 'sju mje', translation: 'Ugasiti se', english: 'Extinguish / Go out', emoji: '🧯', category: 'refren', categoryLabel: 'Refren', radical: '火 Fire', visualTip: 'Quenching fire with cover' },
  { id: '22', char: '灵魂', pinyin: 'líng hún', vuk: 'ling hun', translation: 'Duša', english: 'Soul / Spirit', emoji: '👼', category: 'refren', categoryLabel: 'Refren', radical: '鬼 Ghost', visualTip: 'Transcendent spiritual rain' },
  { id: '23', char: '飞翔', pinyin: 'fēi xiáng', vuk: 'fej sjang', translation: 'Leteti', english: 'Fly / Soar', emoji: '🦅', category: 'refren', categoryLabel: 'Refren', radical: '羽 Feathers', visualTip: 'Wings spread soaring high' },
  { id: '24', char: '天空', pinyin: 'tiān kōng', vuk: 'tjen kong', translation: 'Nebo / Prostranstvo', english: 'Sky / Heavens', emoji: '☁️', category: 'refren', categoryLabel: 'Refren', radical: '穴 Cave', visualTip: 'Vast blue sky over earth' },
  { id: '25', char: '星辰', pinyin: 'xīng chén', vuk: 'sing čen', translation: 'Zvezde', english: 'Stars / Constellations', emoji: '🌟', category: 'refren', categoryLabel: 'Refren', radical: '日 Sun', visualTip: 'Suns shining in celestial night' },
  { id: '26', char: '照亮', pinyin: 'zhào liàng', vuk: 'džao ljang', translation: 'Obasjati', english: 'Illuminate / Light up', emoji: '💡', category: 'refren', categoryLabel: 'Refren', radical: '日 Sun', visualTip: 'Sun reflection lighting path' },
  { id: '27', char: '路', pinyin: 'lù', vuk: 'lu', translation: 'Put / Staza', english: 'Road / Path', emoji: '🛣️', category: 'refren', categoryLabel: 'Refren', radical: '足 Foot', visualTip: 'Footprints along walking road' },
  { id: '28', char: '希望', pinyin: 'xī wàng', vuk: 'si vang', translation: 'Nada / Želja', english: 'Hope / Wish', emoji: '🌟', category: 'refren', categoryLabel: 'Refren', radical: '月 Moon', visualTip: 'Gazing at full moon with hope' },
  { id: '29', char: '奇迹', pinyin: 'qí jì', vuk: 'ći đji', translation: 'Čudo', english: 'Miracle / Wonder', emoji: '🔮', category: 'refren', categoryLabel: 'Refren', radical: '大 Big', visualTip: 'Surprising wonder beyond belief' },
  { id: '30', char: '信仰', pinyin: 'xìn yǎng', vuk: 'sin jang', translation: 'Vera / Uverenje', english: 'Faith / Belief', emoji: '🛡️', category: 'refren', categoryLabel: 'Refren', radical: '亻 Person', visualTip: 'Person keeping word steadfast' },

  // Glagoli (30)
  { id: '31', char: '看', pinyin: 'kàn', vuk: 'kan', translation: 'Gledati / Videti', english: 'Look / See / Watch', emoji: '👁️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '目 Eye', visualTip: 'Hand shading eye to look far' },
  { id: '32', char: '吃', pinyin: 'chī', vuk: 'či', translation: 'Jesti', english: 'Eat', emoji: '🍎', category: 'glagoli', categoryLabel: 'Glagoli', radical: '口 Mouth', visualTip: 'Mouth receiving food' },
  { id: '33', char: '喝', pinyin: 'hē', vuk: 'he', translation: 'Piti', english: 'Drink', emoji: '🥤', category: 'glagoli', categoryLabel: 'Glagoli', radical: '口 Mouth', visualTip: 'Mouth sipping beverage' },
  { id: '34', char: '走', pinyin: 'zǒu', vuk: 'dzou', translation: 'Hodati / Ići', english: 'Walk / Go', emoji: '🚶', category: 'glagoli', categoryLabel: 'Glagoli', radical: '走 Walk', visualTip: 'Person swinging arms walking' },
  { id: '35', char: '跑', pinyin: 'pǎo', vuk: 'pao', translation: 'Trčati', english: 'Run', emoji: '🏃', category: 'glagoli', categoryLabel: 'Glagoli', radical: '足 Foot', visualTip: 'Feet moving swiftly' },
  { id: '36', char: '笑', pinyin: 'xiào', vuk: 'sjao', translation: 'Smejati se', english: 'Laugh / Smile', emoji: '😄', category: 'glagoli', categoryLabel: 'Glagoli', radical: '竹 Bamboo', visualTip: 'Bamboo swaying like laughing person' },
  { id: '37', char: '哭', pinyin: 'kū', vuk: 'ku', translation: 'Plakati', english: 'Cry / Weep', emoji: '😢', category: 'glagoli', categoryLabel: 'Glagoli', radical: '口 Mouth', visualTip: 'Two eyes crying tears' },
  { id: '38', char: '说', pinyin: 'shuō', vuk: 'šuo', translation: 'Govoriti / Reći', english: 'Speak / Say', emoji: '💬', category: 'glagoli', categoryLabel: 'Glagoli', radical: '讠 Speech', visualTip: 'Words forming spoken thoughts' },
  { id: '39', char: '想', pinyin: 'xiǎng', vuk: 'sjang', translation: 'Misliti / Želeti', english: 'Think / Want', emoji: '💭', category: 'glagoli', categoryLabel: 'Glagoli', radical: '心 Heart', visualTip: 'Tree and eye reflecting in heart' },
  { id: '40', char: '做', pinyin: 'zuò', vuk: 'dzuo', translation: 'Raditi / Praviti', english: 'Do / Make', emoji: '🛠️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '亻 Person', visualTip: 'Person crafting with hands' },
  { id: '41', char: '有', pinyin: 'yǒu', vuk: 'jou', translation: 'Imati / Postojati', english: 'Have / Exist', emoji: '🎒', category: 'glagoli', categoryLabel: 'Glagoli', radical: '月 Moon', visualTip: 'Hand holding meat/portion' },
  { id: '42', char: '去', pinyin: 'qù', vuk: 'ću', translation: 'Ići / Otići', english: 'Go / Leave', emoji: '➡️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '厶 Private', visualTip: 'Departing from soil base' },
  { id: '43', char: '买', pinyin: 'mǎi', vuk: 'mai', translation: 'Kupiti', english: 'Buy', emoji: '🛍️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '乙 Second', visualTip: 'Exchanging coins for item' },
  { id: '44', char: '卖', pinyin: 'mài', vuk: 'mai', translation: 'Prodati', english: 'Sell', emoji: '🪙', category: 'glagoli', categoryLabel: 'Glagoli', radical: '十 Ten', visualTip: 'Offering item for coin' },
  { id: '45', char: '学', pinyin: 'xué', vuk: 'sjue', translation: 'Učiti / Proučavati', english: 'Learn / Study', emoji: '🎓', category: 'glagoli', categoryLabel: 'Glagoli', radical: '子 Child', visualTip: 'Child beneath roof studying' },
  { id: '46', char: '写', pinyin: 'xiě', vuk: 'sje', translation: 'Pisati', english: 'Write', emoji: '✍️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '冖 Cover', visualTip: 'Pen executing strokes under roof' },
  { id: '47', char: '读', pinyin: 'dú', vuk: 'du', translation: 'Čitati', english: 'Read / Study', emoji: '📖', category: 'glagoli', categoryLabel: 'Glagoli', radical: '讠 Speech', visualTip: 'Reciting words aloud from text' },
  { id: '48', char: '坐', pinyin: 'zuò', vuk: 'dzuo', translation: 'Sedeti', english: 'Sit', emoji: '🪑', category: 'glagoli', categoryLabel: 'Glagoli', radical: '土 Earth', visualTip: 'Two people sitting on soil ground' },
  { id: '49', char: '站', pinyin: 'zhàn', vuk: 'džan', translation: 'Stajati / Ustati', english: 'Stand', emoji: '🧍', category: 'glagoli', categoryLabel: 'Glagoli', radical: '立 Stand', visualTip: 'Person standing upright on land' },
  { id: '50', char: '睡', pinyin: 'shuì', vuk: 'šui', translation: 'Spavati', english: 'Sleep', emoji: '😴', category: 'glagoli', categoryLabel: 'Glagoli', radical: '目 Eye', visualTip: 'Eyes drooping into dream' },
  { id: '51', char: '懂', pinyin: 'dǒng', vuk: 'dong', translation: 'Razumeti / Shvatiti', english: 'Understand', emoji: '💡', category: 'glagoli', categoryLabel: 'Glagoli', radical: '忄 Heart', visualTip: 'Mind understanding clearly' },
  { id: '52', char: '问', pinyin: 'wèn', vuk: 'ven', translation: 'Pitati / Pitanje', english: 'Ask', emoji: '❓', category: 'glagoli', categoryLabel: 'Glagoli', radical: '门 Door', visualTip: 'Mouth asking at doorway' },
  { id: '53', char: '答', pinyin: 'dá', vuk: 'da', translation: 'Odgovoriti', english: 'Answer / Reply', emoji: '🗣️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '竹 Bamboo', visualTip: 'Bamboo slip reply letter' },
  { id: '54', char: '开', pinyin: 'kāi', vuk: 'kai', translation: 'Otvoriti / Voziti', english: 'Open / Drive', emoji: '🔑', category: 'glagoli', categoryLabel: 'Glagoli', radical: '廾 Hands', visualTip: 'Two hands sliding open gate' },
  { id: '55', char: '关', pinyin: 'guān', vuk: 'guan', translation: 'Zatvoriti / Ugasiti', english: 'Close / Turn off', emoji: '🔒', category: 'glagoli', categoryLabel: 'Glagoli', radical: '八 Eight', visualTip: 'Barring entrance closed' },
  { id: '56', char: '喜欢', pinyin: 'xǐ huan', vuk: 'si huan', translation: 'Sviđati se / Voleti', english: 'Like / Enjoy', emoji: '🥰', category: 'glagoli', categoryLabel: 'Glagoli', radical: '口 Mouth', visualTip: 'Joyful appreciation' },
  { id: '57', char: '创造', pinyin: 'chuàng zào', vuk: 'čuang dzao', translation: 'Stvarati / Kreirati', english: 'Create / Innovate', emoji: '🎨', category: 'glagoli', categoryLabel: 'Glagoli', radical: '刂 Knife', visualTip: 'Carving new masterpiece' },
  { id: '58', char: '坚持', pinyin: 'jiān chí', vuk: 'đjien či', translation: 'Istrajati / Ne odustajati', english: 'Persist / Hold firm', emoji: '🏋️', category: 'glagoli', categoryLabel: 'Glagoli', radical: '土 Earth', visualTip: 'Holding steadfast to soil ground' },
  { id: '59', char: '思考', pinyin: 'sī kǎo', vuk: 'si kao', translation: 'Misliti / Promišljati', english: 'Ponder / Meditate', emoji: '🧠', category: 'glagoli', categoryLabel: 'Glagoli', radical: '心 Heart', visualTip: 'Field of thoughts in mind' },
  { id: '60', char: '改变', pinyin: 'gǎi biàn', vuk: 'gai bjien', translation: 'Promeniti / Transformisati', english: 'Change / Transform', emoji: '🔄', category: 'glagoli', categoryLabel: 'Glagoli', radical: '攵 Whip', visualTip: 'Refining and adapting path' },

  // Svakodnevno / Imenice (45)
  { id: '61', char: '家', pinyin: 'jiā', vuk: 'đia', translation: 'Dom / Porodica', english: 'Home / Family', emoji: '🏠', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '宀 Roof', visualTip: 'Roof protecting family shelter' },
  { id: '62', char: '朋友', pinyin: 'péng yǒu', vuk: 'peng jou', translation: 'Prijatelj', english: 'Friend', emoji: '🤝', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '月 Moon', visualTip: 'Two moons shining together' },
  { id: '63', char: '水', pinyin: 'shuǐ', vuk: 'šui', translation: 'Voda', english: 'Water', emoji: '💧', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '水 Water', visualTip: 'Stream flowing down rocks' },
  { id: '64', char: '山', pinyin: 'shān', vuk: 'šan', translation: 'Planina', english: 'Mountain', emoji: '🏔️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '山 Mountain', visualTip: 'Three mountain peaks standing tall' },
  { id: '65', char: '日月', pinyin: 'rì yuè', vuk: 'ži jue', translation: 'Sunce i Mesec', english: 'Sun and Moon', emoji: '☯️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '日 Sun', visualTip: 'Day and Night eternal cycle' },
  { id: '66', char: '书', pinyin: 'shū', vuk: 'šu', translation: 'Knjiga', english: 'Book', emoji: '📖', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '乛 Hook', visualTip: 'Bound scroll manuscript' },
  { id: '67', char: '今天', pinyin: 'jīn tiān', vuk: 'đin tjen', translation: 'Danas', english: 'Today', emoji: '📅', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '人 Person', visualTip: 'Present moment under sky' },
  { id: '68', char: '时间', pinyin: 'shí jiān', vuk: 'ši đjen', translation: 'Vreme', english: 'Time', emoji: '⏳', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '日 Sun', visualTip: 'Sun moving through door space' },
  { id: '69', char: '力量', pinyin: 'lì liàng', vuk: 'li ljang', translation: 'Snaga / Sila', english: 'Power / Strength', emoji: '💪', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '力 Power', visualTip: 'Flexed muscle and weight' },
  { id: '70', char: '智慧', pinyin: 'zhì huì', vuk: 'dži hui', translation: 'Mudrost', english: 'Wisdom', emoji: '🦉', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '日 Sun', visualTip: 'Sun illumining intelligent heart' },
  { id: '71', char: '健康', pinyin: 'jiàn kāng', vuk: 'đjen kang', translation: 'Zdravlje', english: 'Health', emoji: '🍏', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '亻 Person', visualTip: 'Vigorous human vitality' },
  { id: '72', char: '平息', pinyin: 'píng xī', vuk: 'ping si', translation: 'Mir / Spokoj', english: 'Calm / Tranquility', emoji: '🕊️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '干 Shield', visualTip: 'Level balance in heart' },
  { id: '73', char: '谢谢', pinyin: 'xiè xiè', vuk: 'sje sje', translation: 'Hvala', english: 'Thank you', emoji: '🙏', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '讠 Speech', visualTip: 'Expressing gratitude with words' },
  { id: '74', char: '再见', pinyin: 'zài jiàn', vuk: 'dzai đjen', translation: 'Doviđenja', english: 'Goodbye / See you again', emoji: '👋', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '冂 Border', visualTip: 'Seeing each other again' },
  { id: '75', char: '日', pinyin: 'rì', vuk: 'ži', translation: 'Dan / Sunce', english: 'Day / Sun', emoji: '☀️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '日 Sun', visualTip: 'Solar disc with center ray' },
  { id: '76', char: '月', pinyin: 'yuè', vuk: 'jue', translation: 'Mesec', english: 'Month / Moon', emoji: '🌙', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '月 Moon', visualTip: 'Crescent moon in night sky' },
  { id: '77', char: '人', pinyin: 'rén', vuk: 'žen', translation: 'Čovek / Osoba', english: 'Person / Human', emoji: '👤', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '人 Person', visualTip: 'Two legs standing proud' },
  { id: '78', char: '茶', pinyin: 'chá', vuk: 'ča', translation: 'Čaj', english: 'Tea', emoji: '🍵', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '艹 Grass', visualTip: 'Tea leaves picked from wood' },
  { id: '79', char: '咖啡', pinyin: 'kā fēi', vuk: 'ka fej', translation: 'Kafa', english: 'Coffee', emoji: '☕', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '口 Mouth', visualTip: 'Aromatic warm coffee brew' },
  { id: '80', char: '苹果', pinyin: 'píng guǒ', vuk: 'ping guo', translation: 'Jabuka', english: 'Apple', emoji: '🍎', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '艹 Grass', visualTip: 'Fresh sweet round fruit' },
  { id: '81', char: '米饭', pinyin: 'mǐ fàn', vuk: 'mi fan', translation: 'Kuvani pirinač / Obrok', english: 'Cooked rice / Meal', emoji: '🍚', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '米 Rice', visualTip: 'Steamed rice grains bowl' },
  { id: '82', char: '猫', pinyin: 'māo', vuk: 'mao', translation: 'Mačka', english: 'Cat', emoji: '🐱', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '豸 Beast', visualTip: 'Graceful feline crouching' },
  { id: '83', char: '狗', pinyin: 'gǒu', vuk: 'gou', translation: 'Pas', english: 'Dog', emoji: '🐶', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '犭 Animal', visualTip: 'Loyal canine companion' },
  { id: '84', char: '鱼', pinyin: 'yú', vuk: 'ju', translation: 'Riba', english: 'Fish', emoji: '🐟', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '鱼 Fish', visualTip: 'Fish swimming with tail fins' },
  { id: '85', char: '钱', pinyin: 'qián', vuk: 'ćien', translation: 'Novac', english: 'Money', emoji: '💵', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '钅 Metal', visualTip: 'Precious metal currency' },
  { id: '86', char: '车', pinyin: 'chē', vuk: 'če', translation: 'Auto / Vozilo', english: 'Car / Vehicle', emoji: '🚗', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '车 Cart', visualTip: 'Wheeled chariot vehicle' },
  { id: '87', char: '手', pinyin: 'shǒu', vuk: 'šou', translation: 'Ruka', english: 'Hand', emoji: '✋', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '手 Hand', visualTip: 'Five fingers outstretched' },
  { id: '88', char: '头', pinyin: 'tóu', vuk: 'tou', translation: 'Glava', english: 'Head', emoji: '👤', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '大 Big', visualTip: 'Human head resting on neck' },
  { id: '89', char: '眼睛', pinyin: 'yǎn jing', vuk: 'jen đing', translation: 'Oči', english: 'Eyes', emoji: '👀', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '目 Eye', visualTip: 'Pair of clear seeing eyes' },
  { id: '90', char: '耳朵', pinyin: 'ěr duo', vuk: 'er duo', translation: 'Uši / Slušalice', english: 'Ears', emoji: '🎧', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '耳 Ear', visualTip: 'Auditory ear contours' },
  { id: '91', char: '衣服', pinyin: 'yī fu', vuk: 'i fu', translation: 'Odeća', english: 'Clothes', emoji: '👔', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '衣 Clothes', visualTip: 'Garments protecting body' },
  { id: '92', char: '学校', pinyin: 'xué xiào', vuk: 'sjue sjao', translation: 'Škola', english: 'School', emoji: '🏫', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '木 Wood', visualTip: 'Academy hall for learning' },
  { id: '93', char: '老师', pinyin: 'lǎo shī', vuk: 'lao ši', translation: 'Nastavnik / Profesor', english: 'Teacher', emoji: '👨‍🏫', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '老 Old', visualTip: 'Venerable guide imparting wisdom' },
  { id: '94', char: '学生', pinyin: 'xué shēng', vuk: 'sjue šeng', translation: 'Učenik / Student', english: 'Student', emoji: '🧑‍🎓', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '生 Life', visualTip: 'Youth growing through learning' },
  { id: '95', char: '手机', pinyin: 'shǒu jī', vuk: 'šou đji', translation: 'Mobilni telefon', english: 'Mobile phone', emoji: '📱', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '手 Hand', visualTip: 'Handheld electronic device' },
  { id: '96', char: '电脑', pinyin: 'diàn nǎo', vuk: 'đjien nao', translation: 'Računar / Kompjuter', english: 'Computer', emoji: '💻', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '电 Electric', visualTip: 'Electric brain storing knowledge' },
  { id: '97', char: '飞机', pinyin: 'fēi jī', vuk: 'fej đji', translation: 'Avion', english: 'Airplane', emoji: '✈️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '飞 Fly', visualTip: 'Flying machine above clouds' },
  { id: '98', char: '太阳', pinyin: 'tài yáng', vuk: 'tai jang', translation: 'Sunce', english: 'Sun / Solar light', emoji: '☀️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '日 Sun', visualTip: 'Supreme radiant sun' },
  { id: '99', char: '月亮', pinyin: 'yuè liang', vuk: 'jue ljang', translation: 'Mesec', english: 'Moon', emoji: '🌙', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '月 Moon', visualTip: 'Bright nocturnal moon' },
  { id: '100', char: '海洋', pinyin: 'hǎi yáng', vuk: 'hai jang', translation: 'Okean / More', english: 'Ocean / Sea', emoji: '🌊', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '氵 Water', visualTip: 'Vast blue ocean water' },
  { id: '101', char: '森林', pinyin: 'sēn lín', vuk: 'sen lin', translation: 'Šuma', english: 'Forest', emoji: '🌲', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '木 Tree', visualTip: 'Dense canopy of many trees' },
  { id: '102', char: '城市', pinyin: 'chéng shì', vuk: 'čeng ši', translation: 'Grad', english: 'City', emoji: '🏙️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '土 Earth', visualTip: 'Metropolis wall & market' },
  { id: '103', char: '音乐', pinyin: 'yīn yuè', vuk: 'in jue', translation: 'Muzika', english: 'Music', emoji: '🎵', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '音 Sound', visualTip: 'Melodic sound composition' },
  { id: '104', char: '梦想', pinyin: 'mèng xiǎng', vuk: 'meng sjang', translation: 'San / Vizija', english: 'Dream / Vision', emoji: '💭', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '夕 Evening', visualTip: 'Evening vision in heart' },
  { id: '105', char: '和平', pinyin: 'hé píng', vuk: 'he ping', translation: 'Mir / Harmonija', english: 'Peace / Harmony', emoji: '🕊️', category: 'svakodnevno', categoryLabel: 'Svakodnevno', radical: '口 Mouth', visualTip: 'Balanced sharing of grain and speech' },

  // Filozofija & Stoic (30)
  { id: '106', char: '道', pinyin: 'dào', vuk: 'dao', translation: 'Dao / Put / Istina', english: 'The Way / Dao / Path', emoji: '☯️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '辶 Walk', visualTip: 'Mindful walking on true path' },
  { id: '107', char: '德', pinyin: 'dé', vuk: 'de', translation: 'Vrline / Moralni karakter', english: 'Virtue / Integrity', emoji: '🛡️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '彳 Step', visualTip: 'Upright heart walking with honor' },
  { id: '108', char: '无为', pinyin: 'wú wéi', vuk: 'vu vej', translation: 'Vu Vei / Prirodno delovanje', english: 'Effortless action / Non-striving', emoji: '🍃', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '火 Fire', visualTip: 'Flowing with nature without egoic struggle' },
  { id: '109', char: '阴阳', pinyin: 'yīn yáng', vuk: 'jin jang', translation: 'Jin i Jang / Harmonija', english: 'Yin & Yang / Duality', emoji: '☯️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '阝 Hill', visualTip: 'Shade and light balancing hill' },
  { id: '110', char: '气', pinyin: 'qì', vuk: 'ći', translation: 'Ći / Životna energija', english: 'Vital Energy / Breath', emoji: '💨', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '气 Air', visualTip: 'Steam rising from cooking rice' },
  { id: '111', char: '禅', pinyin: 'chán', vuk: 'čan', translation: 'Zen / Meditacija', english: 'Zen / Meditation', emoji: '🧘', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '示 Spirit', visualTip: 'Quiet spiritual contemplation' },
  { id: '112', char: '静', pinyin: 'jìng', vuk: 'đjing', translation: 'Tišina / Staloženost', english: 'Tranquility / Stillness', emoji: '🧘‍♀️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '青 Blue', visualTip: 'Blue sky clear serenity' },
  { id: '113', char: '定', pinyin: 'dìng', vuk: 'đing', translation: 'Fokus / Nepokolebljivost', english: 'Steadfastness / Focus', emoji: '🎯', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '宀 Roof', visualTip: 'Unshakable anchor under roof' },
  { id: '114', char: '悟', pinyin: 'wù', vuk: 'vu', translation: 'Prosvetljenje / Spoznaja', english: 'Enlightenment / Realization', emoji: '💡', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '忄 Heart', visualTip: 'Heart awakening to truth' },
  { id: '115', char: '毅力', pinyin: 'yì lì', vuk: 'i li', translation: 'Istrajnost / Volja', english: 'Willpower / Fortitude', emoji: '🏋️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '力 Strength', visualTip: 'Steel determination' },
  { id: '116', char: '节制', pinyin: 'jié zhì', vuk: 'đje dži', translation: 'Umerenost / Kontrola', english: 'Temperance / Moderation', emoji: '⚖️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '竹 Bamboo', visualTip: 'Measured bamboo joints' },
  { id: '117', char: '勇气', pinyin: 'yǒng qì', vuk: 'jong ći', translation: 'Hrabrost', english: 'Courage / Bravery', emoji: '🦁', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '力 Power', visualTip: 'Lionhearted inner power' },
  { id: '118', char: '正义', pinyin: 'zhèng yì', vuk: 'dženg i', translation: 'Pravda / Pravednost', english: 'Justice / Righteousness', emoji: '⚖️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '止 Stop', visualTip: 'Upright alignment with truth' },
  { id: '119', char: '谦逊', pinyin: 'qiān xùn', vuk: 'ćien sjun', translation: 'Skromnost / Poniznost', english: 'Humility / Modesty', emoji: '🌾', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '讠 Speech', visualTip: 'Bending like heavy grain' },
  { id: '120', char: '慈悲', pinyin: 'cí bēi', vuk: 'ci bej', translation: 'Saosećajnost', english: 'Compassion / Mercy', emoji: '🤲', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '心 Heart', visualTip: 'Heart empathizing with all beings' },
  { id: '121', char: '专注', pinyin: 'zhuān zhù', vuk: 'džuan džu', translation: 'Koncentracija', english: 'Deep Focus / Concentration', emoji: '🔍', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '氵 Water', visualTip: 'Pouring full attention like water stream' },
  { id: '122', char: '忍耐', pinyin: 'rěn nài', vuk: 'žen nai', translation: 'Strpljenje / Podnošenje', english: 'Endurance / Patience', emoji: '⏳', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '心 Heart', visualTip: 'Blade resting above heart with calm endurance' },
  { id: '123', char: '自律', pinyin: 'zì lǜ', vuk: 'dzi lu', translation: 'Samodisciplina', english: 'Self-discipline', emoji: '📏', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '自 Self', visualTip: 'Self-mastery by personal standard' },
  { id: '124', char: '觉悟', pinyin: 'jué wù', vuk: 'đjue vu', translation: 'Svesnost / Awakeness', english: 'Awakening / Realization', emoji: '👁️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '见 See', visualTip: 'Eyes opening to ultimate reality' },
  { id: '125', char: '舍得', pinyin: 'shě de', vuk: 'še de', translation: 'Puštanje / Velikodušnost', english: 'Letting go / Giving', emoji: '🎁', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '舌 Tongue', visualTip: 'Releasing attachment to gain peace' },
  { id: '126', char: '自强不息', pinyin: 'zì qiáng bù xī', vuk: 'dzi ćjang bu si', translation: 'Neprekidno samousavršavanje', english: 'Relentless self-striving', emoji: '⛰️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '自 Self', visualTip: 'Constantly striving for strength like heavens' },
  { id: '127', char: '知行合一', pinyin: 'zhī xíng hé yī', vuk: 'dži sing he i', translation: 'Jedinstvo znanja i delovanja', english: 'Unity of knowledge & action', emoji: '🎯', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '矢 Arrow', visualTip: 'Knowledge proven through action' },
  { id: '128', char: '宁静致远', pinyin: 'níng jìng zhì yuǎn', vuk: 'ning đjing dži jien', translation: 'Duboka tišina vodi daleko', english: 'Stillness leads to far vision', emoji: '🌌', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '宀 Roof', visualTip: 'Peaceful mind achieving grand goals' },
  { id: '129', char: '厚德载物', pinyin: 'hòu dé zǎi wù', vuk: 'hou de dzai vu', translation: 'Veliko poštenje nosi svet', english: 'Great virtue carries all things', emoji: '🌍', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '厂 Cliff', visualTip: 'Profound virtue sustaining community' },
  { id: '130', char: '天人合一', pinyin: 'tiān rén hé yī', vuk: 'tjen žen he i', translation: 'Jedinstvo čoveka i prirode', english: 'Harmony of man and cosmos', emoji: '🌱', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '天 Heaven', visualTip: 'Total alignment with cosmic order' },
  { id: '131', char: '修身养性', pinyin: 'xiū shēn yǎng xìng', vuk: 'sju šen jang sing', translation: 'Kultivacija tela i uma', english: 'Cultivating mind & body', emoji: '🧘‍♂️', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '亻 Person', visualTip: 'Daily Stoic polish of inner character' },
  { id: '132', char: '言行一致', pinyin: 'yán xíng yī zhì', vuk: 'jen sing i dži', translation: 'Reči i dela su jedno', english: 'Alignment of words & deeds', emoji: '💬', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '言 Speech', visualTip: 'Absolute personal credibility' },
  { id: '133', char: '不忘初心', pinyin: 'bù wàng chū xīn', vuk: 'bu vang ču sin', translation: 'Ostani veran početnoj nameri', english: 'Keep your beginner mind', emoji: '🌱', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '心 Heart', visualTip: 'Never forgetting core vision' },
  { id: '134', char: '知足常乐', pinyin: 'zhī zú cháng lè', vuk: 'dži dzu čang le', translation: 'Zadovoljstvo donosi trajno uživanje', english: 'Contentment brings ongoing joy', emoji: '😊', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '矢 Arrow', visualTip: 'Finding wealth in present moment' },
  { id: '135', char: '上善若水', pinyin: 'shàng shàn ruò shuǐ', vuk: 'šang šan žuo šui', translation: 'Najveća dobrota je poput vode', english: 'Highest virtue flows like water', emoji: '🌊', category: 'filozofija', categoryLabel: 'Filozofija Stoik', radical: '水 Water', visualTip: 'Nourishing all without competition' }
];

export const ChineseVocabView: React.FC<ChineseVocabViewProps> = ({ isDarkMode, isGirlyMode, user }) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'canvas' | 'weaver' | 'quiz'>('learn');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strofa_1' | 'refren' | 'glagoli' | 'svakodnevno' | 'filozofija'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Weaver
  const [selectedWeaverItems, setSelectedWeaverItems] = useState<VocabItem[]>([]);
  const [wovenSentence, setWovenSentence] = useState<{ chinese: string; pinyin: string; vuk: string; serbian: string } | null>(null);

  // Quiz
  const [quizStarted, setQuizStarted] = useState(false);
  const [roundQuestions, setRoundQuestions] = useState<{
    vocab: VocabItem;
    options: string[];
    correctIndex: number;
    questionType: 'meaning' | 'vuk' | 'pinyin' | 'listen';
  }[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  // Persistence
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [isPronouncing, setIsPronouncing] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const speakChineseAudioFallback = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    const audio = new Audio(`https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(text)}`);
    audio.play().then(() => {
      if (id) setTimeout(() => setIsPronouncing(null), 1200);
    }).catch(err => {
      console.warn("Audio playback issue:", err);
      if (id) setIsPronouncing(null);
    });
  };

  const speakChinese = (text: string, id?: string) => {
    if (id) setIsPronouncing(id);
    if (!('speechSynthesis' in window)) {
      speakChineseAudioFallback(text, id);
      return;
    }

    window.speechSynthesis.cancel();
    const voices = window.speechSynthesis.getVoices();
    const zhVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith('zh') || 
      v.name.toLowerCase().includes('chinese') ||
      v.name.toLowerCase().includes('huihui')
    );

    if (zhVoice) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.85;
      utterance.voice = zhVoice;
      utterance.onend = () => { if (id) setIsPronouncing(null); };
      utterance.onerror = () => speakChineseAudioFallback(text, id);
      window.speechSynthesis.speak(utterance);
    } else {
      speakChineseAudioFallback(text, id);
    }
  };

  useEffect(() => {
    const loadProgress = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid, 'progress', 'chinese');
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
        const localMastered = localStorage.getItem('wf_chinese_mastered');
        const localHighScore = localStorage.getItem('wf_chinese_highscore');
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
        const docRef = doc(db, 'users', user.uid, 'progress', 'chinese');
        await setDoc(docRef, {
          masteredIds: newMastered,
          highScore: Math.max(highScore, newHighScore),
          lastUpdated: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('wf_chinese_mastered', JSON.stringify(newMastered));
      localStorage.setItem('wf_chinese_highscore', Math.max(highScore, newHighScore).toString());
    }
  };

  const filteredVocab = useMemo(() => {
    return VOCAB_DATA.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.char.toLowerCase().includes(q) ||
        item.pinyin.toLowerCase().includes(q) ||
        item.vuk.toLowerCase().includes(q) ||
        item.translation.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        (item.radical && item.radical.toLowerCase().includes(q));
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

  const handleCopy = (item: VocabItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${item.emoji} ${item.char} [${item.pinyin}] (${item.vuk})\n🇭🇷 ${item.translation}\n🇬🇧 ${item.english}\n${item.radical ? `🏮 Radikal: ${item.radical}\n` : ''}✨ WiseFit Sanctuary Chinese`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(item.id);
      playSound('correct');
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const generateQuizRound = () => {
    const shuffled = [...VOCAB_DATA].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5);
    
    const questionsList = selected.map(vocab => {
      const types: ('meaning' | 'vuk' | 'pinyin' | 'listen')[] = ['meaning', 'vuk', 'pinyin', 'listen'];
      const questionType = types[Math.floor(Math.random() * types.length)];
      
      const otherVocabs = VOCAB_DATA.filter(v => v.id !== vocab.id);
      const wrongShuffled = otherVocabs.sort(() => Math.random() - 0.5).slice(0, 3);
      
      let correctAnswer = '';
      let wrongAnswers: string[] = [];

      if (questionType === 'meaning') {
        correctAnswer = `${vocab.emoji} ${vocab.translation} (${vocab.english})`;
        wrongAnswers = wrongShuffled.map(w => `${w.emoji} ${w.translation} (${w.english})`);
      } else if (questionType === 'vuk') {
        correctAnswer = `Vuk: "${vocab.vuk}" [Pinyin: ${vocab.pinyin}]`;
        wrongAnswers = wrongShuffled.map(w => `Vuk: "${w.vuk}" [Pinyin: ${w.pinyin}]`);
      } else if (questionType === 'pinyin') {
        correctAnswer = `${vocab.char} — ${vocab.pinyin}`;
        wrongAnswers = wrongShuffled.map(w => `${w.char} — ${w.pinyin}`);
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
      setTimeout(() => speakChinese(questionsList[0].vocab.char), 600);
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
        setTimeout(() => speakChinese(roundQuestions[nextIdx].vocab.char), 400);
      }
    } else {
      setQuizComplete(true);
      playSound('complete');
    }
  };

  const handleToggleWeaverSelect = (item: VocabItem) => {
    if (selectedWeaverItems.find(i => i.id === item.id)) {
      setSelectedWeaverItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      if (selectedWeaverItems.length >= 3) return;
      setSelectedWeaverItems(prev => [...prev, item]);
    }
  };

  const weaveSentence = () => {
    if (selectedWeaverItems.length === 0) return;
    const wordsZh = selectedWeaverItems.map(i => i.char).join('');
    const wordsPy = selectedWeaverItems.map(i => i.pinyin).join(' ');
    const wordsVuk = selectedWeaverItems.map(i => i.vuk).join(' ');
    const wordsSer = selectedWeaverItems.map(i => i.translation.split('/')[0].trim()).join(', ');

    setWovenSentence({
      chinese: `在我的心中，我思考${wordsZh}`,
      pinyin: `Zài wǒ de xīn zhōng, wǒ sī kǎo ${wordsPy}`,
      vuk: `dzai vo de sin džong, vo si kao ${wordsVuk}`,
      serbian: `U mom srcu, promišljam o ${wordsSer} — putu do unutrašnjeg mira.`
    });
    speakChinese(`在我的心中，我思考${wordsZh}`);
  };

  const getRankInfo = (count: number) => {
    if (count >= 110) return { name: 'Kineski Mudrac (Shengren 圣人)', desc: 'Potpuno majstorstvo nad 135 visokonaponskih hanzi karaktera', icon: '👑' };
    if (count >= 70) return { name: 'Učenik Dao-a (Dashi 大师)', desc: 'Preko 70 usvojenih reči i stoik filozofskih pojmova', icon: '☯️' };
    if (count >= 35) return { name: 'Istraživač Hanzi-ja (Xuezhe 学者)', desc: 'Solidna baza svakodnevnog i poetičnog kineskog', icon: '🏮' };
    return { name: 'Početnik (Xinren 新人)', desc: 'Krenuli ste stazom usvajanja drevnih karaktera', icon: '🌱' };
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 border-zinc-200/80 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
              🇨🇳 135 Odabranih Hanzi Karaktera
            </span>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Pinyin & Vuk Transliteracija
            </span>
          </div>
          <h2 className={cn(
            "text-2xl md:text-3xl font-black tracking-tight mt-2 flex items-center gap-2",
            isGirlyMode ? "text-pink-950" : isDarkMode ? "text-zinc-50" : "text-zinc-900"
          )}>
            Kineski Hanzi Rečnik & Stoic Filosofija (中文)
          </h2>
          <p className="text-xs md:text-sm font-medium text-zinc-400 mt-1">
            Naučite ključne reči, glagole i mudrosti uz Vuk Karadžić izgovor, pinyin i vizuelne radikale.
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-amber-600 text-white"
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
                  ? isGirlyMode ? "bg-pink-500 text-white" : "bg-red-600 text-white"
                  : isDarkMode ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-600"
              )}
            >
              <Gamepad2 className="w-3.5 h-3.5" /> Duo Kviz
            </button>
          </div>

          <div className={cn(
            "px-3 py-1.5 rounded-xl flex items-center gap-2 border font-mono text-xs font-black",
            isDarkMode ? "bg-zinc-900 border-zinc-800 text-red-400" : "bg-red-50 border-red-100 text-red-700"
          )}>
            <Trophy className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>{masteredIds.length}/{VOCAB_DATA.length}</span>
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
              isDarkMode ? "bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border-red-500/20" : "bg-gradient-to-r from-red-50 via-white to-red-50/50 border-red-100"
            )}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getRankInfo(masteredIds.length).icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-red-500 font-mono">Čin Hanzi Akademije:</span>
                    <span className="text-sm font-black tracking-tight">{getRankInfo(masteredIds.length).name}</span>
                  </div>
                  <p className="text-xs text-zinc-400">{getRankInfo(masteredIds.length).desc}</p>
                </div>
              </div>
              <div className="text-right font-mono text-xs font-bold text-red-500">
                Savladano {Math.round((masteredIds.length / VOCAB_DATA.length) * 100)}% hanzi karaktera
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Pretraži karaktere, pinyin, radikal ili prevod..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all",
                    isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-red-500" : "bg-white border-zinc-200 text-zinc-900 focus:border-red-500"
                  )}
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
                {[
                  { id: 'all', label: `Sve (${VOCAB_DATA.length})` },
                  { id: 'strofa_1', label: ' Strofa 1' },
                  { id: 'refren', label: ' Refren' },
                  { id: 'glagoli', label: ' Glagoli' },
                  { id: 'svakodnevno', label: ' Svakodnevno' },
                  { id: 'filozofija', label: ' Filozofija Stoik' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                      selectedCategory === cat.id
                        ? "bg-red-600 text-white border-red-600 shadow-sm"
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
                        : (isDarkMode ? "bg-zinc-900/50 border-zinc-800/80 hover:border-red-500/40" : "bg-white border-zinc-200 shadow-sm hover:border-red-300")
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
                            {item.radical && (
                              <span className="ml-1 text-[9px] font-bold text-red-400 font-mono">
                                Radikal: {item.radical}
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
                          title={isMastered ? "Savladano" : "Označi kao savladano"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <h3 className="text-3xl font-serif font-black text-red-500 tracking-wide">
                            {item.char}
                          </h3>
                          <span className="text-xs font-mono font-bold text-amber-500">
                            Pinyin: {item.pinyin}
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
                          <p className="text-[10px] italic text-amber-400/90 pt-0.5">
                            💡 {item.visualTip}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-800/10 dark:border-zinc-800/60">
                      <button
                        onClick={() => speakChinese(item.char, item.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                          isSpeaking 
                            ? "bg-red-600 text-white animate-pulse" 
                            : isDarkMode ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                        )}
                      >
                        <Volume2 className="w-3.5 h-3.5 text-red-400" />
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
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-amber-500/10 border border-red-500/20 text-xs text-red-400 font-medium">
              🎨 <strong>Vizuelni Emodži Canvas:</strong> Brzo pamćenje karaktera uz visoko uočljive emodžije i radikale!
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredVocab.map(item => (
                <div
                  key={`canvas-${item.id}`}
                  onClick={() => speakChinese(item.char, item.id)}
                  className={cn(
                    "p-4 rounded-2xl border text-center flex flex-col items-center justify-between cursor-pointer hover:scale-105 transition-all",
                    isDarkMode ? "bg-zinc-900/60 border-zinc-800 hover:border-red-500/50" : "bg-white border-zinc-200 shadow-sm hover:border-red-300"
                  )}
                >
                  <span className="text-4xl my-2 filter drop-shadow-sm">{item.emoji}</span>
                  <div className="space-y-0.5 w-full">
                    <p className="text-2xl font-serif font-black text-red-500">{item.char}</p>
                    <p className="text-[10px] font-mono font-bold text-amber-500">{item.pinyin}</p>
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
              isDarkMode ? "bg-zinc-900/80 border-amber-500/30" : "bg-amber-50/50 border-amber-200"
            )}>
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-amber-500 animate-spin" />
                <h3 className="text-base font-black tracking-tight">Interaktivni Sklop Rečenica (Kineski Izrazi)</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Izaberite do 3 hanzi karaktera iz rečnika ispod i ispletite pravu upotrebljivu kinesku rečenicu sa izgovorom!
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedWeaverItems.map(item => (
                  <span key={item.id} className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1.5">
                    {item.emoji} {item.char} [{item.pinyin}] ({item.vuk})
                    <button onClick={() => handleToggleWeaverSelect(item)} className="hover:text-red-300">×</button>
                  </span>
                ))}
                {selectedWeaverItems.length === 0 && (
                  <span className="text-xs italic text-zinc-500">Kliknite na karaktere ispod da ih dodate...</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={weaveSentence}
                  disabled={selectedWeaverItems.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
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
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                  <p className="text-2xl font-serif font-black text-amber-300">{wovenSentence.chinese}</p>
                  <p className="text-xs font-mono font-bold text-amber-400">Pinyin: {wovenSentence.pinyin}</p>
                  <p className="text-xs font-mono font-bold text-emerald-400">Vuk: "{wovenSentence.vuk}"</p>
                  <p className="text-xs font-medium text-zinc-200">Prevod: {wovenSentence.serbian}</p>
                  <button
                    onClick={() => speakChinese(wovenSentence.chinese)}
                    className="mt-2 px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 text-white flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Pusti Zvuk Rečenice
                  </button>
                </div>
              )}
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {VOCAB_DATA.slice(0, 36).map(item => {
                const isSelected = selectedWeaverItems.some(i => i.id === item.id);
                return (
                  <button
                    key={`weaver-pick-${item.id}`}
                    onClick={() => handleToggleWeaverSelect(item)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all",
                      isSelected 
                        ? "bg-amber-600 border-amber-500 text-white" 
                        : isDarkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-amber-500/40" : "bg-white border-zinc-200 text-zinc-800"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[10px] font-mono font-bold opacity-80">{item.pinyin}</span>
                    </div>
                    <p className="text-xl font-serif font-bold mt-1">{item.char}</p>
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
                  <div className="text-red-500">
                    Pitanje {questionIdx + 1} / {roundQuestions.length}
                  </div>
                  <div className="text-emerald-500">
                    Poeni: {score}
                  </div>
                </div>

                {/* Question */}
                <div className="text-center space-y-3 my-4">
                  <span className="text-5xl">{roundQuestions[questionIdx].vocab.emoji}</span>
                  <h3 className="text-4xl font-serif font-black text-red-500">
                    {roundQuestions[questionIdx].vocab.char}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Izaberite tačan prevod ili izgovor:
                  </p>
                  <button
                    onClick={() => speakChinese(roundQuestions[questionIdx].vocab.char)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 inline-flex items-center gap-1.5"
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
                          !isAnswered && (isDarkMode ? "bg-zinc-800/60 border-zinc-700 hover:border-red-500" : "bg-zinc-50 border-zinc-200 hover:border-red-400"),
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
                      className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500 transition-all"
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
                  className="px-6 py-2.5 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-500"
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
