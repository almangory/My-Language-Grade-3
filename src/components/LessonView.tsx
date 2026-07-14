import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Lesson, LessonType, GrammarRule } from '../types';
import { Music, Star, BookOpen, Quote, Maximize2, Minimize2, Volume2, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import GrammarCard from './GrammarCard';
import { playSound } from '../utils';
import { motion, AnimatePresence } from 'motion/react';

const FALLBACK_GRAMMAR_RULES: Record<string, GrammarRule> = {
  'u1-l2': {
    title: "قاعدة المد بالألف والواو والياء",
    ruleText: "المد هو إطالة الصوت بحرف من حروف المد الثلاثة: الألف والواو والياء.",
    explanation: "يأتي حرف المد ساكناً وما قبله حركة تجانسه (الفتحة قبل الألف، الضمة قبل الواو، الكسرة قبل الياء).",
    examples: [
      { word: "أبِي", explanation: "مد بالياء، الحرف الممدود هو الباء المكسورة (بِ)." },
      { word: "دَوْمَاً", explanation: "تنوين بالفتح يكتب فوق الحرف مع ألف زائدة." },
      { word: "يَا", explanation: "مد بالألف، الحرف الممدود هو الياء المفتوحة (يَ)." }
    ]
  },
  'u1-l3': {
    title: "قاعدة ال التعريف (اللام الشمسية واللام القمرية)",
    ruleText: "اللام القمرية تُكتب وتُنطق، بينما اللام الشمسية تُكتب ولا تُنطق ويُشدد الحرف بعدها.",
    explanation: "حروف اللام القمرية مجموعة في جملة (ابغ حجك وخف عقيمه). باقي الحروف تكون شمسية.",
    examples: [
      { word: "الْجَار", explanation: "لام قمرية تُنطق بوضوح لوجود حرف الجيم بعدها." },
      { word: "الضَّيْف", explanation: "لام شمسية لا تُنطق، والحرف بعدها (الضاد) مشدد." }
    ]
  },
  'u1-l4': {
    title: "قاعدة التنوين (الضم، الفتح، الكسر)",
    ruleText: "التنوين هو نون ساكنة زائدة تلحق آخر الاسم نطقاً لا كتابة.",
    explanation: "يأتي التنوين على ثلاثة أشكال: تنوين ضم (ــٌ)، تنوين فتح (ــً)، تنوين كسر (ــٍ).",
    examples: [
      { word: "عَيْشٌ", explanation: "تنوين بالضم يوضع فوق الحرف الأخير." },
      { word: "شَرِيفاً", explanation: "تنوين بالفتح تلحق به ألف التنوين الزائدة." },
      { word: "بِصِدْقٍ", explanation: "تنوين بالكسر يوضع تحت الحرف الأخير." }
    ]
  },
  'u1-l5': {
    title: "الفرق بين التاء المربوطة والتاء المفتوحة والهاء",
    ruleText: "التاء المربوطة (ة) تنطق هاءً عند الوقف وتاءً عند الوصل، أما المفتوحة (ت) فتنطق تاءً في الحالتين.",
    explanation: "الهاء (هـ) تنطق هاءً عند الوقف وعند الوصل (مثل: كتابُه).",
    examples: [
      { word: "أَمَانَةٌ", explanation: "تاء مربوطة؛ تنطق تاء عند الوصل (أمانةُ المرء) وهاء عند الوقف (أمانه)." },
      { word: "بَيْت", explanation: "تاء مفتوحة؛ تنطق تاء عند الوقف والوصل." },
      { word: "مَعَه", explanation: "هاء؛ تنطق هاء في الوقف والوصل." }
    ]
  },
  'u2-l1': {
    title: "الفرق بين همزة الوصل وهمزة القطع",
    ruleText: "همزة القطع (أ، إ) تُكتب وتُنطق دائماً، وهمزة الوصل (ا) تُنطق في أول الكلام وتسقط في وسطه.",
    explanation: "يمكنك اختبار الهمزة بوضع حرف الواو قبلها؛ فإذا نُطقت فهي قطع (وإلى)، وإذا سقطت فهي وصل (والعودة).",
    examples: [
      { word: "إِلَى", explanation: "همزة قطع تحت الألف لأنها مكسورة وتُنطق دائماً." },
      { word: "الْمَدْرَسَة", explanation: "همزة وصل في (ال) التعريف تسقط عند الوصل (إلى المدرسة)." },
      { word: "أَنَا", explanation: "همزة قطع مفتوحة فوق الألف." }
    ]
  },
  'u2-l3': {
    title: "الحرف المُشدّد (التضعيف)",
    ruleText: "الحرف المشدد هو في الأصل حرفان متماثلان، الأول ساكن والثاني متحرك، أُدمِجا معاً.",
    explanation: "نضع الشدة (ــّ) فوق الحرف المشدد مع حركته ليدل على أنه يُنطق مرتين بقوة.",
    examples: [
      { word: "تَحِيَّة", explanation: "الياء مشددة بالفتح (يَّ) وهي عبارة عن ياء ساكنة ثم ياء مفتوحة." },
      { word: "الْعَلَم", explanation: "اللام قمرية ساكنة تُنطق بوضوح." }
    ]
  },
  'u2-l4': {
    title: "في الطريق - حروف الجر ودورها",
    ruleText: "حروف الجر تدخل على الأسماء فقط وتجعلها مجرورة (وعلامة جرها الكسرة).",
    explanation: "من أشهر حروف الجر: (مِن، إِلَى، عَنْ، عَلَى، فِي، الْبَاء، الْكَاف، اللَّام).",
    examples: [
      { word: "فِي الطَّرِيقِ", explanation: "حرف الجر (في) يجر كلمة (الطريقِ) بالكسرة الظاهرة." },
      { word: "عَلَى الرَّصِيفِ", explanation: "حرف الجر (على) يليه اسم مجرور بالكسرة." }
    ]
  },
  'u3-l1': {
    title: "ياء الملكية في الأسماء",
    ruleText: "ياء الملكية هي ياء تضاف إلى نهاية الاسم لتدل على أن هذا الشيء يخص المتكلم.",
    explanation: "تكون ياء الملكية دائماً مسبوقة بحرف مكسور وتجعل الكلمة مضافة للمتكلم.",
    examples: [
      { word: "بِلَادِي", explanation: "الياء في آخر الاسم تدل على بلدي أنا." },
      { word: "أَبِي", explanation: "تدل على والدي أنا." },
      { word: "كِتَابِي", explanation: "تدل على كتابي الخاص بي." }
    ]
  },
  'u3-l2': {
    title: "أسلوب النداء بـ (يَا)",
    ruleText: "النداء هو لفت انتباه المخاطب لدعوته أو تنبيهه باستخدام أداة النداء (يَا).",
    explanation: "تتكون جملة النداء من: أداة النداء (يَا) + المُنادى (الاسم الذي نناديه).",
    examples: [
      { word: "يَا بِلَادِي", explanation: "أسلوب نداء يعبر عن حب الوطن وتوجيه الخطاب له." },
      { word: "يَا رَبَّنَا", explanation: "نداء ودعاء للخالق عز وجل." }
    ]
  },
  'u3-l5': {
    title: "عيد الاستقلال - أسماء الإشارة",
    ruleText: "أسماء الإشارة هي كلمات نستخدمها للإشارة إلى أشخاص أو أشياء محددة.",
    explanation: "نستخدم (هَذَا) للمفرد المذكر، و(هَذِهِ) للمفردة المؤنثة.",
    examples: [
      { word: "هَذَا بَلَدِي", explanation: "اسم إشارة للمفرد المذكر القريب." },
      { word: "هَذِهِ بِلَادِي", explanation: "اسم إشارة للمؤنث أو جمع غير العاقل." }
    ]
  },
  'u4-l1': {
    title: "اللام الشمسية واللام القمرية",
    ruleText: "تُكتب اللام الشمسية ولا تُنطق ويُشدد الحرف بعدها، بينما تُكتب اللام القمرية وتُنطق ساكنة.",
    explanation: "حرف الدال والثاء من الحروف الشمسية، لذا تدغم اللام معهما.",
    examples: [
      { word: "الدِّيك", explanation: "ام شمسية لا تُنطق، وحرف الدال مضعّف." },
      { word: "الثَّعْلَب", explanation: "لام شمسية لا تُنطق، وحرف الثاء مضعّف." },
      { word: "الْغَابَة", explanation: "لام قمرية تُنطق بوضوح لوقوع حرف الغين بعدها." }
    ]
  },
  'u4-l3': {
    title: "حروف العطف (الواو، الفاء، ثُمَّ)",
    ruleText: "حروف العطف تُستخدم للربط بين الكلمات أو الجمل وتنسيق المعنى بينها.",
    explanation: "الواو تفيد المشاركة بدون ترتيب، الفاء تفيد الترتيب والسرعة، ثُمَّ تفيد الترتيب مع التراخي (التأخير).",
    examples: [
      { word: "الْفَأْرُ وَالْقِطُّ", explanation: "حرف العطف (الواو) يربط بين الاثنين معاً." },
      { word: "فَهَرَبَ", explanation: "حرف العطف (الفاء) يدل على سرعة الهروب فوراً." }
    ]
  },
  'u4-l4': {
    title: "جمع التكسير وصيغ الجموع",
    ruleText: "جمع التكسير هو ما دل على أكثر من اثنين وتغيرت فيه صورة مفرده عند الجمع.",
    explanation: "سُمي بجمع التكسير لأنه يكسر الكلمة المفردة ويغير ترتيب حروفها أو حركاتها.",
    examples: [
      { word: "طُيُور", explanation: "جمع تكسير مفرده (طَائِر)." },
      { word: "أَشْجَار", explanation: "جمع تكسير مفرده (شَجَرَة)." },
      { word: "أَوْرَاق", explanation: "جمع تكسير مفرده (وَرَقَة)." }
    ]
  },
  'u4-l5': {
    title: "النمل - الفعل الماضي والمضارع والأمر",
    ruleText: "الكلمة قد تكون فعلاً يدل على حدث مرتبط بزمن معين: ماضٍ، مضارع، أو أمر.",
    explanation: "الفعل الماضي حدث وانتهى، المضارع يحدث الآن ومستمر، الأمر يطلب حدوث فعل في المستقبل.",
    examples: [
      { word: "قَالَ", explanation: "فعل ماضٍ مبني على الفتح يدل على قول حدث في الزمن الماضي." },
      { word: "تَجْمَعُ", explanation: "فعل مضارع يدل على حدث مستمر الآن." },
      { word: "احْفَظْ", explanation: "فعل أمر مبني على السكون يطلب القيام بالحفظ." }
    ]
  },
  'u5-l1': {
    title: "ضمائر المتكلم (أَنَا / نَحْنُ)",
    ruleText: "ضمائر المتكلم نستخدمها عندما نتحدث عن أنفسنا؛ (أَنَا) للمفرد، و(نَحْنُ) للجمع والمثنى.",
    explanation: "تساعدنا ضمائر المتكلم على التعبير عن النفس والهوية بوضوح.",
    examples: [
      { word: "أَنَا", explanation: "ضمير متكلم للمفرد المذكر أو المؤنث." },
      { word: "نَحْنُ نَلْعَبُ", explanation: "ضمير متكلم للجمع يدل على المشاركة." }
    ]
  },
  'u5-l2': {
    title: "الحواس الخمس - ياء النسب المشددة",
    ruleText: "ياء النسب هي ياء مشددة تلحق آخر الاسم المنسوب لتدل على نسبته لشيء ما.",
    explanation: "تُكسر حركة الحرف الذي يسبق ياء النسب مباشرة وتوضع الشدة مع الحركة فوق الياء.",
    examples: [
      { word: "سُودَانِيّ", explanation: "منسوب إلى السودان بزيادة ياء النسب المشددة." },
      { word: "عَرَبِيّ", explanation: "منسوب إلى العرب." }
    ]
  },
  'u5-l3': {
    title: "الدواء في الغذاء - قاعدة الهمزة المتوسطة",
    ruleText: "تُكتب الهمزة المتوسطة بمقارنة حركتها مع حركة الحرف الذي قبلها، وتُكتب على الحرف الذي يناسب الحركة الأقوى.",
    explanation: "ترتيب قوة الحركات: الكسرة (يناسبها الياء ئ)، ثم الضمة (يناسبها الواو ؤ)، ثم الفتحة (يناسبها الألف أ)، ثم السكون.",
    examples: [
      { word: "الْغِذَاءِ", explanation: "همزة متطرفة مكسورة مسبوقة بمد ساكن تكتب على السطر." },
      { word: "الدَّوَاءِ", explanation: "همزة متطرفة مكسورة تكتب على السطر بعد الألف." }
    ]
  },
  'u5-l4': {
    title: "المحافظة على الأسنان - التاء المربوطة والمفتوحة",
    ruleText: "التاء المفتوحة تُكتب (ت) وتُنطق تاء في الوقف والوصل، بينما التاء المربوطة (ة) تُنطق هاء عند الوقف.",
    explanation: "لتفريق بينهما، قف على الكلمة بالسكون؛ فإذا نطقها تغير إلى (هاء) فهي مربوطة، وإن بقيت (تاء) فهي مفتوحة.",
    examples: [
      { word: "فَرْشَاة", explanation: "عند الوقف ننطقها هاء (فرشاه) وعند الوصل تاء، لذا هي تاء مربوطة." },
      { word: "نَظَافَة", explanation: "تاء مربوطة تُنطق هاء عند الوقف (نظافه)." }
    ]
  },
  'u6-l1': {
    title: "المزارع الحكيم - أقسام الكلمة",
    ruleText: "تتكون اللغة العربية من ثلاثة أنواع من الكلمات: الاسم، والفعل، والحرف.",
    explanation: "الاسم يدل على إنسان أو حيوان أو جماد، الفعل يدل على حدث وزمن، والحرف يربط بين الكلمات.",
    examples: [
      { word: "مُزَارِعٌ", explanation: "اسم يدل على مهنة إنسان يقبل التنوين وال التعريف." },
      { word: "يَزْرَعُ", explanation: "فعل مضارع يدل على عمل الزراعة مستمر الآن." },
      { word: "فِي", explanation: "حرف جر يربط الكلمات داخل الجملة." }
    ]
  },
  'u6-l2': {
    title: "أشعب الأكول - همزة القطع",
    ruleText: "تُكتب همزة القطع (أ) فوق الألف إذا كانت مفتوحة أو مضمومة، وتُكتب تحت الألف (إ) إذا كانت مكسورة.",
    explanation: "الهمزة هي صوت يخرج من الحلق وتُرسم علامة رأس العين (ء) لتوضيحه.",
    examples: [
      { word: "أَشْعَبُ", explanation: "همزة قطع مفتوحة فوق الألف." },
      { word: "أُكُولٌ", explanation: "همزة قطع مضمومة فوق الألف." },
      { word: "إِكْرَامٌ", explanation: "همزة قطع مكسورة تحت الألف." }
    ]
  },
  'u6-l3': {
    title: "ملح الطعام - اللام القمرية وحروفها",
    ruleText: "تُنطق اللام القمرية بوضوح وتكون ساكنة ويأتي بعدها حرف غير مشدد.",
    explanation: "حروف اللام القمرية تجتمع في (ابغ حجك وخف عقيمه) مثل الميم في ملح والعين في عيش.",
    examples: [
      { word: "الْمِلْح", explanation: "لام قمرية تُنطق بوضوح، وحرف الميم مفتوح بعدها." },
      { word: "الْبَحْر", explanation: "لام قمرية تُنطق بوضوح." }
    ]
  },
  'u6-l4': {
    title: "التاجر علي واللصوص - الأسماء الموصولة",
    ruleText: "الأسماء الموصولة هي أسماء نستخدمها لربط الجمل وتوضيح المعنى الخاص بالاسم الذي قبلها.",
    explanation: "نستخدم (الَّذِي) للمفرد المذكر، ونستخدم (الَّتِي) للمفردة المؤنثة.",
    examples: [
      { word: "الرَّجُلُ الَّذِي", explanation: "اسم موصول للمفرد المذكر." },
      { word: "الْمَدْرَسَةُ الَّتِي", explanation: "اسم موصول للمفردة المؤنثة." }
    ]
  },
  'u6-l5': {
    title: "لعبة الولد التائه - أسلوب الاستفهام",
    ruleText: "أسلوب الاستفهام هو جملة نستخدمها للسؤال عن شيء مجهول وننهيها بعلامة الاستفهام (؟).",
    explanation: "من أشهر أدوات الاستفهام: (مَنْ) للعاقل، (أَيْنَ) للمكان، (مَتَى) للزمان، (كَيْفَ) للحال.",
    examples: [
      { word: "أَيْنَ الْوَلَدُ؟", explanation: "سؤال عن مكان الولد التائه باستخدام أداة الاستفهام أين." },
      { word: "كَيْفَ نَلْعَبُ؟", explanation: "سؤال عن طريقة أو حال اللعب." }
    ]
  }
};

// Static Image Imports for Production Build Compatibility
import imgSudaneseFamilyLove from '../assets/images/sudanese_family_love_1783937441296.jpg';
import imgSudaneseParentHug from '../assets/images/sudanese_parent_hug_1783937460334.jpg';
import imgSudaneseGuestWelcome from '../assets/images/sudanese_guest_welcome_1783937425720.jpg';
import imgSudaneseChickenSeller from '../assets/images/sudanese_chicken_seller_1783937475265.jpg';
import imgSudaneseSchoolKids from '../assets/images/sudanese_school_kids_1783937490242.jpg';
import imgSchoolCleaningKids from '../assets/images/school_cleaning_kids_1783932758944.jpg';
import imgSudanPrideIllustration from '../assets/images/sudan_pride_illustration_1783925595849.jpg';
import imgSudanMapLandscape from '../assets/images/sudan_map_landscape_1783932792262.jpg';
import imgSudanNatureLandscape from '../assets/images/sudan_nature_landscape_1783932807921.jpg';
import imgSudaneseGirlHorse from '../assets/images/sudanese_girl_horse_1783931339607.jpg';
import imgSudaneseSoldierHero from '../assets/images/sudanese_soldier_hero_1783932818588.jpg';
import imgSudanIndependenceCelebration from '../assets/images/sudan_independence_celebration_1783932830535.jpg';
import imgForestAnimalsIllustration from '../assets/images/forest_animals_illustration_1783925610838.jpg';
import imgBeehiveHoneyBees from '../assets/images/beehive_honey_bees_1783931318188.jpg';
import imgCartoonCatMouse from '../assets/images/cartoon_cat_mouse_1783932842389.jpg';
import imgMeadowBirdsSinging from '../assets/images/meadow_birds_singing_1783932858031.jpg';
import imgAnthillBusyAnts from '../assets/images/anthill_busy_ants_1783932869246.jpg';
import imgBodyHealthRunning from '../assets/images/body_health_running_1783932879813.jpg';
import imgSudaneseWiseFarmer from '../assets/images/sudanese_wise_farmer_1783937507425.jpg';
import imgTeethBrushingKids from '../assets/images/teeth_brushing_kids_1783931303450.jpg';
import imgCoveredCleanFood from '../assets/images/covered_clean_food_1783932920644.jpg';
import imgHungryBoyFeast from '../assets/images/hungry_boy_feast_1783932935766.jpg';
import imgSaltFlatsPortSudan from '../assets/images/salt_flats_port_sudan_1783932946735.jpg';
import imgMagicalCaveTreasure from '../assets/images/magical_cave_treasure_1783931328825.jpg';

const LESSON_ILLUSTRATIONS: Record<string, string> = {
  // Unit 1: قيم وآداب
  'u1-l1': imgSudaneseFamilyLove, // حب الوالدين
  'u1-l2': imgSudaneseParentHug, // نشيد أبي وأمي
  'u1-l3': imgSudaneseGuestWelcome, // إكرام الجار والضيف
  'u1-l4': imgSudaneseChickenSeller, // العيش الشريف
  'u1-l5': imgSudaneseFamilyLove, // مكارم الأخلاق

  // Unit 2: مدرستي
  'u2-l1': imgSudaneseSchoolKids, // العودة إلى المدرسة
  'u2-l2': imgSchoolCleaningKids, // نظافة المدرسة
  'u2-l3': imgSudanPrideIllustration, // تحية العلم
  'u2-l4': imgSudaneseSchoolKids, // في الطريق
  'u2-l5': imgSudaneseSchoolKids, // آداب المشي

  // Unit 3: وطني
  'u3-l1': imgSudanMapLandscape, // أحب بلادي
  'u3-l2': imgSudanNatureLandscape, // يا بلادي
  'u3-l3': imgSudaneseGirlHorse,      // مهيرة بت عبود
  'u3-l4': imgSudaneseSoldierHero, // عبد الفضيل الماظ
  'u3-l5': imgSudanIndependenceCelebration, // عيد الاستقلال

  // Unit 4: من حكم الحيوان
  'u4-l1': imgForestAnimalsIllustration, // الديك والثعلب
  'u4-l2': imgBeehiveHoneyBees,         // خلية النحل
  'u4-l3': imgCartoonCatMouse, // الفأر والقط
  'u4-l4': imgMeadowBirdsSinging, // طيور الرياض
  'u4-l5': imgAnthillBusyAnts, // النمل النشيط

  // Unit 5: صحتي
  'u5-l1': imgBodyHealthRunning, // أنا جسمك
  'u5-l2': imgSudaneseWiseFarmer, // الحواس الخمس
  'u5-l3': imgSudaneseFamilyLove, // الدواء في الغذاء
  'u5-l4': imgTeethBrushingKids,      // الأسنان اللامعة
  'u5-l5': imgCoveredCleanFood, // الأطعمة المكشوفة

  // Unit 6: تأملات متباينة
  'u6-l1': imgSudaneseWiseFarmer,  // المزارع الحكيم
  'u6-l2': imgHungryBoyFeast, // أشعب الأكول
  'u6-l3': imgSaltFlatsPortSudan,  // ملح الطعام
  'u6-l4': imgMagicalCaveTreasure,     // علي واللصوص
  'u6-l5': imgSudaneseSchoolKids, // لعبة الولد التائه
};

const UNIT_ILLUSTRATIONS: Record<string, string> = {
  'unit-1': imgSudaneseFamilyLove,
  'unit-2': imgSudaneseSchoolKids,
  'unit-3': imgSudanPrideIllustration,
  'unit-4': imgForestAnimalsIllustration,
  'unit-5': imgSudaneseFamilyLove,
  'unit-6': imgSudaneseWiseFarmer,
};

const LESSON_DETAILS: Record<string, { sticker: string; desc: string; label: string }> = {
  'u1-l1': { sticker: '👨‍👩‍👦', label: 'حُبُّ الْوَالِدَيْنِ', desc: 'بِرُّ الْوَالِدَيْنِ وَحُبُّ الْأُسْرَةِ الْجَمِيلَةِ الَّتِي تَتْعَبُ مِنْ أَجْلِنَا' },
  'u1-l2': { sticker: '💖', label: 'أَبِي وَأُمِّي', desc: 'نَشِيدُ وَالِدَيَّ الْحَبِيبَيْنِ وَعَطَاؤُهُمَا الدَّافِئُ الْكَبِيرُ' },
  'u1-l3': { sticker: '🏡', label: 'إِكْرَامُ الْجَارِ', desc: 'حُقُوقُ الْجَارِ وَالضَّيْفِ وَإِكْرَامُهُمَا بِالْأَخْلَاقِ الْكَرِيمَةِ' },
  'u1-l4': { sticker: '🐓', label: 'الْعَيْشُ الشَّرِيفُ', desc: 'الْعَيْشُ الشَّرِيفُ وَكِفَاحُ الْعَمِّ حَمْدَانَ الدَّجَّاجِ رَغْمَ الْعَمَى' },
  'u1-l5': { sticker: '🌟', label: 'مَكَارِمُ الْأَخْلَاقِ', desc: 'مِنْ مَكَارِمِ الْأَخْلَاقِ وَالْأَمَانَةِ وَمَحَبَّةِ الْجِيرَانِ وَالْإِخْوَةِ' },
  'u2-l1': { sticker: '🎒', label: 'الْعَوْدَةُ لِلْمَدْرَسَةِ', desc: 'نَشِيدُ الْعَوْدَةِ السَّعِيدَةِ لِمَقَاعِدِ الدِّرَاسَةِ وَالشَّوْقِ لِلْعِلْمِ' },
  'u2-l2': { sticker: '🧹', label: 'نَظَافَةُ الْمَدْرَسَةِ', desc: 'تَنْظِيفُ سَاحَةِ وَفُصُولِ الْمَدْرَسَةِ بِالتَّعَاوُنِ وَالنَّشَاطِ' },
  'u2-l3': { sticker: '🇸🇩', label: 'تَحِيَّةُ الْعَلَمِ', desc: 'تَحِيَّةُ عِلَمِ الْوَّطَنِ الْغَالِي بِكُلِّ فَخْرٍ وَاعْتِزَازٍ وَسَلَامٍ' },
  'u2-l4': { sticker: '🚦', label: 'فِي الطَّرِيقِ', desc: 'تَعَلُّمُ قَوَاعِدِ الْمُرُورِ وَآدَابِ الطَّرِيقِ لِلْمُحَافَظَةِ عَلَى سَلَامَتِنَا' },
  'u2-l5': { sticker: '🚶‍♂️', label: 'آدَابُ الْمَشْيِ', desc: 'نَشِيدُ كَيْفَ أَمْشِي فِي الطَّرِيقِ بِهُدُوءٍ وَاعْتِدَالٍ وَتَجَنُّبِ اللَّعِبِ' },
  'u3-l1': { sticker: '🕊️', label: 'أُحِبُّ بِلَادِي', desc: 'حُبُّ الْوَطَنِ الْغَالِي وَلُغَتِنَا الْجَمِيلَةِ وَحَنِينِ الْحَمَامَةِ لِبَيْتِهَا' },
  'u3-l2': { sticker: '🌳', label: 'يَا بِلَادِي', desc: 'نَشِيدُ يَا بِلَادِي وَجَمَالُ طَبِيعَتِهَا وَأَشْجَارِهَا وَثِمَارِهَا الشَّهِيَّةِ' },
  'u3-l3': { sticker: '🐎', label: 'مَهِيرَةُ بِنْتُ عَبُّودٍ', desc: 'بُطُولَةُ وَشَجَاعَةُ مَهِيرَةَ بِنْتِ عَبُّودٍ وَحَثُّ قَوْمِهَا بِالْحَمَاسِ' },
  'u3-l4': { sticker: '🎖️', desc: 'شَجَاعَةُ الضَّابِطِ عَبْدِ الْفَضِيلِ أَلْمَاظِ وَدِفَاعُهُ عَنِ اسْتِقْلَالِ بِلَادِهِ', label: 'عَبْدُ الْفَضِيلِ أَلْمَاظٌ' },
  'u3-l5': { sticker: '🇸🇩', desc: 'قِصَّةُ يَوْمِ اسْتِقْلَالِ السُّودَانِ الْمَجِيدِ وَرَفْعِ الْعَلَمِ الْحُرِّ', label: 'عِيدُ الِاسْتِقْلَالِ' },
  'u4-l1': { sticker: '🦊', desc: 'فِطْنَةُ وَذَكَاءُ الدِّيكِ لِتَجَنُّبِ مَكْرِ وَخِدَاعِ الثَّعْلَبِ الْمُحْتَالِ', label: 'الدِّيكُ وَالثَّعْلَبُ' },
  'u4-l2': { sticker: '🐝', desc: 'خَلِيَّةُ النَّحْلِ النَّشِيطَةِ وَالتَّعَاوُنِ لِصُنْعِ الْعَسَلِ الشَّافِي لِلنَّاسِ', label: 'خَلِيَّةُ النَّحْلِ' },
  'u4-l3': { sticker: '🐱', desc: 'حِوَارُ الْفَأْرِ الذَّكِيِّ وَالْقِطِّ الشِّرِّيرِ وَسَطِ مِيَاهِ النِّيلِ', label: 'الْفَأْرُ وَالْقِطُّ' },
  'u4-l4': { sticker: '🐦', desc: 'نشيد طُيُورِ الرِّيَاضِ وَأَلْحَانِ الطَّبِيعَةِ وَخَرِيرِ الْمِيَاهِ الْعَذْبَةِ', label: 'طُيُورُ الرِّيَاضِ' },
  'u4-l5': { sticker: '🐜', desc: 'حَيَاةُ النَّمْلِ النَّشِيطِ تَحْتَ الْأَرْضِ وَتَقْسِيمِ الْأَعْمَالِ وَالِادِّخَارِ', label: 'النَّمْلُ النَّشِيطُ' },
  'u5-l1': { sticker: '👦', desc: 'مَرَاحِلُ نُمُوِّ الْجِسْمِ الصَّحِيحِ وَحَاجَتِهِ لِلْغِذَاءِ وَالرِّيَاضَةِ وَالنَّوْمِ', label: 'أَنَا جِسْمُكَ' },
  'u5-l2': { sticker: '👂', desc: 'الْحَوَاسُّ الْخَمْسُ الْعَجِيبَةُ وَكَيْفِيَّةُ اسْتِخْدَامِهَا وَالْمُحَافَظَةِ عَلَيْهَا', label: 'الْحَوَاسُّ الْخَمْسُ' },
  'u5-l3': { sticker: '🍎', desc: 'الدَّوَاءُ فِي الْغِذَاءِ وَتَنَوُّعِ الْأَكْلِ وَحِكْمَةِ الْجَدِّ فِي تَنَوُّعِ الْغِذَاءِ', label: 'الدَّوَاءُ فِي الْغِذَاءِ' },
  'u5-l4': { sticker: '🪥', desc: 'الطَّرِيقَةُ الصَّحِيحَةُ لِتَنْظِيفِ الْأَسْنَانِ بِالْفُرْشَاةِ وَالْمَعْجُونِ', label: 'الْأَسْنَانُ اللَّامِعَةُ' },
  'u5-l5': { sticker: '🦟', desc: 'خَطَرُ الْأَطْعَمَةِ الْمَكْشُوفَةِ وَالْجَرَاثِيمِ وَوِقَايَةُ الصِّحَّةِ بِالنَّظَافَةِ', label: 'الْأَطْعَمَةُ الْمَكْشُوفَةُ' },
  'u6-l1': { sticker: '🌾', desc: 'وَصِيَّةُ الْمُزَارِعِ الْحَكِيمِ لِوَلَدِهِ وَالْبَحْثِ عَنِ الْكَنْزِ الْحَقِيقِيِّ وَهُوَ الْعَمَلُ', label: 'الْمُزَارِعُ الْحَكِيمُ' },
  'u6-l2': { sticker: '🍲', desc: 'نَوَادِرُ أَشْعَبَ الْأَكُولِ الطَّرِيفَةِ وَحُكْمُهُ بِالصُّلْحِ بَيْنَ الْأَكَلَاتِ', label: 'أَشْعَبُ الْأَكُولُ' },
  'u6-l3': { sticker: '🧂', desc: 'مِلْحُ الطَّعَامِ وَفَوَائِدُهُ وَكَيْفِيَّةُ اسْتِخْرَاجِهِ مِنْ مَلَّاحَاتِ بُورْتِسُودَانَ', label: 'مِلْحُ الطَّعَامِ' },
  'u6-l4': { sticker: '🚪', desc: 'مَسْرَحِيَّةُ التَّاجِرِ عَلِيٍّ وَاللُّصُوصِ وَبَوَّابَةِ الْغَارِ السِّحْرِيَّةِ', label: 'عَلِيٌّ وَاللُّصُوصُ' },
  'u6-l5': { sticker: '⭕', desc: 'لُعْبَةُ الْوَلَدِ التَّائِهِ الْجَمِيلَةِ وَأَنَاشِيدِ الطُّفُولَةِ وَمَحَبَّةِ الْأَصْدِقَاءِ', label: 'لُعْبَةُ الْوَلَدِ التَّائِهِ' },
};

interface LessonViewProps {
  lesson: Lesson;
  showGrammarCard?: boolean;
  setShowGrammarCard?: (show: boolean) => void;
}

interface TextToken {
  text: string;
  isWord: boolean;
  isNewline: boolean;
  start: number;
  end: number;
}

function tokenizeText(text: string): TextToken[] {
  const tokens: TextToken[] = [];
  const regex = /(\n+)|(\s+)|([^\s\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const matchedText = match[0];
    const start = match.index;
    const end = start + matchedText.length;
    const isNewline = matchedText.includes('\n');
    const isWord = !isNewline && /[^\s]/.test(matchedText);
    tokens.push({
      text: matchedText,
      isWord,
      isNewline,
      start,
      end,
    });
  }
  return tokens;
}

// Helper to extract proper Embed URL from YouTube or Google Drive links for our interactive player
function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  
  // YouTube checks
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts[1]) {
      const videoId = parts[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1`;
    }
  }
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1`;
      }
    } catch (e) {
      const parts = url.split('v=');
      if (parts[1]) {
        const videoId = parts[1].split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1`;
      }
    }
  }
  if (url.includes('youtube.com/embed/')) {
    return url.includes('?') ? url : `${url}?rel=0&modestbranding=1&iv_load_policy=3&controls=1&fs=1`;
  }
  
  // Google Drive checks
  if (url.includes('drive.google.com/file/d/')) {
    const parts = url.split('drive.google.com/file/d/');
    if (parts[1]) {
      const fileId = parts[1].split('/')[0];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }
  }
  
  return null;
}

export default function LessonView({ 
  lesson,
  showGrammarCard: externalShowGrammarCard,
  setShowGrammarCard: externalSetShowGrammarCard
}: LessonViewProps) {
  const [activeCharIndex, setActiveCharIndex] = React.useState<number>(-1);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [isAudioMinimized, setIsAudioMinimized] = useState<boolean>(false);
  const [localShowGrammarCard, setLocalShowGrammarCard] = useState<boolean>(false);
  const [isLessonFullscreen, setIsLessonFullscreen] = useState<boolean>(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'image' | 'video'>(lesson.videoUrl ? 'video' : 'image');

  // Reset tab and player on lesson change
  React.useEffect(() => {
    setActiveMediaTab(lesson.videoUrl ? 'video' : 'image');
    setActiveCharIndex(-1);
    setIsAudioPlaying(false);
    setIsAudioMinimized(false);
  }, [lesson.id]);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isLessonFullscreen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [isLessonFullscreen]);

  const showGrammarCard = externalShowGrammarCard !== undefined ? externalShowGrammarCard : localShowGrammarCard;
  const setShowGrammarCard = externalSetShowGrammarCard !== undefined ? externalSetShowGrammarCard : setLocalShowGrammarCard;

  const activeGrammarRule = lesson.grammarRule || FALLBACK_GRAMMAR_RULES[lesson.id];

  // Reading Mode States (with LocalStorage persistence)
  const [readingMode, setReadingMode] = useState<'standard' | 'warm' | 'soft-dark'>(() => {
    try {
      return (localStorage.getItem('reading_mode') as 'standard' | 'warm' | 'soft-dark') || 'standard';
    } catch {
      return 'standard';
    }
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    try {
      return (localStorage.getItem('reading_font_size') as 'sm' | 'md' | 'lg' | 'xl') || 'md';
    } catch {
      return 'md';
    }
  });
  const [fontWeight, setFontWeight] = useState<'normal' | 'bold' | 'black'>(() => {
    try {
      return (localStorage.getItem('reading_font_weight') as 'normal' | 'bold' | 'black') || 'bold';
    } catch {
      return 'bold';
    }
  });
  const [textWidth, setTextWidth] = useState<'narrow' | 'medium' | 'wide'>(() => {
    try {
      return (localStorage.getItem('reading_text_width') as 'narrow' | 'medium' | 'wide') || 'medium';
    } catch {
      return 'medium';
    }
  });

  // Persist settings
  React.useEffect(() => {
    try {
      localStorage.setItem('reading_mode', readingMode);
    } catch (e) {}
  }, [readingMode]);

  React.useEffect(() => {
    try {
      localStorage.setItem('reading_font_size', fontSize);
    } catch (e) {}
  }, [fontSize]);

  React.useEffect(() => {
    try {
      localStorage.setItem('reading_font_weight', fontWeight);
    } catch (e) {}
  }, [fontWeight]);

  React.useEffect(() => {
    try {
      localStorage.setItem('reading_text_width', textWidth);
    } catch (e) {}
  }, [textWidth]);

  // Color mapping helpers
  const getTextColor = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'text-charcoal';
    if (mode === 'warm') return 'text-[#4E3620]';
    return 'text-[#F4ECE1]';
  };

  const getHoverBg = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'hover:bg-yellow-accent/40 hover:text-coral';
    if (mode === 'warm') return 'hover:bg-[#EAD4AC]/40 hover:text-[#C84B31]';
    return 'hover:bg-[#4E3D33] hover:text-[#FFE66D]';
  };

  const getHighlightedClass = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'bg-yellow-200 text-[#5B3E1B] font-extrabold scale-105 shadow-sm border-yellow-400';
    if (mode === 'warm') return 'bg-[#EAD4AC] text-[#3D2305] font-extrabold scale-105 shadow-sm border-amber-500';
    return 'bg-yellow-accent text-charcoal font-extrabold scale-105 shadow-sm border-yellow-300';
  };

  const getStanzaHoverBg = (mode: 'standard' | 'warm' | 'soft-dark') => {
    if (mode === 'standard') return 'hover:bg-cream/40 hover:border-yellow-border/60';
    if (mode === 'warm') return 'hover:bg-[#F2E7CD]/45 hover:border-amber-300/60';
    return 'hover:bg-[#3D332B] hover:border-[#4A3D33]/60';
  };

  // Font style mappings
  const fontSizeClass = 
    fontSize === 'sm' ? 'text-base md:text-lg' : 
    fontSize === 'md' ? 'text-lg md:text-xl' : 
    fontSize === 'lg' ? 'text-xl md:text-2xl' : 
    'text-2xl md:text-3xl lg:text-4xl';

  const fontWeightClass = 
    fontWeight === 'normal' ? 'font-semibold' : 
    fontWeight === 'bold' ? 'font-bold' : 
    'font-black';

  const textWidthClass = 
    textWidth === 'narrow' ? 'max-w-xl' : 
    textWidth === 'medium' ? 'max-w-3xl' : 
    'max-w-full';

  // Speech synthesis helpers to speak single words on demand
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove common punctuation and emojis to make pronunciation clean
      const cleanWord = word
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?«»"']/g, "")
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{27BF}]/gu, "")
        .trim();
      if (cleanWord) {
        const ut = new SpeechSynthesisUtterance(cleanWord);
        ut.lang = 'ar-SA';
        const voices = window.speechSynthesis.getVoices();
        const arabicVoice = voices.find(v => v.lang.startsWith('ar')) || null;
        if (arabicVoice) {
          ut.voice = arabicVoice;
        }
        ut.rate = 0.65; // Slightly slower, perfect for children learning to read
        window.speechSynthesis.speak(ut);
      }
    }
  };

  // Helper to get prefix text - set to empty so the TTS reader skips title and new words
  const getPrefixText = (): string => {
    return "";
  };

  // Aggregate text for TTS read-aloud (Directly starts with the lesson content)
  const getFullTextForReading = (): string => {
    let text = "";
    if (lesson.type === LessonType.Poem && lesson.stanzas) {
      text += lesson.stanzas.map(s => `${s.hemistich1}  ${s.hemistich2}`).join('\n');
    } else {
      text += lesson.content;
    }
    return text;
  };

  const prefixLength = 0;

  // Render interactive text with optional word highlighting for prose
  const renderInteractiveText = (text: string) => {
    const tokens = tokenizeText(text);
    
    return (
      <div className="leading-loose mb-2">
        {tokens.map((token, idx) => {
          if (token.isNewline) {
            return (
              <React.Fragment key={idx}>
                {token.text.split('').map((_, i) => <br key={i} />)}
              </React.Fragment>
            );
          }
          
          if (!token.isWord) {
            return <span key={idx}>{token.text}</span>;
          }

          const absStart = prefixLength + token.start;
          const absEnd = prefixLength + token.end;
          const isHighlighted = activeCharIndex >= absStart && activeCharIndex < absEnd;

          const highlightStyle = isHighlighted
            ? getHighlightedClass(readingMode)
            : `${getTextColor(readingMode)} ${getHoverBg(readingMode)} border-transparent`;

          return (
            <span key={idx} className="inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(token.text);
                }}
                className={`cursor-pointer rounded px-1 transition-all duration-150 select-all active:scale-95 border-b-2 ${highlightStyle}`}
                title="اضغط لسماع نطق الكلمة بالصوت 🔊"
              >
                {token.text}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  // Render poetry hemistich with precise offset highlighting
  const renderHemistichTokens = (text: string, startOffset: number) => {
    const tokens = tokenizeText(text);
    return (
      <div className="leading-loose">
        {tokens.map((token, idx) => {
          if (!token.isWord) {
            return <span key={idx}>{token.text}</span>;
          }

          const absStart = startOffset + token.start;
          const absEnd = startOffset + token.end;
          const isHighlighted = activeCharIndex >= absStart && activeCharIndex < absEnd;

          const highlightStyle = isHighlighted
            ? getHighlightedClass(readingMode)
            : `${getTextColor(readingMode)} ${getHoverBg(readingMode)} border-transparent`;

          return (
            <span key={idx} className="inline-block">
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(token.text);
                }}
                className={`cursor-pointer rounded px-1 transition-all duration-150 select-all active:scale-95 border-b-2 ${highlightStyle}`}
                title="اضغط لسماع نطق الكلمة بالصوت 🔊"
              >
                {token.text}
              </span>
            </span>
          );
        })}
      </div>
    );
  };

  // Pre-calculate poem stanza offsets relative to the spoken text
  let currentOffset = prefixLength;
  const stanzasWithOffsets = lesson.stanzas?.map((stanza) => {
    const text1 = stanza.hemistich1;
    const text2 = stanza.hemistich2;
    const startOffset = currentOffset;
    
    // Stanza spoken text is "text1  text2"
    const stanzaLength = text1.length + 2 + text2.length;
    currentOffset += stanzaLength + 1; // +1 for trailing newline
    
    return {
      ...stanza,
      text1,
      text2,
      startOffset,
      text2RelOffset: text1.length + 2,
    };
  }) || [];

  const renderLessonBody = () => {
    return (
      <div className={`transition-all duration-300 ${
        isLessonFullscreen
          ? 'fixed inset-0 z-[99999] overflow-y-auto p-6 md:p-12 rounded-none border-none shadow-none'
          : 'relative rounded-[40px] p-6 md:p-10 shadow-lg border-2'
      } ${
        readingMode === 'standard'
          ? 'bg-white border-yellow-border text-charcoal'
          : readingMode === 'warm'
          ? 'bg-[#FDF6E2] border-amber-300'
          : 'bg-[#2D231D] border-[#4A3D33]'
      }`}>
        {/* PDF notebook margins and hole punches */}
        <div className={`absolute top-0 bottom-0 left-4 w-0.5 ${isLessonFullscreen ? 'hidden' : 'hidden md:block'} transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-rose-200' : readingMode === 'warm' ? 'bg-amber-200/50' : 'bg-[#4A3D33]'
        }`}></div>
        <div className={`absolute top-0 bottom-0 left-6 w-0.5 ${isLessonFullscreen ? 'hidden' : 'hidden md:block'} transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-rose-200' : readingMode === 'warm' ? 'bg-amber-200/50' : 'bg-[#4A3D33]'
        }`}></div>
        
        {/* Punch holes in the book */}
        <div className={`absolute top-1/4 left-1 w-4 h-4 rounded-full border ${isLessonFullscreen ? 'hidden' : 'hidden md:block'} transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-cream border-yellow-border/50' : readingMode === 'warm' ? 'bg-[#FAF4E2] border-amber-300/50' : 'bg-[#1E1E1E] border-[#4A3D33]'
        }`}></div>
        <div className={`absolute top-1/2 left-1 w-4 h-4 rounded-full border ${isLessonFullscreen ? 'hidden' : 'hidden md:block'} transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-cream border-yellow-border/50' : readingMode === 'warm' ? 'bg-[#FAF4E2] border-amber-300/50' : 'bg-[#1E1E1E] border-[#4A3D33]'
        }`}></div>
        <div className={`absolute top-3/4 left-1 w-4 h-4 rounded-full border ${isLessonFullscreen ? 'hidden' : 'hidden md:block'} transition-colors duration-300 ${
          readingMode === 'standard' ? 'bg-cream border-yellow-border/50' : readingMode === 'warm' ? 'bg-[#FAF4E2] border-amber-300/50' : 'bg-[#1E1E1E] border-[#4A3D33]'
        }`}></div>

        {/* Reading Settings Toolbar */}
        <div className={`mb-6 pb-6 border-b-2 border-dashed flex flex-col lg:flex-row items-center justify-between gap-4 select-none relative z-10 transition-colors duration-300 ${
          readingMode === 'standard' 
            ? 'border-yellow-border/30 text-charcoal' 
            : readingMode === 'warm' 
            ? 'border-amber-300/30 text-[#4E3620]' 
            : 'border-[#4A3D33]/40 text-[#F4ECE1]'
        }`}>
          <div className="flex items-center gap-3 w-full lg:w-auto justify-start">
            <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-colors duration-300 ${
              readingMode === 'standard' ? 'bg-coral/10 text-coral' : readingMode === 'warm' ? 'bg-amber-100 text-amber-700' : 'bg-amber-900/40 text-yellow-accent'
            }`}>
              📖
            </span>
            <div className="text-right">
              <h4 className={`text-sm font-black transition-colors duration-300 ${
                readingMode === 'standard' ? 'text-charcoal' : readingMode === 'warm' ? 'text-[#4E3620]' : 'text-[#F4ECE1]'
              }`}>إعدادات القراءة والمظهر</h4>
              <p className={`text-[10px] font-bold transition-colors duration-300 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>تحكم في وضع المظهر وسُمك وحجم وعرض الخطوط لراحة عينيك</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
            {/* Theme / Reading Mode Selector */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <button
                onClick={() => setReadingMode('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  readingMode === 'standard'
                    ? 'bg-white text-charcoal shadow-sm border border-yellow-border/50'
                    : 'text-slate-600 hover:text-charcoal'
                }`}
                title="الوضع الافتراضي الأبيض"
              >
                ☀️ عادي
              </button>
              <button
                onClick={() => setReadingMode('warm')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  readingMode === 'warm'
                    ? 'bg-[#FFF9E6] text-[#4E3620] shadow-sm border border-amber-300/60'
                    : readingMode === 'standard' ? 'text-slate-600 hover:text-charcoal' : 'text-[#9C8F84] hover:text-[#F4ECE1]'
                }`}
                title="الوضع الدافئ المريح جداً للعين"
              >
                🌾 دافئ
              </button>
              <button
                onClick={() => setReadingMode('soft-dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  readingMode === 'soft-dark'
                    ? 'bg-[#2D231D] text-[#F4ECE1] shadow-sm border border-[#4A3D33]'
                    : readingMode === 'standard' ? 'text-slate-600 hover:text-charcoal' : 'text-[#826E5D]'
                }`}
                title="الوضع الهادئ لقرائة ليلية مريحة"
              >
                🌙 هادئ
              </button>
            </div>

            {/* Font Size Selector */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <span className={`text-[10px] font-black px-1 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>الحجم:</span>
              <button
                onClick={() => setFontSize('sm')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                  fontSize === 'sm' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط صغير"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[14px] font-black transition-all cursor-pointer ${
                  fontSize === 'md' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط متوسط"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[18px] font-black transition-all cursor-pointer ${
                  fontSize === 'lg' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط كبير"
              >
                أ
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`w-7 h-7 flex items-center justify-center rounded-lg text-[22px] font-black transition-all cursor-pointer ${
                  fontSize === 'xl' ? 'bg-coral text-white shadow-sm' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="خط ضخم جداً"
              >
                أ+
              </button>
            </div>

            {/* Font Weight Selector (سُمك الخط) */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <span className={`text-[10px] font-black px-1 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>السُّمك:</span>
              <button
                onClick={() => setFontWeight('normal')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  fontWeight === 'normal' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                عادي
              </button>
              <button
                onClick={() => setFontWeight('bold')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  fontWeight === 'bold' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                عريض
              </button>
              <button
                onClick={() => setFontWeight('black')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  fontWeight === 'black' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
              >
                عريض جداً
              </button>
            </div>

            {/* Column Width / Text Width Control (عرض النص) */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors duration-300 ${
              readingMode === 'standard' 
                ? 'bg-cream/70 border-yellow-border/50' 
                : readingMode === 'warm' 
                ? 'bg-[#FAF1DC] border-amber-300/50' 
                : 'bg-[#1E1E1E] border-[#4A3D33]/50'
            }`}>
              <span className={`text-[10px] font-black px-1 ${
                readingMode === 'standard' ? 'text-slate-500' : readingMode === 'warm' ? 'text-[#826E5D]' : 'text-[#9C8F84]'
              }`}>عرض النص:</span>
              <button
                onClick={() => setTextWidth('narrow')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  textWidth === 'narrow' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="عرض النص ضيق ومريح للتركيز"
              >
                ضيق
              </button>
              <button
                onClick={() => setTextWidth('medium')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  textWidth === 'medium' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="عرض النص متوسط"
              >
                متوسط
              </button>
              <button
                onClick={() => setTextWidth('wide')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                  textWidth === 'wide' ? 'bg-coral text-white' : 'text-slate-500 hover:bg-white/40'
                }`}
                title="عرض النص كامل"
              >
                كامل
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => {
                setIsLessonFullscreen(!isLessonFullscreen);
                try { playSound('click'); } catch(e){}
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm border transition-all hover:scale-105 active:scale-95 cursor-pointer bg-amber-400 hover:bg-amber-500 text-slate-900 border-white"
              title={isLessonFullscreen ? "تصغير الشاشة 🗗" : "ملء الشاشة 📺"}
            >
              {isLessonFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>الخروج من ملء الشاشة</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>ملء الشاشة 📺</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Floating exit fullscreen button for convenience */}
        {isLessonFullscreen && (
          <button
            onClick={() => {
              setIsLessonFullscreen(false);
              try { playSound('click'); } catch(e){}
            }}
            className="fixed top-4 left-4 z-[110] bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-full shadow-2xl border-2 border-white transition-all hover:scale-110 active:scale-90 cursor-pointer flex items-center gap-2"
            title="الخروج من ملء الشاشة ❌"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="text-xs font-black">إغلاق ملء الشاشة</span>
          </button>
        )}

        {/* Beautiful Lesson Illustration (Child-appealing, with a Polaroid/Frame effect) */}
        {(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId]) && (
          <div className="mb-8 md:pr-10 flex flex-col items-center">
            <div className={`w-full max-w-2xl p-4 rounded-3xl border-2 shadow-md transform hover:rotate-1 hover:scale-[1.01] transition-all duration-300 relative ${
              readingMode === 'standard' 
                ? 'bg-[#FFFBF0] border-yellow-border' 
                : readingMode === 'warm' 
                ? 'bg-[#F2E8CD] border-amber-300' 
                : 'bg-[#221A15] border-[#4A3D33]'
            }`}>
              
              {/* Creative Sticker Stamp (Lesson-specific) */}
              {LESSON_DETAILS[lesson.id] && (
                <div className={`absolute -top-4 -right-4 border-2 shadow-lg rounded-full px-3.5 py-1.5 z-20 flex items-center gap-2 transform rotate-3 select-none transition-colors duration-300 ${
                  readingMode === 'standard' 
                    ? 'bg-white border-yellow-border text-slate-800' 
                    : readingMode === 'warm' 
                    ? 'bg-[#FCF5E3] border-amber-300 text-[#4E3620]' 
                    : 'bg-[#1E1E1E] border-[#4A3D33] text-[#F4ECE1]'
                }`}>
                  <span className="text-2xl">{LESSON_DETAILS[lesson.id].sticker}</span>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-coral leading-none">طابع ترفيهي 🌟</p>
                    <p className="text-[11px] font-black leading-tight mt-0.5">{LESSON_DETAILS[lesson.id].label}</p>
                  </div>
                </div>
              )}

              {/* Media Selection Tabs if video is available */}
              {lesson.videoUrl && (
                <div className="flex justify-center gap-2 mb-4 border-b-2 border-dashed border-coral/20 pb-3 relative z-10">
                  <button
                    onClick={() => {
                      setActiveMediaTab('image');
                      try { playSound('click'); } catch(e){}
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer border-2 ${
                      activeMediaTab === 'image'
                        ? 'bg-coral text-white border-white shadow-md scale-105'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🎨 الصورة التوضيحية
                  </button>
                  <button
                    onClick={() => {
                      setActiveMediaTab('video');
                      try { playSound('click'); } catch(e){}
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer border-2 ${
                      activeMediaTab === 'video'
                        ? 'bg-emerald-500 text-white border-white shadow-md scale-105 animate-pulse'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🎬 تشغيل الفيديو 📺
                  </button>
                </div>
              )}

              {activeMediaTab === 'video' && lesson.videoUrl ? (
                /* Interactive Video Player */
                <div className="overflow-hidden rounded-2xl relative border border-yellow-border/30 shadow-inner bg-black aspect-[16/9] w-full">
                  {lesson.videoUrl.match(/\.(mp4|webm|ogg)($|\?)/i) ? (
                    <video
                      src={lesson.videoUrl}
                      className="w-full h-full rounded-2xl"
                      controls
                      controlsList="nodownload"
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(lesson.videoUrl) || lesson.videoUrl}
                      title={lesson.title}
                      className="w-full h-full rounded-2xl border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      allowFullScreen
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                    ></iframe>
                  )}
                </div>
              ) : (
                /* Original Image Display */
                <div className="overflow-hidden rounded-2xl relative border border-yellow-border/30 shadow-inner group cursor-zoom-in">
                  <img 
                    src={LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId]} 
                    alt={lesson.title} 
                    className="w-full h-auto aspect-[16/9] object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 select-none"
                    referrerPolicy="no-referrer"
                    onClick={() => setFullScreenImage(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId])}
                  />
                  
                  {/* Fullscreen Button overlay */}
                  <button
                    onClick={() => setFullScreenImage(LESSON_ILLUSTRATIONS[lesson.id] || UNIT_ILLUSTRATIONS[lesson.unitId])}
                    className="absolute top-3 left-3 bg-white/95 hover:bg-white text-coral p-2 rounded-full border border-yellow-border/50 shadow transition active:scale-95 flex items-center gap-1.5 text-[10px] font-black cursor-pointer"
                    title="عرض بملء الشاشة 📺"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>تكبير الصورة 🔍</span>
                  </button>

                  {/* Visual Label overlay */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] md:text-xs font-black text-coral border border-yellow-border/50 shadow flex items-center gap-1">
                    🎨 لوحة الدرس التوضيحية
                  </div>
                </div>
              )}

              {/* Lesson Specific Description */}
              {LESSON_DETAILS[lesson.id] && (
                <div className={`mt-4 p-3 rounded-2xl border transition-colors duration-300 text-right ${
                  readingMode === 'standard' 
                    ? 'bg-white border-yellow-border/30 text-slate-800' 
                    : readingMode === 'warm' 
                    ? 'bg-[#FCF5E3] border-[#4A3D33]/40 text-[#4E3620]' 
                    : 'bg-[#1E1E1E] border-[#4A3D33]/40 text-[#D5C7B7]'
                }`}>
                  <p className="font-extrabold text-xs md:text-sm flex flex-row-reverse items-center gap-2 justify-start leading-relaxed">
                    <span className="text-coral shrink-0">🎯 فكرة الدرس اليوم:</span>
                    <span>{LESSON_DETAILS[lesson.id].desc}</span>
                  </p>
                </div>
              )}

              <p className={`text-center font-bold text-[11px] md:text-xs mt-3 ${
                readingMode === 'standard' ? 'text-slate-600' : readingMode === 'warm' ? 'text-[#6E553F]' : 'text-[#B2A394]'
              }`}>
                {activeMediaTab === 'video' ? '📺 الفيديو التعليمي لدرس:' : '🖼️ رسمة توضيحية لدرس:'} <span className="text-coral underline font-black">{lesson.title}</span>
              </p>
            </div>
          </div>
        )}

        {/* Content Renderers */}
        {lesson.type === LessonType.Poem && lesson.stanzas ? (
          /* Poetry Layout - classical Arabic bicolumn display */
          <div className={`flex flex-col gap-6 md:gap-8 mx-auto py-4 select-text transition-all duration-300 ${textWidthClass}`}>
            {stanzasWithOffsets.map((stanza, index) => (
              <div 
                key={stanza.id}
                className={`grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-center text-center group transition-all duration-200 p-2.5 rounded-2xl border border-transparent ${getStanzaHoverBg(readingMode)}`}
              >
                {/* Right side (الصدر) */}
                <div className={`font-serif leading-relaxed md:text-left md:pl-2 ${fontSizeClass} ${fontWeightClass} ${getTextColor(readingMode)}`}>
                  {renderHemistichTokens(stanza.text1, stanza.startOffset)}
                </div>

                {/* Decorative Separator */}
                <div className="flex justify-center text-coral scale-90 group-hover:scale-110 group-hover:rotate-45 transition-transform duration-300">
                  {index % 2 === 0 ? <Music className="w-5 h-5 fill-current" /> : <Star className="w-5 h-5 fill-current" />}
                </div>

                {/* Left side (العجز) */}
                <div className={`font-serif leading-relaxed md:text-right md:pr-2 ${fontSizeClass} ${fontWeightClass} ${getTextColor(readingMode)}`}>
                  {renderHemistichTokens(stanza.text2, stanza.startOffset + stanza.text2RelOffset)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Normal Lesson Text Layout */
          <div className={`md:pr-10 select-text mx-auto transition-all duration-300 ${textWidthClass}`}>
            <div className={`absolute top-8 right-8 opacity-10 pointer-events-none ${
              readingMode === 'soft-dark' ? 'text-white' : 'text-yellow-accent'
            }`}>
              <Quote className="w-16 h-16 transform scale-x-[-1]" />
            </div>

            <div className={`font-serif leading-loose text-justify whitespace-pre-line ${fontSizeClass} ${fontWeightClass} ${getTextColor(readingMode)}`}>
              {renderInteractiveText(lesson.content)}
            </div>
          </div>
        )}

        {/* Playful cartoon note at the bottom */}
        <div className={`mt-8 border-t-2 border-dashed pt-6 flex items-start gap-3 p-4 rounded-2xl border transition-colors duration-300 ${
          readingMode === 'standard' 
            ? 'border-yellow-border/40 bg-cream/50 border-yellow-border/30' 
            : readingMode === 'warm' 
            ? 'border-amber-300/40 bg-[#FAF1DC]/60 border-amber-300/30 text-[#4E3620]' 
            : 'border-[#4A3D33]/40 bg-[#1E1E1E]/50 border-[#4A3D33]/30 text-[#D5C7B7]'
        }`}>
          <span className="text-3xl">💡</span>
          <div className="text-right">
            <p className="font-bold text-coral text-xs md:text-sm">نصيحة المعلم الصغير 🧑‍🏫:</p>
            <p className={`text-xs mt-1 font-extrabold ${
              readingMode === 'standard' ? 'text-slate-600' : readingMode === 'warm' ? 'text-[#6E553F]' : 'text-[#B2A394]'
            }`}>
              ✨ ميزة جديدة رائعة: اضغط على أي كلمة في الدرس أو النشيد لسماع نطقها الصحيح بالصوت! 🔊
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 select-text text-charcoal">
      {/* Playful Header */}
      <div className="flex flex-col gap-3 bg-white p-6 rounded-[32px] border-2 border-yellow-border relative overflow-hidden shadow-sm">
        {/* Playful absolute accents */}
        <div className="absolute top-2 left-2 text-coral/10 transform rotate-12">
          <BookOpen className="w-16 h-16" />
        </div>
        
        <div className="flex items-center gap-3">
          {lesson.type === LessonType.Poem ? (
            <span className="bg-yellow-accent text-coral px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-sm border border-yellow-border animate-bounce">
              <Music className="w-3.5 h-3.5" />
              نشيد ملون وعذب 🎵
            </span>
          ) : (
            <span className="bg-teal-accent text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1 shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              قراءة ومفردات 📖
            </span>
          )}
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight leading-relaxed">
          {lesson.title}
        </h2>

        {/* New words shelf */}
        {lesson.newWords && lesson.newWords.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-coral bg-cream px-3 py-1.5 rounded-xl border border-yellow-border shadow-sm">
              الكلمات الجديدة ✨ (اضغط لقراءتها):
            </span>
            {lesson.newWords.map((word, index) => (
              <span
                key={index}
                className="bg-white px-3.5 py-1 rounded-full text-xs font-black text-charcoal border-2 border-yellow-border shadow-sm hover:scale-105 hover:bg-cream/40 transition-all duration-150 cursor-pointer"
                title="اضغط للاستماع للكلمة"
                onClick={() => speakWord(word)}
              >
                {word} 🔊
              </span>
            ))}
          </div>
        )}
      </div>

      {isLessonFullscreen && typeof document !== 'undefined'
        ? createPortal(renderLessonBody(), document.body)
        : renderLessonBody()}

      {/* Fullscreen Image Overlay */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullScreenImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl w-full flex flex-col items-center gap-4 text-center">
              <motion.img
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                src={fullScreenImage}
                alt={lesson.title}
                className="max-h-[80vh] max-w-full rounded-2xl border-4 border-white/10 shadow-2xl object-contain select-none"
                referrerPolicy="no-referrer"
              />
              <div className="text-white flex flex-col items-center">
                <p className="font-extrabold text-sm md:text-base">{lesson.title}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullScreenImage(null);
                  }}
                  className="mt-3 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-full transition shadow-md active:scale-95 cursor-pointer"
                >
                  إغلاق المعاينة ❌
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Player Box (صندوق القارئ الآلي العائم) */}
      <AnimatePresence>
        {showAudioPlayer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
            className={`fixed ${isLessonFullscreen ? 'z-[100000]' : 'z-40'} transition-all duration-300 ${
              isAudioMinimized 
                ? 'bottom-24 left-4 right-4 sm:left-auto sm:right-6 md:right-12 w-[calc(100%-2rem)] sm:w-[320px] bg-teal-500 border-4 border-yellow-accent rounded-full py-2.5 px-4 flex items-center justify-between text-white shadow-2xl'
                : 'bottom-44 right-4 left-4 sm:left-auto sm:right-6 md:right-12 max-w-full sm:w-[500px] bg-white rounded-[32px] border-4 border-[#FFD93D] shadow-2xl p-5'
            }`}
            dir="rtl"
          >
            {/* Minimized layout */}
            <div className={`flex items-center justify-between w-full gap-3 select-none ${isAudioMinimized ? '' : 'hidden'}`}>
              <div className="flex items-center gap-2">
                <span className="text-xl animate-bounce">🔊</span>
                <div className="text-right">
                  <p className="text-[10px] text-teal-100 font-extrabold leading-tight">جاري الاستماع للدرس... 📖</p>
                  <p className="text-xs text-white font-black leading-tight max-w-[140px] truncate">{lesson.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setIsAudioMinimized(false);
                    try { playSound('click'); } catch(e){}
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-[10px] font-black transition-colors cursor-pointer"
                  title="عرض أزرار التحكم بالصوت ⚙️"
                >
                  عرض التحكم ⚙️
                </button>
                <button
                  onClick={() => {
                    setShowAudioPlayer(false);
                    setIsAudioPlaying(false);
                    setIsAudioMinimized(false);
                    try { playSound('click'); } catch(e){}
                  }}
                  className="p-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black transition-colors cursor-pointer"
                  title="إغلاق وإيقاف الصوت ❌"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded Full Player layout */}
            <div className={isAudioMinimized ? 'hidden' : ''}>
              {/* Header of the floating box */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs font-black text-coral bg-cream px-2.5 py-1 rounded-full border border-yellow-border">
                    مُسَاعِدُ الْقِرَاءَةِ الذَّكِيِّ
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {isAudioPlaying && (
                    <button
                      onClick={() => {
                        setIsAudioMinimized(true);
                        try { playSound('click'); } catch(e){}
                      }}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-black transition cursor-pointer border border-teal-200"
                      title="تصغير لتتبع القراءة ↘️"
                    >
                      تصغير لتتبع النص ↘️
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowAudioPlayer(false);
                      try { playSound('click'); } catch(e){}
                    }}
                    className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer border border-transparent hover:border-slate-200 active:scale-95"
                    title="إغلاق الصندوق ❌"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* AudioPlayer inside the box */}
              <div className="max-h-[380px] overflow-y-auto pr-1">
                <AudioPlayer 
                  textToRead={getFullTextForReading()} 
                  title={lesson.title} 
                  lessonId={lesson.id}
                  audioUrl={lesson.audioUrl}
                  onBoundary={setActiveCharIndex}
                  onEnd={() => {
                    setActiveCharIndex(-1);
                    setIsAudioPlaying(false);
                    setIsAudioMinimized(false);
                  }}
                  onStart={() => {
                    setActiveCharIndex(-1);
                    setIsAudioPlaying(true);
                    setIsAudioMinimized(true); // Auto minimize to prevent blockage
                  }}
                />
              </div>
              
              <p className="text-center text-[10px] font-bold text-slate-400 mt-3 leading-normal">
                💡 يمكنك استماع القراءة أثناء تصفح الدرس وقراءة الكلمات المضيئة!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Player Trigger Button (أيقونة الصوت العائمة) */}
      <motion.button
        onClick={() => {
          setShowAudioPlayer(!showAudioPlayer);
          try { playSound('click'); } catch(e){}
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-24 right-6 md:right-12 ${isLessonFullscreen ? 'z-[100000]' : 'z-50'} flex items-center justify-center gap-2.5 px-5 py-4 rounded-full shadow-2xl transition-all duration-300 border-3 border-white ${
          showAudioPlayer
            ? 'bg-[#FF6F61] text-white hover:bg-[#FF6F61]/90 shadow-rose-500/30'
            : 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white animate-bounce shadow-emerald-500/30'
        }`}
        style={{ animationDuration: '3s' }}
        title="تنشيط القارئ الصوتي الآلي 🤖🔊"
      >
        <Volume2 className={`w-6 h-6 ${showAudioPlayer ? 'rotate-12' : 'animate-pulse'}`} />
        <span className="text-sm font-black hidden sm:inline-block tracking-tight">الْقَارِئُ الْآلِيُّ 🤖🔊</span>
      </motion.button>

      {/* Floating Grammar Card Box (صندوق القواعد العائم) */}
      {activeGrammarRule && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showGrammarCard && (
            <motion.div 
              key="grammar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`fixed inset-0 ${isLessonFullscreen ? 'z-[100001]' : 'z-[9999]'} flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm`} 
              dir="rtl"
            >
              <motion.div
                key="grammar-modal"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 280 }}
                className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto bg-white rounded-[32px] border-4 border-amber-400 shadow-2xl p-2"
              >
                {/* Close Button on top of the card */}
                <button
                  onClick={() => {
                    setShowGrammarCard(false);
                    try { playSound('click'); } catch(e){}
                  }}
                  className="absolute top-5 left-5 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-all cursor-pointer shadow-md active:scale-95"
                  title="إغلاق ❌"
                >
                  <X className="w-5 h-5" />
                </button>

                <GrammarCard
                  grammarRule={activeGrammarRule}
                  readingMode={readingMode}
                  speakWord={speakWord}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Floating Grammar Rules Trigger Button */}
      {activeGrammarRule && (
        <motion.button
          onClick={() => {
            setShowGrammarCard(!showGrammarCard);
            try { playSound('click'); } catch(e){}
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`fixed bottom-40 right-6 md:right-12 ${isLessonFullscreen ? 'z-[100000]' : 'z-50'} flex items-center justify-center gap-2.5 px-5 py-4 rounded-full shadow-2xl transition-all duration-300 border-3 border-white ${
            showGrammarCard
              ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/30'
              : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white animate-bounce shadow-amber-500/30'
          }`}
          style={{ animationDuration: '4s' }}
          title="مِصْبَاحُ الْقَوَاعِدِ الْإِمْلَائِيَّةِ 💡"
        >
          <span className="text-xl">💡</span>
          <span className="text-sm font-black hidden sm:inline-block tracking-tight">مِصْبَاحُ الْقَوَاعِدِ 💡</span>
        </motion.button>
      )}
    </div>
  );
}
