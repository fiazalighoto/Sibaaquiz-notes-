document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginSection = document.getElementById('login-section');
  const dashboard = document.getElementById('dashboard');
  const notesDisplay = document.getElementById('notes-display');
  const notesPrev = document.getElementById('notes-prev');
  const notesNext = document.getElementById('notes-next');
  const acceptComp = document.getElementById('accept-comp');
  const rejectComp = document.getElementById('reject-comp');
  const compPlaceholder = document.getElementById('comp-placeholder');

  let user = { name: '', phone: '' };
  let currentQuiz = [], quizIndex = 0, userAnswers = [], reviewMode = false;
  let currentNotes = [], notesPage = 0;
  const NOTES_PER_PAGE = 5;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = loginForm.querySelector('#username').value.trim();
    const phone = loginForm.querySelector('#phone').value.trim();
    const password = loginForm.querySelector('#password').value.trim();

    if (!name || !/^03\d{9}$/.test(phone) || password !== '1111') {
      alert('Invalid input. Make sure phone starts with 03 and password is 1111.');
      return;
    }

    user.name = name;
    user.phone = phone;

    loginSection.classList.add('hidden');
    dashboard.classList.remove('hidden');

    sendToSheet("Login Only", 0);
  });

  loginForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      loginForm.dispatchEvent(new Event('submit'));
    }
  });

  const quickQuizMCQs = {
    'Quiz 1': [ {q:"Choose the correct sentence:", opts:["He don’t like coffee", "He doesn’t likes coffee", "He doesn’t like coffee", "He don’t likes coffee"], ans:2},
  {q:"Synonym of “Ubiquitous”:", opts:["Rare", "Everywhere", "Secret", "Slow"], ans:1},
  {q:"Antonym of “Ambiguous”:", opts:["Vague", "Unclear", "Definite", "Obscure"], ans:2},
  {q:"Which word is misspelled?", opts:["Maintenance", "Occurrence", "Accomodation", "Definitely"], ans:2},
  {q:"Identify the passive voice:", opts:["They watched a movie", "A movie was watched by them", "They have watched a movie", "Watching movie is fun"], ans:1},
  {q:"He is ___ honest man:", opts:["a", "an", "the", "no article"], ans:1},
  {q:"She is good ___ math:", opts:["at", "in", "on", "with"], ans:0},
  {q:"Neither of the boys ___ present:", opts:["are", "were", "is", "be"], ans:2},
  {q:"“To hit the nail on the head” means:", opts:["Hurt someone", "Speak exactly right", "Fail badly", "Work hard"], ans:1},
  {q:"The cake ___ baked by my mother:", opts:["is being", "is", "was", "were"], ans:2},
  {q:"Next in series: 2, 6, 12, 20, ___", opts:["30", "28", "26", "24"], ans:1},
  {q:"A man sells item for Rs.240 with 20% profit. Cost price?", opts:["200", "180", "220", "250"], ans:0},
  {q:"Solve: 2x + 3 = 11", opts:["4", "3", "5", "2"], ans:0},
  {q:"Probability of red: 3R, 4G, 5B", opts:["1/4", "1/3", "1/2", "3/12"], ans:0},
  {q:"Average of 5 numbers is 24. Find sum:", opts:["120", "100", "110", "125"], ans:0},
  {q:"(3/4) ÷ (1/2) =", opts:["3/8", "1.5", "3/2", "2"], ans:2},
  {q:"Number divisible by 3 and 5:", opts:["45", "56", "77", "38"], ans:0},
  {q:"Distance from start: 20km N, 15km E:", opts:["25 km", "30 km", "35 km", "√625"], ans:3},
  {q:"Logical Series: 1, 4, 9, 16, ?", opts:["25", "30", "20", "36"], ans:0},
  {q:"What is 15% of 240?", opts:["36", "30", "24", "48"], ans:0},
  {q:"Capital of Canada:", opts:["Toronto", "Montreal", "Vancouver", "Ottawa"], ans:3},
  {q:"UN Secretary-General (2025):", opts:["António Guterres", "Ban Ki-Moon", "Kofi Annan", "Jens Stoltenberg"], ans:0},
  {q:"First woman PM of Pakistan:", opts:["Fatima Jinnah", "Benazir Bhutto", "Hina Rabbani Khar", "Maryam Nawaz"], ans:1},
  {q:"World's largest desert:", opts:["Sahara", "Arabian", "Gobi", "Antarctic"], ans:3},
  {q:"Currency of Japan:", opts:["Yuan", "Dollar", "Yen", "Won"], ans:2},
  {q:"Pakistan Resolution date:", opts:["14 Aug 1947", "23 Mar 1940", "11 Sep 1948", "25 Dec 1930"], ans:1},
  {q:"Fastest land animal:", opts:["Tiger", "Cheetah", "Lion", "Deer"], ans:1},
  {q:"OIC stands for:", opts:["Organisation of Islamic Countries", "Organization of Islamic Cooperation", "Oil Importing Countries", "Organization of International Committee"], ans:1},
  {q:"National bird of Pakistan:", opts:["Chakor", "Peacock", "Parrot", "Dove"], ans:0},
  {q:"Current Chief Justice of Pakistan:", opts:["To be updated", "To be updated", "To be updated", "To be updated"], ans:0} ],
    'Quiz 2': [  {q:"Which of the following sentences uses a subjunctive mood?", opts:["If he was rich, he would help.", "If I were you, I would leave.", "If she is late, we will wait.", "He said he is tired."], ans:1},
  {q:"'To call a spade a spade' means:", opts:["Hide the truth", "Speak bluntly", "Praise someone", "Use tools wisely"], ans:1},
  {q:"Choose the correct word: The scientist was admired for his ___ mind.", opts:["incredulous", "indelible", "incisive", "intangible"], ans:2},
  {q:"What is the antonym of 'abstain'?", opts:["Avoid", "Participate", "Reluctant", "Resist"], ans:1},
  {q:"Correct transformation: 'He said: I had seen the Taj Mahal.'", opts:["He said he saw the Taj Mahal.", "He said he had seen the Taj Mahal.", "He said I had seen the Taj Mahal.", "He said he would have seen the Taj Mahal."], ans:1},
  
  {q:"What is the sum of the first 20 natural numbers?", opts:["210", "200", "220", "190"], ans:0},
  {q:"What is the least number which when divided by 5, 6, and 8 leaves a remainder 3?", opts:["123", "1233", "1236", "243"], ans:2},
  {q:"If sin²θ + cos²θ = ?", opts:["2", "0", "1", "θ"], ans:2},
  {q:"In how many ways can 5 people sit in a row?", opts:["60", "100", "120", "25"], ans:2},
  {q:"If A = 2, B = 5, C = A² + B, what is the value of C?", opts:["6", "9", "7", "11"], ans:3},

  {q:"Which law states: Energy can neither be created nor destroyed?", opts:["Ohm's Law", "Law of Inertia", "Law of Conservation of Energy", "Bernoulli's Law"], ans:2},
  {q:"Which gas is known as 'laughing gas'?", opts:["Carbon dioxide", "Nitrous oxide", "Methane", "Ammonia"], ans:1},
  {q:"What part of the cell contains genetic material?", opts:["Mitochondria", "Ribosomes", "Nucleus", "Cytoplasm"], ans:2},
  {q:"SI unit of pressure is:", opts:["Pascal", "Newton", "Joule", "Watt"], ans:0},
  {q:"Which particle determines the atomic number?", opts:["Electron", "Neutron", "Proton", "Nucleus"], ans:2},

  {q:"Which country has the most natural lakes?", opts:["USA", "Canada", "Russia", "Brazil"], ans:1},
  {q:"Which dam is called the ‘lifeline of Pakistan’?", opts:["Warsak", "Hub", "Mangla", "Tarbela"], ans:3},
  {q:"The first Pakistani to climb Mount Everest:", opts:["Nazir Sabir", "Ali Sadpara", "Hassan Sadpara", "Sajid Ali"], ans:0},
  {q:"Who composed the national anthem music of Pakistan?", opts:["Hafeez Jalandhari", "Ahmad G. Chagla", "Allama Iqbal", "Sohail Rana"], ans:1},
  {q:"How many seats are reserved for women in Pakistan’s National Assembly (2024)?", opts:["60", "70", "40", "45"], ans:0},

  {q:"How many Prophets are mentioned by name in Quran?", opts:["25", "23", "26", "27"], ans:0},
  {q:"Which Surah is called 'Heart of the Quran'?", opts:["Yaseen", "Rehman", "Ikhlas", "Fatiha"], ans:0},
  {q:"Meaning of 'Al-Ghaffar'?", opts:["The Creator", "The Merciful", "The Forgiving", "The Judge"], ans:2},
  {q:"Treaty made with Jews in Madinah?", opts:["Treaty of Hudaibiyah", "Treaty of Aqabah", "Mithaq-e-Madinah", "Treaty of Taif"], ans:2},
  {q:"Angel responsible for rain?", opts:["Israfeel", "Jibrael", "Mikail", "Azrael"], ans:2},

  {q:"Which is not a programming language?", opts:["Python", "Oracle", "C++", "Java"], ans:1},
  {q:"Device connecting multiple networks?", opts:["Router", "Switch", "Hub", "Repeater"], ans:0},
  {q:"Brain of the computer is:", opts:["Hard Drive", "Processor", "RAM", "Motherboard"], ans:1},
  {q:"Protocol used to send email:", opts:["HTTP", "SMTP", "FTP", "IP"], ans:1},
  {q:"Which memory stores BIOS?", opts:["RAM", "Hard Disk", "ROM", "Cache"], ans:2}],
    'Quiz 3': [
  {q:"Choose the most appropriate word: Her ___ remarks revealed deep understanding.", opts:["superficial", "astute", "ambiguous", "verbose"], ans:1},
  {q:"Antonym of 'Concise':", opts:["Brief", "Lengthy", "Succinct", "Compact"], ans:1},
  {q:"Identify the error: 'No sooner he had entered than the bell rang.'", opts:["No sooner", "he had", "entered", "than"], ans:1},
  {q:"Correct sentence:", opts:["He is senior than me.", "He is senior to me.", "He is senior from me.", "He is senior with me."], ans:1},
  {q:"Meaning of idiom: 'Beat around the bush'", opts:["Get to the point", "Talk indirectly", "Argue", "Repeat something"], ans:1},
  
  {q:"Smallest number divisible by 7, 9, and 12:", opts:["252", "504", "315", "630"], ans:1},
  {q:"If x² − 4x + 4 = 0, value of x is:", opts:["0,4", "2", "4", "2,2"], ans:3},
  {q:"If A:B = 5:7 and B:C = 3:4, then A:C = ?", opts:["15:28", "5:4", "7:4", "3:5"], ans:0},
  {q:"If 2logx = 4, then x =", opts:["10", "100", "√10", "10000"], ans:1},
  {q:"What is 0.1% of 5000?", opts:["5", "50", "0.5", "0.05"], ans:0},
  
  {q:"Which law explains floating of ships?", opts:["Pascal's", "Bernoulli's", "Archimedes'", "Newton's"], ans:2},
  {q:"Organelle responsible for protein synthesis?", opts:["Mitochondria", "Ribosome", "Lysosome", "Nucleolus"], ans:1},
  {q:"Blood pH range is:", opts:["6.0–7.0", "7.0–7.8", "7.35–7.45", "7.8–8.0"], ans:2},
  {q:"Valency of carbon (Atomic number = 6):", opts:["2", "4", "6", "8"], ans:1},
  {q:"Enzyme that digests starch:", opts:["Pepsin", "Lipase", "Amylase", "Trypsin"], ans:2},
  
  {q:"City known as 'City of Saints':", opts:["Lahore", "Sukkur", "Multan", "Peshawar"], ans:2},
  {q:"Smallest province of Pakistan by area?", opts:["Sindh", "Punjab", "KPK", "Balochistan"], ans:0},
  {q:"First female speaker of NA?", opts:["Benazir Bhutto", "Fehmida Mirza", "Hina Rabbani", "Sherry Rehman"], ans:1},
  {q:"Pakistan's 2019 operation against India?", opts:["Zarb-e-Azb", "Swift Retort", "Rad-ul-Fasaad", "Marg Bar Hind"], ans:1},
  {q:"Largest salt mine in Pakistan?", opts:["Warcha", "Mianwali", "Khewra", "Sakesar"], ans:2},
  
  {q:"First month of Islamic calendar:", opts:["Safar", "Muharram", "Ramzan", "Shaban"], ans:1},
  {q:"Prophet who controlled Jinns:", opts:["Ibrahim A.S", "Musa A.S", "Sulaiman A.S", "Yusuf A.S"], ans:2},
  {q:"Who was called 'Saifullah'?", opts:["Khalid bin Waleed", "Abu Ubaidah", "Ali R.A", "Umar R.A"], ans:0},
  {q:"How many Ayat in Surah Baqarah?", opts:["286", "285", "280", "289"], ans:0},
  {q:"Surah without Bismillah:", opts:["Taubah", "Yaseen", "Mulk", "Maidah"], ans:0},
  
  {q:"Which is not a web browser?", opts:["Chrome", "Firefox", "Linux", "Edge"], ans:2},
  {q:"Shortcut for 'Select All' in Windows?", opts:["Ctrl + S", "Ctrl + C", "Ctrl + A", "Ctrl + X"], ans:2},
  {q:"Fastest memory type?", opts:["RAM", "Cache", "Hard Drive", "ROM"], ans:1},
  {q:"IP stands for:", opts:["Internal Protocol", "Internet Protocol", "Interface Program", "Integrated Packet"], ans:1},
  {q:"Binary system base is:", opts:["8", "10", "2", "16"], ans:2} ],
    'Quiz 4': [
  {q:"Choose the correct article: He is ___ MBA graduate.", opts:["a", "an", "the", "no article"], ans:1},
  {q:"Select the correct indirect speech: He said, “I am reading.”", opts:["He said he was reading.", "He said he is reading.", "He told he read.", "He said I am reading."], ans:0},
  {q:"Idiom: 'Once in a blue moon' means:", opts:["Never", "Often", "Rarely", "Always"], ans:2},
  {q:"Spot the correct sentence:", opts:["She do not sing.", "She doesn't sings.", "She does not sing.", "She not sings."], ans:2},
  {q:"Opposite of 'Futile':", opts:["Useless", "Effective", "Failing", "Small"], ans:1},

  {q:"LCM of 16 and 20 is:", opts:["40", "60", "80", "120"], ans:0},
  {q:"Solve: 3x – 5 = 16", opts:["5", "7", "6", "9"], ans:3},
  {q:"Next in series: 1, 8, 27, 64, ?", opts:["100", "125", "144", "90"], ans:1},
  {q:"If √x = 7, then x =", opts:["14", "49", "21", "36"], ans:1},
  {q:"How many prime numbers from 1 to 20?", opts:["6", "7", "8", "9"], ans:2},

  {q:"Which gas is used in balloons?", opts:["Oxygen", "Hydrogen", "Nitrogen", "Helium"], ans:3},
  {q:"Function of red blood cells:", opts:["Fight infection", "Produce hormones", "Carry oxygen", "Form clot"], ans:2},
  {q:"What is H₂SO₄?", opts:["Hydrochloric acid", "Sulfuric acid", "Nitric acid", "Acetic acid"], ans:1},
  {q:"Which organ filters blood?", opts:["Heart", "Lungs", "Liver", "Kidneys"], ans:3},
  {q:"Speed of light in vacuum (m/s)?", opts:["3×10⁸", "3×10⁶", "3×10⁵", "3×10⁷"], ans:0},

  {q:"Country with most time zones?", opts:["Russia", "USA", "France", "India"], ans:2},
  {q:"UN Day is celebrated on:", opts:["Oct 24", "Sep 21", "Dec 10", "Aug 15"], ans:0},
  {q:"Pakistan became republic in:", opts:["1947", "1956", "1971", "1962"], ans:1},
  {q:"Biggest city by population (2024 est.):", opts:["Tokyo", "Delhi", "Shanghai", "Karachi"], ans:1},
  {q:"Currency of Bangladesh?", opts:["Taka", "Rupee", "Rial", "Peso"], ans:0},

  {q:"How many times Hajj is mentioned in Quran?", opts:["1", "2", "3", "4"], ans:2},
  {q:"Name of Prophet Muhammad's (PBUH) mother?", opts:["Khadija", "Aminah", "Fatima", "Zainab"], ans:1},
  {q:"Who was first Hafiz of Quran?", opts:["Umar R.A", "Ali R.A", "Abu Bakr R.A", "Prophet Muhammad (PBUH)"], ans:3},
  {q:"Total Surahs in Quran?", opts:["113", "114", "112", "115"], ans:1},
  {q:"Name of cave where Quran was first revealed?", opts:["Hira", "Thaur", "Uhud", "Quba"], ans:0},

  {q:"Primary function of CPU?", opts:["Printing", "Data Processing", "Display", "Storage"], ans:1},
  {q:"Full form of URL?", opts:["Uniform Read Language", "Universal Resource Locator", "Unique Reference Link", "Universal Run Link"], ans:1},
  {q:"Which one is an operating system?", opts:["Intel", "Chrome", "Ubuntu", "Photoshop"], ans:2},
  {q:"Which storage is non-volatile?", opts:["RAM", "Cache", "ROM", "Register"], ans:2},
  {q:"Shortcut for copy in Windows:", opts:["Ctrl+X", "Ctrl+V", "Ctrl+C", "Ctrl+A"], ans:2}],
    'Quiz 5': [ 
  {q:"Which sentence is correct?", opts:["He go to school daily.", "He goes to school daily.", "He going to school daily.", "He gone to school daily."], ans:1},
  {q:"Meaning of: 'Break the ice'", opts:["Destroy something", "Begin a conversation", "Break rules", "Make noise"], ans:1},
  {q:"Antonym of 'Cautious':", opts:["Careful", "Bold", "Reckless", "Alert"], ans:2},
  {q:"Fill in the blank: He has ___ unique idea.", opts:["a", "an", "the", "no article"], ans:0},
  {q:"Choose the grammatically correct sentence:", opts:["I have visited Paris last year.", "I visited Paris last year.", "I was visited Paris last year.", "I visit Paris last year."], ans:1},

  {q:"HCF of 18 and 27 is:", opts:["6", "9", "3", "12"], ans:1},
  {q:"Find x: x² = 121", opts:["9", "10", "11", "12"], ans:2},
  {q:"Angle of a triangle total:", opts:["90°", "270°", "360°", "180°"], ans:3},
  {q:"Simple Interest formula is:", opts:["P×R×T", "(P×T)/R", "(P×R×T)/100", "(P+R+T)/100"], ans:2},
  {q:"Find mean of 4, 8, 6, 2, 10", opts:["5", "6", "7", "8"], ans:1},

  {q:"Instrument to measure humidity:", opts:["Barometer", "Hygrometer", "Thermometer", "Altimeter"], ans:1},
  {q:"Human body’s largest organ:", opts:["Heart", "Skin", "Liver", "Brain"], ans:1},
  {q:"Ozone layer absorbs:", opts:["Visible light", "Gamma rays", "Infrared", "UV rays"], ans:3},
  {q:"First cloned animal was:", opts:["Molly", "Polly", "Dolly", "Billy"], ans:2},
  {q:"Chlorophyll is found in:", opts:["Mitochondria", "Cytoplasm", "Chloroplast", "Nucleus"], ans:2},

  {q:"SAARC has how many members (as of 2024)?", opts:["7", "8", "9", "6"], ans:1},
  {q:"Largest continent by area:", opts:["Africa", "Asia", "Europe", "North America"], ans:1},
  {q:"First Nobel Prize winner from Pakistan:", opts:["Malala Yousafzai", "Dr. Abdus Salam", "Liaquat Ali Khan", "Benazir Bhutto"], ans:1},
  {q:"Pakistan’s national poet:", opts:["Iqbal", "Faiz", "Ghalib", "Jalib"], ans:0},
  {q:"Country with highest population (2024):", opts:["USA", "India", "China", "Indonesia"], ans:1},

  {q:"Zakat is ___ pillar of Islam.", opts:["1st", "2nd", "3rd", "4th"], ans:2},
  {q:"First Wahi came in which cave?", opts:["Hira", "Thaur", "Uhud", "Safa"], ans:0},
  {q:"Who built Kaaba first?", opts:["Ibrahim A.S & Ismail A.S", "Adam A.S", "Musa A.S", "Quraish"], ans:0},
  {q:"How many Rakaat in Fajr (with Sunnah)?", opts:["4", "2", "6", "5"], ans:0},
  {q:"How many Makki Surahs in Quran?", opts:["86", "28", "36", "100"], ans:0},

  {q:"Google was founded in which year?", opts:["1996", "1997", "1998", "1999"], ans:2},
  {q:"Shortcut to refresh page in Windows?", opts:["Ctrl + R", "Alt + R", "Shift + R", "Ctrl + F"], ans:0},
  {q:"Software is:", opts:["Tangible", "Non-tangible", "Hardware", "Wire"], ans:1},
  {q:"Excel file extension:", opts:[".doc", ".xls", ".jpg", ".exe"], ans:1},
  {q:"HTML stands for:", opts:["Hyper Tool Markup Language", "HyperText Markup Language", "HighText Markup Language", "Hyper Transfer Mark Language"], ans:1} ]
  };

  const subjectMCQs = {
    'Science': {
  'Science 1': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Science 2': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Science 3': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Science 4': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Science 5': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] 
},
      'Mathematics': {
  'Mathematics 1': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Mathematics 2': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Mathematics 3': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Mathematics 4': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Mathematics 5': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] 
},
       'English': {
  'English 1': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'English 2': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'English 3': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'English 4': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'English 5': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] 
},
       'Geberal knowlegde & Current affairs': {
  'Geberal knowlegde & Current affairs 1': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Geberal knowlegde & Current affairs 2': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Geberal knowlegde & Current affairs 3': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Geberal knowlegde & Current affairs 4': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] ,
  'Geberal knowlegde & Current affairs 5': [ { q:'What is H2O?', opts:['Water','Oxygen','Hydrogen','Salt'], ans:0 } ] 
}}; 

  const notesData = {
  "Class 3": {
    English: [
  "1. A noun is the name of a person, place, thing, or idea.",
  "2. Proper nouns always begin with capital letters.",
  "3. Common nouns refer to general items, not specific names.",
  "4. Abstract nouns name things we cannot touch (like honesty).",
  "5. Collective nouns refer to groups (e.g., a flock of birds).",
  "6. Countable nouns can be counted; uncountable nouns cannot.",
  "7. Singular nouns refer to one; plural nouns refer to more than one.",
  "8. Plurals of most nouns are formed by adding -s.",
  "9. Nouns ending in -s, -x, -ch, or -sh take -es in the plural form.",
  "10. Some nouns form plurals by changing vowels (e.g., foot → feet).",
  "11. Pronouns replace nouns to avoid repetition.",
  "12. Subject pronouns include I, you, he, she, it, we, they.",
  "13. Object pronouns include me, you, him, her, it, us, them.",
  "14. Possessive pronouns show ownership: mine, yours, his, hers.",
  "15. Reflexive pronouns refer back to the subject (e.g., myself).",
  "16. Verbs express actions or states of being.",
  "17. A verb changes its form according to tense and subject.",
  "18. Present simple tense shows habits or general truths.",
  "19. Past simple tense shows completed actions.",
  "20. Future tense describes actions that will happen later.",
  "21. The verb 'to be' changes to am, is, are in present tense.",
  "22. The verb 'to be' becomes was and were in past tense.",
  "23. Helping verbs include is, are, was, were, has, have, had.",
  "24. Action verbs show what someone is doing (e.g., run, jump).",
  "25. Adjectives describe nouns and pronouns.",
  "26. Adjectives of quantity describe 'how much' (e.g., some, many).",
  "27. Adjectives of quality describe 'what kind' (e.g., tall, kind).",
  "28. Adjectives of number describe 'how many' (e.g., two, few).",
  "29. Comparative adjectives compare two things (e.g., taller).",
  "30. Superlative adjectives compare three or more (e.g., tallest).",
  "31. Adverbs describe verbs, adjectives, or other adverbs.",
  "32. Adverbs tell how, when, where, and to what extent.",
  "33. Most adverbs of manner end in -ly (e.g., quickly).",
  "34. Some adverbs show time (e.g., now, soon, yesterday).",
  "35. Prepositions show the relationship between nouns and other words.",
  "36. Prepositions often tell location (e.g., under the table).",
  "37. Prepositions can also show time (e.g., before lunch).",
  "38. A conjunction connects words or groups of words.",
  "39. Coordinating conjunctions include and, but, or, so.",
  "40. Interjections express sudden emotions (e.g., Wow!, Oh no!).",
  "41. A sentence always begins with a capital letter and ends with punctuation.",
  "42. Declarative sentences give information and end with a full stop.",
  "43. Interrogative sentences ask questions and end with a question mark.",
  "44. Imperative sentences give commands and may end with a full stop or exclamation mark.",
  "45. Exclamatory sentences express strong feelings and end with an exclamation mark.",
  "46. Subject-verb agreement means the subject and verb must match in number.",
  "47. He/She/It takes a singular verb (e.g., runs), while I/You/We/They take plural.",
  "48. Articles a, an, and the are used before nouns.",
  "49. Use 'a' before consonant sounds and 'an' before vowel sounds.",
  "50. Use 'the' for specific or previously mentioned nouns.",
  "51. Punctuation marks include full stop, comma, question mark, and exclamation mark.",
  "52. Apostrophes show possession or contraction.",
  "53. Commas separate items in a list or clauses in a sentence.",
  "54. Quotation marks are used for direct speech.",
  "55. Capital letters are used for names, beginnings, and proper nouns.",
  "56. A simple sentence has one subject and one verb.",
  "57. A compound sentence joins two simple sentences with a conjunction.",
  "58. A phrase is a group of words without a subject and verb.",
  "59. A clause has a subject and a verb.",
  "60. Independent clauses can stand alone as sentences.",
  "61. Dependent clauses cannot stand alone and need another clause.",
  "62. The tense of a verb shows the time of the action.",
  "63. Regular verbs form past tense by adding -ed.",
  "64. Irregular verbs change completely in past tense (e.g., go → went).",
  "65. Subject is the doer of the action in a sentence.",
  "66. Predicate tells what the subject does or is.",
  "67. Homophones sound the same but have different meanings (e.g., to, too, two).",
  "68. Synonyms are words with similar meanings.",
  "69. Antonyms are words with opposite meanings.",
  "70. Affirmative sentences state something positive.",
  "71. Negative sentences state something not true (e.g., She does not like tea).",
  "72. Yes/No questions begin with helping verbs.",
  "73. WH questions begin with what, where, who, when, why, or how.",
  "74. Direct speech repeats someone's exact words with quotation marks.",
  "75. Indirect speech reports what someone said without quotes.",
  "76. Possessive nouns show ownership with an apostrophe and -s.",
  "77. Demonstrative pronouns point to things (e.g., this, that, these, those).",
  "78. Modal verbs express ability, permission, or possibility (e.g., can, may, must).",
  "79. The verb 'have' is used as an auxiliary and a main verb.",
  "80. Past participles are used in perfect tenses (e.g., eaten, gone).",
  "81. The present continuous tense uses is/am/are + verb + ing.",
  "82. The past continuous tense uses was/were + verb + ing.",
  "83. The future continuous tense uses will be + verb + ing.",
  "84. Some adjectives do not change for comparative/superlative (e.g., fun).",
  "85. Some verbs require objects (transitive); others do not (intransitive).",
  "86. The passive voice focuses on the object receiving the action.",
  "87. The active voice focuses on the subject performing the action.",
  "88. Some verbs are followed by infinitives (e.g., want to go).",
  "89. Some verbs are followed by gerunds (e.g., enjoy eating).",
  "90. Pronouns must agree in number and gender with their nouns.",
  "91. Reported questions change word order and remove the question mark.",
  "92. A syllable is a unit of sound in a word.",
  "93. Stress means saying part of a word louder or more clearly.",
  "94. A prefix is added to the beginning of a word to change meaning.",
  "95. A suffix is added to the end of a word to change meaning.",
  "96. Contractions are shortened forms of words using apostrophes (e.g., can't).",
  "97. Every sentence needs a subject and a predicate.",
  "98. Formal language is used in writing and serious conversations.",
  "99. Informal language is used with friends and in casual situations.",
  "100. Editing involves checking grammar, punctuation, and spelling.",],
    Math: [
  "1. A digit is any single number from 0 to 9 used to form numbers.",
  "2. Place value tells the value of a digit based on its position in a number.",
  "3. The value of 3 in 3,000 is three thousand (place value concept).",
  "4. Expanded form breaks a number into the value of each digit (e.g., 456 = 400 + 50 + 6).",
  "5. Even numbers end in 0, 2, 4, 6, or 8 and are divisible by 2.",
  "6. Odd numbers end in 1, 3, 5, 7, or 9 and are not divisible by 2.",
  "7. A number that divides evenly into another number is called a factor.",
  "8. A multiple of a number is the result of multiplying that number by another whole number.",
  "9. The smallest two-digit number is 10; the largest is 99.",
  "10. The smallest three-digit number is 100; the largest is 999.",
  "11. Addition combines two or more numbers to get a total or sum.",
  "12. Subtraction finds the difference between two numbers.",
  "13. Multiplication is repeated addition of the same number.",
  "14. Division splits a number into equal parts or groups.",
  "15. The symbol '+' represents addition.",
  "16. The symbol '−' represents subtraction.",
  "17. The symbol '×' represents multiplication.",
  "18. The symbol '÷' represents division.",
  "19. Zero added to any number gives the same number.",
  "20. Any number multiplied by zero equals zero.",
  "21. Any number divided by 1 is the number itself.",
  "22. Any number divided by itself is 1 (except zero).",
  "23. The order of addition does not change the sum (commutative property).",
  "24. Multiplication is commutative: 3 × 4 = 4 × 3.",
  "25. Subtraction is not commutative: 9 − 6 ≠ 6 − 9.",
  "26. Division is not commutative: 10 ÷ 2 ≠ 2 ÷ 10.",
  "27. A number line helps in visualizing addition and subtraction.",
  "28. Ordinal numbers show position (e.g., first, second, third).",
  "29. The greater than symbol is '>', less than is '<', and equal to is '='.",
  "30. A triangle has 3 sides and 3 angles.",
  "31. A square has 4 equal sides and 4 right angles.",
  "32. A rectangle has opposite sides equal and 4 right angles.",
  "33. A circle has no sides or corners, only one curved boundary.",
  "34. Perimeter is the total length around a shape.",
  "35. Area is the space inside a 2D shape, measured in square units.",
  "36. Volume is the amount of space a 3D object occupies.",
  "37. Fractions show parts of a whole (e.g., 1/2, 1/4).",
  "38. The top number of a fraction is the numerator.",
  "39. The bottom number of a fraction is the denominator.",
  "40. A half means one part out of two equal parts.",
  "41. A quarter means one part out of four equal parts.",
  "42. A proper fraction has numerator less than denominator.",
  "43. An improper fraction has numerator greater than or equal to denominator.",
  "44. A mixed number is a whole number and a fraction combined.",
  "45. Time is measured in seconds, minutes, and hours.",
  "46. 1 hour = 60 minutes; 1 minute = 60 seconds.",
  "47. There are 7 days in a week and 12 months in a year.",
  "48. There are 365 days in a regular year and 366 in a leap year.",
  "49. Calendar shows days, dates, months, and years.",
  "50. Money is measured in rupees and paisas in Pakistan.",
  "51. 100 paisas = 1 rupee.",
  "52. Addition and subtraction are used to solve money problems.",
  "53. Weight is measured in grams and kilograms.",
  "54. 1 kilogram = 1000 grams.",
  "55. Length is measured in millimeters, centimeters, and meters.",
  "56. 1 meter = 100 centimeters.",
  "57. Capacity is measured in milliliters and liters.",
  "58. 1 liter = 1000 milliliters.",
  "59. Tables help in fast multiplication and division.",
  "60. The table of 2 is 2, 4, 6, 8, 10, 12, 14, 16, 18, 20.",
  "61. The table of 3 is 3, 6, 9, 12, 15, 18, 21, 24, 27, 30.",
  "62. Estimation helps in making rough calculations.",
  "63. Rounding a number means replacing it with a nearby value.",
  "64. To round to the nearest 10, look at the units digit.",
  "65. Word problems test understanding of operations in real life.",
  "66. To solve word problems, read carefully and identify key numbers.",
  "67. Data can be shown using tally marks or pictographs.",
  "68. Graphs help to understand information quickly.",
  "69. Bar graphs show data using rectangles of equal width.",
  "70. A cube has 6 equal square faces.",
  "71. A cuboid has 6 rectangular faces.",
  "72. A cone has 1 circular face and a pointed tip (vertex).",
  "73. A cylinder has 2 circular faces and 1 curved surface.",
  "74. A sphere has 1 curved surface and no flat face.",
  "75. Lines can be straight, curved, horizontal, or vertical.",
  "76. A point marks an exact location on a surface.",
  "77. Parallel lines never meet even if extended.",
  "78. An angle is formed when two lines meet at a point.",
  "79. A right angle measures 90 degrees.",
  "80. An acute angle is less than 90 degrees.",
  "81. An obtuse angle is more than 90 but less than 180 degrees.",
  "82. Measuring angles needs a protractor.",
  "83. A ruler is used to measure length.",
  "84. Standard units are fixed and agreed upon (e.g., meter, liter).",
  "85. Non-standard units vary (e.g., hand spans, pencils).",
  "86. A pattern is a repeated arrangement of shapes or numbers.",
  "87. Skip counting means counting forward or backward by a number other than 1.",
  "88. Place value helps in comparing large numbers.",
  "89. In 4-digit numbers, thousands place is the fourth digit from right.",
  "90. Mathematical operations include +, −, ×, ÷.",
  "91. To check subtraction, add the difference to the smaller number.",
  "92. To check multiplication, divide the product by one of the numbers.",
  "93. Mental math uses tricks and estimation for fast calculation.",
  "94. The number before is the predecessor; the one after is successor.",
  "95. Odd + odd = even; even + even = even; odd + even = odd.",
  "96. Roman numerals use letters to show numbers (e.g., I = 1, V = 5).",
  "97. I, V, X are the basic Roman numerals taught in Class 3.",
  "98. Zero has no value but holds place in large numbers.",
  "99. Mathematics helps in shopping, budgeting, planning, and measurements.",
  "100. Logical reasoning is key to solving advanced math problems.",
  "101. Solving math puzzles builds analytical skills.",
  "102. Math symbols must be used correctly to avoid errors.",
  "103. Clear steps must be written in math to show full working."],
    Science: [  "1. Photosynthesis occurs in the chlorophyll of green leaves using sunlight, water, and carbon dioxide.",
  "2. Taproots like carrots grow deep into the soil while fibrous roots like grass spread outward.",
  "3. Stems transport water from roots to leaves via xylem tissues.",
  "4. Leaves have stomata to exchange gases for respiration and photosynthesis.",
  "5. A seed needs water, warmth, and air to germinate into a seedling.",
  "6. The cotyledons of a seed store food for the growing embryo.",
  "7. Plants are classified into herbs, shrubs, trees, climbers, and creepers.",
  "8. Flowers are reproductive organs that develop into fruits and seeds.",
  "9. Fruits form after fertilization of ovules in the flower’s ovary.",
  "10. Insects help in pollination by transferring pollen between flowers.",
  "11. Mammals feed their young with milk and have hair or fur on their bodies.",
  "12. Birds have hollow bones to reduce weight and assist in flight.",
  "13. Amphibians like frogs live both on land and in water.",
  "14. Reptiles like lizards have dry scaly skin and lay eggs on land.",
  "15. Fish breathe using gills and swim with fins.",
  "16. Insects have three body parts: head, thorax, and abdomen.",
  "17. The human skeletal system gives shape and support to the body.",
  "18. Joints like knees and elbows help in movement by connecting bones.",
  "19. Muscles contract and relax to move bones and body parts.",
  "20. The brain has three parts: cerebrum, cerebellum, and medulla oblongata.",
  "21. The cerebrum controls thinking, memory, and voluntary movements.",
  "22. The cerebellum controls balance and coordination.",
  "23. The medulla controls involuntary actions like heartbeat and breathing.",
  "24. The heart pumps blood through arteries and veins across the body.",
  "25. Blood contains red cells, white cells, platelets, and plasma.",
  "26. Red blood cells carry oxygen using hemoglobin.",
  "27. White blood cells fight against infections and diseases.",
  "28. Platelets help in clotting of blood to stop bleeding.",
  "29. The respiratory system includes nose, windpipe, and lungs.",
  "30. The diaphragm helps lungs in inhalation and exhalation.",
  "31. Oxygen passes from alveoli into blood during respiration.",
  "32. The digestive system breaks food into nutrients for energy.",
  "33. The small intestine absorbs nutrients into the bloodstream.",
  "34. The liver produces bile that helps digest fats.",
  "35. The kidneys filter waste from blood to form urine.",
  "36. The urinary system includes kidneys, ureters, bladder, and urethra.",
  "37. Sense organs detect external stimuli and send signals to the brain.",
  "38. The tongue can taste sweet, salty, sour, and bitter.",
  "39. The nose contains smell receptors and helps in breathing.",
  "40. The eyes have a lens that focuses light on the retina.",
  "41. The skin is the largest sense organ and regulates body temperature.",
  "42. Clean water is essential to prevent diseases like diarrhea and typhoid.",
  "43. Boiling, filtering, and using chlorine are methods to purify water.",
  "44. Unclean food and water can transmit harmful bacteria and viruses.",
  "45. A balanced diet includes carbohydrates, proteins, fats, vitamins, and minerals.",
  "46. Carbohydrates give energy while proteins build body tissues.",
  "47. Fats provide energy and help absorb vitamins A, D, E, and K.",
  "48. Iron helps in blood formation; calcium strengthens bones and teeth.",
  "49. Vitamin C protects against scurvy and strengthens the immune system.",
  "50. Overeating or skipping meals can lead to health problems.",
  "51. Germs are spread through air, water, hands, and dirty surfaces.",
  "52. Washing hands with soap reduces germ transmission.",
  "53. Vaccination protects us from many infectious diseases.",
  "54. Clean surroundings prevent breeding of mosquitoes and flies.",
  "55. First aid is the immediate help given to an injured person before the doctor arrives.",
  "56. A thermometer is used to measure body temperature.",
  "57. The sun is a star and the main source of light and heat for Earth.",
  "58. The Earth rotates on its axis to cause day and night.",
  "59. The Earth revolves around the Sun to complete a year.",
  "60. The Moon reflects sunlight and completes one orbit in about 29 days.",
  "61. Stars produce their own light and are huge balls of gases.",
  "62. The solar system includes 8 planets orbiting the Sun.",
  "63. Mercury is the smallest planet and closest to the Sun.",
  "64. Jupiter is the largest planet in the solar system.",
  "65. Air is made up of nitrogen (78%) and oxygen (21%).",
  "66. Oxygen is essential for respiration in humans and animals.",
  "67. Carbon dioxide is used by plants during photosynthesis.",
  "68. Water vapor, dust, and pollutants are also part of air.",
  "69. Moving air is called wind; gentle wind is breeze, strong is storm.",
  "70. Rain occurs when clouds become heavy with water vapor.",
  "71. The water cycle includes evaporation, condensation, and precipitation.",
  "72. Evaporation is the process of water changing into vapor.",
  "73. Condensation forms clouds when vapor cools and changes to liquid.",
  "74. Precipitation means rainfall, hail, or snow.",
  "75. Water can exist in three states: solid (ice), liquid (water), gas (steam).",
  "76. Metals like iron, copper, and aluminum conduct electricity.",
  "77. Wood and plastic are insulators and do not conduct electricity.",
  "78. Magnet attracts materials like iron and steel.",
  "79. Magnetic poles are called north and south; like poles repel each other.",
  "80. Friction is a force that slows or stops motion.",
  "81. Lubricants like oil reduce friction between moving parts.",
  "82. Simple machines make work easier using force, like levers and pulleys.",
  "83. A lever has a fulcrum, load, and effort arm.",
  "84. Pulley helps to lift heavy objects using ropes and wheels.",
  "85. Ramp is an inclined plane that helps move objects upward.",
  "86. Light travels in straight lines and reflects off smooth surfaces.",
  "87. Shadows form when an object blocks light.",
  "88. Transparent objects let all light pass, translucent let some, opaque let none.",
  "89. Sound is produced by vibrating objects and travels in waves.",
  "90. Loudness depends on vibration strength; pitch depends on speed.",
  "91. Plants are classified as flowering and non-flowering.",
  "92. Animals are grouped as domestic, wild, aquatic, and aerial.",
  "93. Environment includes living (biotic) and non-living (abiotic) things.",
  "94. Pollution harms the environment and affects health.",
  "95. Reducing, reusing, and recycling help protect natural resources.",
  "96. Natural disasters include floods, earthquakes, and storms.",
  "97. Safety rules prevent accidents at home, school, and roads.",
  "98. Wearing seat belts and helmets saves lives.",
  "99. Electricity should be used carefully to avoid shocks.",
  "100. Science helps us understand nature, solve problems, and improve life."],
    Islamiat: [
  "1. The Holy Quran is the last divine book revealed to Prophet Muhammad ﷺ.",
  "2. There are 114 Surahs and 30 Paras in the Holy Quran.",
  "3. Surah Al-Fatiha is called the opening chapter of the Quran.",
  "4. The Holy Quran was revealed over 23 years.",
  "5. The first revelation was Iqra from Surah Al-Alaq.",
  "6. Prophet Muhammad ﷺ received revelation through Angel Jibreel.",
  "7. The Quran was revealed in Arabic language.",
  "8. Hadith is the saying, action, and approval of Prophet Muhammad ﷺ.",
  "9. The Hadith explains and details the commands in the Quran.",
  "10. There are five pillars of Islam: Shahadah, Salah, Zakah, Sawm, and Hajj.",
  "11. Shahadah means testifying that there is no god but Allah.",
  "12. Salah is offered five times a day at prescribed times.",
  "13. Fajr prayer has two rakats of Farz.",
  "14. Zakah purifies wealth and is obligatory for the rich.",
  "15. Sawm (fasting) is observed in the month of Ramadan.",
  "16. Hajj is performed once in a lifetime if one can afford it.",
  "17. Prophet Muhammad ﷺ was born in Makkah in 570 A.D.",
  "18. He belonged to the Quraish tribe and the Banu Hashim family.",
  "19. His father’s name was Abdullah and mother’s name was Amina.",
  "20. His grandfather was Abdul Muttalib and uncle was Abu Talib.",
  "21. Prophet Muhammad ﷺ was known as Al-Ameen and As-Sadiq.",
  "22. At the age of 40, he received the first revelation.",
  "23. He migrated from Makkah to Madinah in 622 A.D., called Hijrah.",
  "24. The Islamic calendar starts from the year of Hijrah.",
  "25. The first mosque built by the Prophet ﷺ was Masjid-e-Quba.",
  "26. The Holy Prophet ﷺ passed away at the age of 63.",
  "27. Islam teaches belief in One Allah, who has no partner.",
  "28. Tawheed means the Oneness of Allah.",
  "29. Shirk is the sin of associating partners with Allah.",
  "30. Allah is the Creator, Sustainer, and Owner of everything.",
  "31. There are 99 beautiful names (Asma-ul-Husna) of Allah.",
  "32. Ar-Rahman means The Most Merciful.",
  "33. Ar-Razzaq means The Provider.",
  "34. Muslims must believe in all the prophets sent by Allah.",
  "35. There are 25 prophets mentioned in the Quran by name.",
  "36. Prophet Adam (AS) was the first prophet and first man.",
  "37. Prophet Ibrahim (AS) is known as the Friend of Allah (Khalilullah).",
  "38. Prophet Musa (AS) was given the Torah.",
  "39. Prophet Isa (AS) was given the Injil (Bible).",
  "40. Prophet Dawood (AS) was given the Zabur.",
  "41. Prophet Muhammad ﷺ is the last and final messenger.",
  "42. Muslims believe in all the holy books revealed by Allah.",
  "43. The angels are created from light and do not eat or sleep.",
  "44. Jibreel is the chief angel who brought revelation.",
  "45. Mikail controls rain and food supply.",
  "46. Israfeel will blow the trumpet on the Day of Judgement.",
  "47. Malik is the guardian of Hell.",
  "48. Munkar and Nakir question the dead in the grave.",
  "49. The Day of Judgement is called Yawm al-Qiyamah.",
  "50. On that day, all deeds will be judged by Allah.",
  "51. Good deeds will lead to Jannah (Paradise), bad ones to Jahannam (Hell).",
  "52. Jannah is the eternal home for the righteous believers.",
  "53. Jahannam is the punishment for disbelievers and wrongdoers.",
  "54. Belief in Qadr means belief in Allah’s knowledge and plan.",
  "55. Everything happens by Allah’s will, whether good or bad.",
  "56. Islam teaches kindness, honesty, and helping others.",
  "57. Respecting parents is one of the most important teachings of Islam.",
  "58. Backbiting, lying, and cheating are major sins in Islam.",
  "59. Muslims must speak the truth and fulfill promises.",
  "60. Cleanliness is half of faith (Hadith).",
  "61. Wudu is washing certain body parts before Salah.",
  "62. Wudu includes washing face, hands, wiping head, and washing feet.",
  "63. Tayammum is dry ablution when water is not available.",
  "64. Ghusl is a full-body wash required after certain acts.",
  "65. Salah cannot be valid without proper cleanliness (Taharah).",
  "66. Muslims greet each other with 'Assalamu Alaikum'.",
  "67. The reply to the Islamic greeting is 'Wa Alaikum Assalam'.",
  "68. Dua is a way to ask Allah for help and guidance.",
  "69. The Qiblah is the direction of the Kaaba in Makkah.",
  "70. The Kaaba was rebuilt by Prophet Ibrahim (AS) and Ismail (AS).",
  "71. The black stone in the Kaaba is called Hajr-e-Aswad.",
  "72. Ramadan is the 9th month of the Islamic calendar.",
  "73. Laylat-ul-Qadr is the night better than a thousand months.",
  "74. Zakat-ul-Fitr is given before Eid-ul-Fitr prayer.",
  "75. Eid-ul-Adha is celebrated on the 10th of Dhul-Hijjah.",
  "76. Animals are sacrificed to remember Prophet Ibrahim's obedience.",
  "77. Islam teaches respect for all religions and humanity.",
  "78. Mosque is the place where Muslims worship together.",
  "79. Friday prayer (Jumu’ah) is a weekly congregational prayer.",
  "80. The Imam leads the prayer in congregation.",
  "81. Children must learn to recite Quran and basic Islamic beliefs.",
  "82. Lying breaks trust and displeases Allah.",
  "83. Stealing and cheating are strictly forbidden in Islam.",
  "84. Islam encourages forgiveness and patience in all matters.",
  "85. Allah loves those who do good to others.",
  "86. Muslims should visit the sick and help the poor.",
  "87. Jealousy and pride are sins of the heart.",
  "88. Every action is judged based on intention (Hadith).",
  "89. The tongue should be used to speak good or stay silent.",
  "90. Prayer (Salah) strengthens the connection with Allah.",
  "91. Knowledge is an obligation for every Muslim man and woman.",
  "92. Islamic manners include saying Bismillah before eating.",
  "93. Alhamdulillah is said to thank Allah after eating.",
  "94. The right hand should be used for eating and drinking.",
  "95. Sunnah means the way and teachings of the Prophet ﷺ.",
  "96. Following Sunnah brings us closer to Allah.",
  "97. The Prophet ﷺ treated everyone with kindness and justice.",
  "98. Sadaqah is voluntary charity for the sake of Allah.",
  "99. Islam teaches that helping others is an act of worship.",
  "100. The life of Prophet Muhammad ﷺ is a complete role model."]
  },
  "Class 4": {
    English: [],
    Math: [],
    Science: [],
    SocialStudies: [],
    Islamiat: [],
    Computer: []
  },
  "Class 5": {
    English: [],
    Math: [],
    Science: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 6": {
    English: [],
    Math: [],
    Science: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 7": {
    English: [],
    Math: [],
    Science: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 8": {
    English: [],
    Math: [],
    Science: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 9": {
    English: [],
    Math: [],
    Physics: [],
    Chemistry: [],
    Zoology: [],
    Botany: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 10": {
    English: [],
    Math: [],
    Physics: [],
    Chemistry: [],
    Zoology: [],
    Botany: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 11": {
    English: [],
    Math: [],
    Physics: [],
    Chemistry: [],
    Zoology: [],
    Botany: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  },
  "Class 12": {
    English: [],
    Math: [],
    Physics: [],
    Chemistry: [],
    Zoology: [],
    Botany: [],
    "Social + Pakistan Studies": [],
    Islamiat: [],
    Computer: []
  }
};


  function sendToSheet(quiz,score){
    fetch('https://script.google.com/macros/s/AKfycbzPbQucOBWqb4McQFZYiZ3j0dQK_DD2ziBdONrpwUjRtqBZ0_a0gNaBFdZX9A1NxOYb/exec',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:user.name, phone:user.phone, quiz, score})
    });
  }

  function saveView(){ dashboard.dataset.prev = dashboard.innerHTML; }
  function restoreView(){ dashboard.innerHTML = dashboard.dataset.prev; attachHandlers(); }

  function renderQuestion() {
    dashboard.innerHTML = '';
    const back = document.createElement('button');
    back.textContent = '⬅ Back';
    back.className = 'btn';
    back.onclick = restoreView;
    dashboard.append(back);

    const q = currentQuiz[quizIndex];
    const pQ = document.createElement('p');
    pQ.textContent = q.q;
    dashboard.append(pQ);

    const optsDiv = document.createElement('div');
    optsDiv.className = 'quiz-buttons';
    q.opts.forEach((o, i) => {
      const b = document.createElement('button');
      b.textContent = o;
      b.className = 'btn secondary';
      b.disabled = reviewMode;
      b.onclick = () => selectOption(b, i);
      optsDiv.append(b);
    });
    dashboard.append(optsDiv);

    const prev = document.createElement('button');
    prev.textContent = 'Previous';
    prev.className = 'btn secondary';
    prev.disabled = quizIndex === 0;
    prev.onclick = () => { quizIndex--; renderQuestion(); };
    dashboard.append(prev);
  }

  function selectOption(btn, idx) {
    const correct = currentQuiz[quizIndex].ans;
    dashboard.querySelectorAll('.quiz-buttons .btn').forEach(b => b.disabled = true);
    btn.style.backgroundColor = (idx === correct ? 'green' : 'red');
    userAnswers[quizIndex] = idx;
    setTimeout(() => {
      if (quizIndex < currentQuiz.length - 1) {
        quizIndex++;
        renderQuestion();
      } else {
        showReview();
      }
    }, 500);
  }

  function showReview() {
    dashboard.innerHTML = '';
    const back = document.createElement('button');
    back.textContent = '⬅ Back';
    back.className = 'btn';
    back.onclick = restoreView;
    dashboard.append(back);

    const ta = document.createElement('textarea');
    ta.rows = 4; ta.cols = 50;
    dashboard.append(ta);

    const subB = document.createElement('button');
    subB.textContent = 'Submit';
    subB.className = 'btn primary';
    subB.onclick = showResult;
    dashboard.append(subB);
  }

  function showResult() {
    const score = userAnswers.reduce((a, v, i) => v === currentQuiz[i].ans ? a + 1 : a, 0);
    sendToSheet(currentQuiz.title, score);
    dashboard.innerHTML = `<h2>Your Score: ${score}/${currentQuiz.length}</h2>`;
    const sb = document.createElement('button');
    sb.textContent = 'View Summary';
    sb.className = 'btn';
    sb.onclick = showSummary;
    dashboard.append(sb);
  }

  function showSummary() {
    dashboard.innerHTML = '';
    currentQuiz.forEach((q, i) => {
      const d = document.createElement('div');
      const pq = document.createElement('p');
      pq.textContent = `${i + 1}. ${q.q}`;
      d.append(pq);
      q.opts.forEach((o, j) => {
        const sp = document.createElement('span');
        sp.textContent = o;
        sp.style.display = 'block';
        sp.style.color = j === q.ans ? 'green' : (userAnswers[i] === j ? 'red' : '#ccc');
        d.append(sp);
      });
      dashboard.append(d);
    });
    const back = document.createElement('button');
    back.textContent = '⬅ Back';
    back.className = 'btn';
    back.onclick = showResult;
    dashboard.append(back);
  }

  function startQuiz(title, questions) {
    currentQuiz = questions;
    currentQuiz.title = title;
    quizIndex = 0;
    userAnswers = new Array(questions.length).fill(null);
    reviewMode = false;
    saveView();
    renderQuestion();
  }

  function renderNotes() {
    notesDisplay.innerHTML = '';
    const start = notesPage * NOTES_PER_PAGE;
    currentNotes.slice(start, start + NOTES_PER_PAGE).forEach(n => {
      const p = document.createElement('p');
      p.textContent = n;
      notesDisplay.append(p);
    });
    notesPrev.classList.toggle('hidden', notesPage === 0);
    notesNext.classList.toggle('hidden', start + NOTES_PER_PAGE >= currentNotes.length);
  }

  function attachHandlers() {
    document.querySelectorAll('#quickquiz .quiz-btn').forEach(b =>
      b.onclick = () => startQuiz(b.dataset.quiz, quickQuizMCQs[b.dataset.quiz])
    );

    document.querySelectorAll('#subjects .quiz-btn').forEach(b => {
      b.onclick = () => {
        saveView();
        dashboard.innerHTML = '';
        const back = document.createElement('button');
        back.textContent = '⬅ Back';
        back.className = 'btn';
        back.onclick = restoreView;
        dashboard.append(back);

        const cont = document.createElement('div');
        for (const key in subjectMCQs[b.dataset.quiz]) {
          const fb = document.createElement('button');
          fb.className = 'btn secondary';
          fb.textContent = key;
          fb.onclick = () => startQuiz(key, subjectMCQs[b.dataset.quiz][key]);
          cont.append(fb);
        }
        dashboard.append(cont);
      };
    });

    notesPrev.onclick = () => { notesPage--; renderNotes(); };
    notesNext.onclick = () => { notesPage++; renderNotes(); };

    document.getElementById('class-select').onchange = () => {
      document.getElementById('subject-select').value = '';
      notesDisplay.innerHTML = '';
      notesPrev.classList.add('hidden');
      notesNext.classList.add('hidden');
    };

    document.getElementById('subject-select').onchange = () => {
      const cls = document.getElementById('class-select').value;
      const sub = document.getElementById('subject-select').value;
      if (cls && sub) {
        currentNotes = notesData[cls][sub];
        notesPage = 0;
        renderNotes();
      }
    };

    acceptComp.onclick = () => compPlaceholder.classList.remove('hidden');
    rejectComp.onclick = () => compPlaceholder.classList.add('hidden');
  }

  attachHandlers();
});
