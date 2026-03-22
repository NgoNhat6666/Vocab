import { QuizQuestion } from '../types';

export interface GrammarLesson {
  id: string;
  title: string;
  theory: string;
  questions: QuizQuestion[];
}

export const GRAMMAR_LESSONS: Record<string, GrammarLesson> = {
  'g-0': {
    id: 'g-0',
    title: 'To be & Đại từ',
    theory: '### 1. Đại từ nhân xưng\nDùng để xưng hô, thay thế cho danh từ chỉ người hoặc vật.\n- Số ít: **I** (tôi), **You** (bạn), **He** (anh ấy), **She** (cô ấy), **It** (nó)\n- Số nhiều: **We** (chúng tôi), **You** (các bạn), **They** (họ)\n\n### 2. Động từ To be\nDùng để giới thiệu, mô tả trạng thái, tính chất.\n- **I** đi với **am**\n- **He/She/It** đi với **is**\n- **You/We/They** đi với **are**\n\n*Ví dụ:* I am a student. She is beautiful. They are happy.',
    questions: [
      {
        id: 'g0-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"I _______ a student and my brother _______ a teacher."',
        options: ['am / is', 'is / am', 'are / is', 'am / are'],
        correctAnswer: 'am / is',
        explanation: '"I" đi với "am", "my brother" (ngôi thứ 3 số ít) đi với "is".',
        wordId: 'g-0'
      },
      {
        id: 'g0-q2',
        type: 'sentence_building',
        question: 'Sắp xếp thành câu hoàn chỉnh:',
        options: [],
        correctAnswer: 'They are very happy today',
        explanation: 'Chủ ngữ "They" đi với to be "are".',
        wordId: 'g-0',
        scrambledWords: ['happy', 'are', 'today', 'They', 'very']
      },
      {
        id: 'g0-q3',
        type: 'definition',
        question: 'Chọn câu đúng ngữ pháp nhất:',
        options: [
          'She am a doctor.',
          'She are a doctor.',
          'She is a doctor.',
          'She be a doctor.'
        ],
        correctAnswer: 'She is a doctor.',
        explanation: 'Ngôi thứ 3 số ít "She" đi với to be "is".',
        wordId: 'g-0'
      }
    ]
  },
  'g-1': {
    id: 'g-1',
    title: 'Hiện tại đơn (Present Simple)',
    theory: '### Thì Hiện tại đơn\nDùng để diễn tả thói quen, sự thật hiển nhiên, hoặc lịch trình.\n\n**Cấu trúc với động từ thường:**\n- Khẳng định: **I/You/We/They** + V(nguyên thể) | **He/She/It** + V(s/es)\n- Phủ định: **I/You/We/They** + do not (don\'t) + V | **He/She/It** + does not (doesn\'t) + V\n- Nghi vấn: **Do/Does** + S + V?\n\n*Ví dụ:* I play tennis. He plays football. She doesn\'t like apples.',
    questions: [
      {
        id: 'g1-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"He usually _______ up early in the morning."',
        options: ['wake', 'wakes', 'waking', 'waked'],
        correctAnswer: 'wakes',
        explanation: 'Chủ ngữ "He" (ngôi thứ 3 số ít) nên động từ "wake" phải thêm "s".',
        wordId: 'g-1'
      },
      {
        id: 'g1-q2',
        type: 'sentence_building',
        question: 'Sắp xếp thành câu hoàn chỉnh:',
        options: [],
        correctAnswer: 'She always wakes up early in the morning',
        explanation: 'Trạng từ chỉ tần suất (always) đứng trước động từ thường (wakes up).',
        wordId: 'g-1',
        scrambledWords: ['She', 'early', 'wakes up', 'always', 'in the morning']
      },
      {
        id: 'g1-q3',
        type: 'definition',
        question: 'Chọn câu đúng ngữ pháp nhất:',
        options: [
          'He don\'t like playing football.',
          'He doesn\'t likes playing football.',
          'He doesn\'t like playing football.',
          'He not like playing football.'
        ],
        correctAnswer: 'He doesn\'t like playing football.',
        explanation: 'Ngôi thứ 3 số ít dùng trợ động từ "doesn\'t", động từ chính giữ nguyên mẫu "like".',
        wordId: 'g-1'
      }
    ]
  },
  'g-2': {
    id: 'g-2',
    title: 'Quá khứ đơn (Past Simple)',
    theory: '### Thì Quá khứ đơn\nDùng để diễn tả hành động đã xảy ra và kết thúc trong quá khứ.\n\n**Cấu trúc:**\n- Khẳng định: S + V(ed/bất quy tắc)\n- Phủ định: S + did not (didn\'t) + V(nguyên thể)\n- Nghi vấn: Did + S + V(nguyên thể)?\n\n**Dấu hiệu nhận biết:** yesterday, last (week, month, year), ago, in 1990...',
    questions: [
      {
        id: 'g2-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"I _______ to the cinema yesterday."',
        options: ['go', 'went', 'gone', 'going'],
        correctAnswer: 'went',
        explanation: 'Có "yesterday" nên dùng thì quá khứ đơn. Quá khứ của "go" là "went".',
        wordId: 'g-2'
      },
      {
        id: 'g2-q2',
        type: 'sentence_building',
        question: 'Sắp xếp thành câu hoàn chỉnh:',
        options: [],
        correctAnswer: 'Did you finish your homework last night',
        explanation: 'Câu hỏi quá khứ đơn bắt đầu bằng trợ động từ Did + S + V(nguyên thể).',
        wordId: 'g-2',
        scrambledWords: ['homework', 'Did', 'last night', 'finish', 'you', 'your']
      },
      {
        id: 'g2-q3',
        type: 'definition',
        question: 'Chọn câu đúng ngữ pháp nhất:',
        options: [
          'She didn\'t went to school yesterday.',
          'She didn\'t go to school yesterday.',
          'She not went to school yesterday.',
          'She didn\'t goes to school yesterday.'
        ],
        correctAnswer: 'She didn\'t go to school yesterday.',
        explanation: 'Trong câu phủ định quá khứ đơn, sau "didn\'t" động từ phải ở dạng nguyên thể "go".',
        wordId: 'g-2'
      }
    ]
  },
  'g-3': {
    id: 'g-3',
    title: 'Hiện tại tiếp diễn (Present Continuous)',
    theory: '### Thì Hiện tại tiếp diễn\nDùng để diễn tả hành động đang xảy ra tại thời điểm nói hoặc xung quanh thời điểm nói.\n\n**Cấu trúc:**\n- Khẳng định: S + am/is/are + V-ing\n- Phủ định: S + am/is/are + not + V-ing\n- Nghi vấn: Am/Is/Are + S + V-ing?\n\n**Dấu hiệu nhận biết:** now, at the moment, at present, Look!, Listen!...',
    questions: [
      {
        id: 'g3-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"Look! The bus _______."',
        options: ['come', 'comes', 'is coming', 'coming'],
        correctAnswer: 'is coming',
        explanation: 'Có "Look!" nên dùng thì hiện tại tiếp diễn.',
        wordId: 'g-3'
      },
      {
        id: 'g3-q2',
        type: 'sentence_building',
        question: 'Sắp xếp thành câu hoàn chỉnh:',
        options: [],
        correctAnswer: 'What are you doing at the moment',
        explanation: 'Câu hỏi hiện tại tiếp diễn: Am/Is/Are + S + V-ing.',
        wordId: 'g-3',
        scrambledWords: ['doing', 'at the moment', 'are', 'you', 'What']
      }
    ]
  },
  'g-4': {
    id: 'g-4',
    title: 'Hiện tại hoàn thành (Present Perfect)',
    theory: '### Thì Hiện tại hoàn thành\nDùng để diễn tả hành động xảy ra trong quá khứ và kéo dài đến hiện tại, hoặc vừa mới xảy ra.\n\n**Cấu trúc:**\n- Khẳng định: S + have/has + V3/ed\n- Phủ định: S + have/has + not + V3/ed\n- Nghi vấn: Have/Has + S + V3/ed?\n\n**Dấu hiệu nhận biết:** since, for, already, yet, ever, never, just...',
    questions: [
      {
        id: 'g4-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"I _______ this movie three times."',
        options: ['see', 'saw', 'have seen', 'has seen'],
        correctAnswer: 'have seen',
        explanation: 'Diễn tả trải nghiệm (đã xem 3 lần) dùng thì hiện tại hoàn thành.',
        wordId: 'g-4'
      },
      {
        id: 'g4-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"She _______ in this city since 2010."',
        options: ['live', 'lives', 'has lived', 'have lived'],
        correctAnswer: 'has lived',
        explanation: 'Có "since + mốc thời gian" dùng thì hiện tại hoàn thành. She đi với has.',
        wordId: 'g-4'
      }
    ]
  },
  'g-5': {
    id: 'g-5',
    title: 'Tương lai đơn (Future Simple)',
    theory: '### Thì Tương lai đơn\nDùng để diễn tả quyết định tại thời điểm nói, lời hứa, dự đoán không có căn cứ.\n\n**Cấu trúc:**\n- Khẳng định: S + will + V(nguyên thể)\n- Phủ định: S + will not (won\'t) + V(nguyên thể)\n- Nghi vấn: Will + S + V(nguyên thể)?\n\n**Dấu hiệu nhận biết:** tomorrow, next week, in the future, I think, I hope...',
    questions: [
      {
        id: 'g5-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"I think it _______ rain tomorrow."',
        options: ['is', 'will', 'going to', 'shall'],
        correctAnswer: 'will',
        explanation: 'Dự đoán tương lai với "I think" dùng will.',
        wordId: 'g-5'
      },
      {
        id: 'g5-q2',
        type: 'sentence_building',
        question: 'Sắp xếp thành câu hoàn chỉnh:',
        options: [],
        correctAnswer: 'I will help you with your homework',
        explanation: 'Lời hứa dùng will + V nguyên thể.',
        wordId: 'g-5',
        scrambledWords: ['help', 'will', 'homework', 'I', 'with', 'you', 'your']
      }
    ]
  },
  'g-6': {
    id: 'g-6',
    title: 'Câu bị động (Passive Voice)',
    theory: '### Câu bị động\nDùng khi muốn nhấn mạnh vào hành động hoặc đối tượng chịu tác động của hành động.\n\n**Cấu trúc chung:** S + be + V3/ed (+ by O)\n\n**Các thì phổ biến:**\n- Hiện tại đơn: am/is/are + V3/ed\n- Quá khứ đơn: was/were + V3/ed\n- Hiện tại hoàn thành: have/has + been + V3/ed\n- Tương lai đơn: will + be + V3/ed',
    questions: [
      {
        id: 'g6-q1',
        type: 'fill_in_blank',
        question: 'Chuyển sang bị động:\n"They built this house in 1990."\n-> "This house _______ in 1990."',
        options: ['is built', 'was built', 'were built', 'has been built'],
        correctAnswer: 'was built',
        explanation: 'Câu gốc ở quá khứ đơn (built), chủ ngữ mới "This house" số ít nên dùng "was built".',
        wordId: 'g-6'
      },
      {
        id: 'g6-q2',
        type: 'definition',
        question: 'Chọn câu bị động đúng cho câu: "The cat ate the fish."',
        options: [
          'The fish is eaten by the cat.',
          'The fish was ate by the cat.',
          'The fish was eaten by the cat.',
          'The fish were eaten by the cat.'
        ],
        correctAnswer: 'The fish was eaten by the cat.',
        explanation: 'Quá khứ đơn bị động: was/were + V3. "The fish" số ít dùng "was eaten".',
        wordId: 'g-6'
      }
    ]
  },
  'g-7': {
    id: 'g-7',
    title: 'Mệnh đề quan hệ (Relative Clauses)',
    theory: '### Mệnh đề quan hệ\nDùng để bổ nghĩa cho danh từ đứng trước nó.\n\n**Các đại từ quan hệ:**\n- **Who:** thay cho người (làm chủ ngữ)\n- **Whom:** thay cho người (làm tân ngữ)\n- **Which:** thay cho vật\n- **That:** thay cho cả người và vật (trong mệnh đề xác định)\n- **Whose:** chỉ sở hữu',
    questions: [
      {
        id: 'g7-q1',
        type: 'fill_in_blank',
        question: 'Điền đại từ quan hệ thích hợp:\n"The man _______ lives next door is a doctor."',
        options: ['which', 'who', 'whom', 'whose'],
        correctAnswer: 'who',
        explanation: 'Thay thế cho danh từ chỉ người "The man" làm chủ ngữ dùng "who".',
        wordId: 'g-7'
      },
      {
        id: 'g7-q2',
        type: 'fill_in_blank',
        question: 'Điền đại từ quan hệ thích hợp:\n"The book _______ I bought yesterday is very interesting."',
        options: ['who', 'whom', 'which', 'whose'],
        correctAnswer: 'which',
        explanation: 'Thay thế cho danh từ chỉ vật "The book" dùng "which".',
        wordId: 'g-7'
      }
    ]
  },
  'g-8': {
    id: 'g-8',
    title: 'So sánh (Comparison)',
    theory: '### Các cấu trúc so sánh\n\n**1. So sánh hơn:**\n- Tính từ ngắn: Adj-er + than\n- Tính từ dài: more + Adj + than\n\n**2. So sánh nhất:**\n- Tính từ ngắn: the + Adj-est\n- Tính từ dài: the most + Adj\n\n**3. So sánh bằng:** as + Adj + as',
    questions: [
      {
        id: 'g8-q1',
        type: 'fill_in_blank',
        question: 'Điền dạng đúng của từ:\n"This car is _______ than that one."',
        options: ['expensive', 'expensiver', 'more expensive', 'most expensive'],
        correctAnswer: 'more expensive',
        explanation: '"Expensive" là tính từ dài nên dùng "more ... than".',
        wordId: 'g-8'
      },
      {
        id: 'g8-q2',
        type: 'fill_in_blank',
        question: 'Điền dạng đúng của từ:\n"He is the _______ student in my class."',
        options: ['good', 'better', 'best', 'goodest'],
        correctAnswer: 'best',
        explanation: 'So sánh nhất của "good" là "best".',
        wordId: 'g-8'
      }
    ]
  },
  'g-9': {
    id: 'g-9',
    title: 'Câu điều kiện (Conditionals)',
    theory: '### Câu điều kiện loại 1 & 2\n\n**1. Loại 1 (Có thể xảy ra ở hiện tại/tương lai):**\nIf + S + V(hiện tại đơn), S + will + V(nguyên thể)\n\n**2. Loại 2 (Không có thật ở hiện tại):**\nIf + S + V(quá khứ đơn/were), S + would + V(nguyên thể)',
    questions: [
      {
        id: 'g9-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"If it _______ tomorrow, we will stay at home."',
        options: ['rain', 'rains', 'will rain', 'rained'],
        correctAnswer: 'rains',
        explanation: 'Câu điều kiện loại 1: Mệnh đề If dùng hiện tại đơn.',
        wordId: 'g-9'
      },
      {
        id: 'g9-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"If I _______ you, I would buy that car."',
        options: ['am', 'is', 'was', 'were'],
        correctAnswer: 'were',
        explanation: 'Câu điều kiện loại 2: Mệnh đề If dùng "were" cho tất cả các ngôi.',
        wordId: 'g-9'
      }
    ]
  },
  'g-10': {
    id: 'g-10',
    title: 'Động từ khuyết thiếu (Modal Verbs)',
    theory: '### Động từ khuyết thiếu\nDùng để diễn tả khả năng, sự cho phép, lời khuyên, sự bắt buộc.\n\n**Các từ phổ biến:**\n- **Can/Could:** khả năng\n- **Must:** bắt buộc\n- **Should:** lời khuyên\n- **May/Might:** khả năng xảy ra\n\n**Cấu trúc:** S + Modal Verb + V(nguyên thể)',
    questions: [
      {
        id: 'g10-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"You _______ see a doctor if you feel sick."',
        options: ['must', 'should', 'can', 'may'],
        correctAnswer: 'should',
        explanation: 'Dùng để đưa ra lời khuyên.',
        wordId: 'g-10'
      },
      {
        id: 'g10-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"I _______ swim when I was five."',
        options: ['can', 'could', 'must', 'should'],
        correctAnswer: 'could',
        explanation: 'Khả năng trong quá khứ dùng "could".',
        wordId: 'g-10'
      }
    ]
  },
  'g-11': {
    id: 'g-11',
    title: 'Quá khứ tiếp diễn & Hoàn thành',
    theory: '### 1. Quá khứ tiếp diễn (Past Continuous)\nDiễn tả hành động đang xảy ra tại một thời điểm xác định trong quá khứ.\n- **Cấu trúc:** S + was/were + V-ing\n- **Ví dụ:** I was studying at 8 PM yesterday.\n\n### 2. Quá khứ hoàn thành (Past Perfect)\nDiễn tả hành động xảy ra trước một hành động khác trong quá khứ.\n- **Cấu trúc:** S + had + V3/ed\n- **Ví dụ:** When I arrived, the train had left.',
    questions: [
      {
        id: 'g11-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"While I _______ dinner, the phone rang."',
        options: ['cook', 'cooked', 'was cooking', 'had cooked'],
        correctAnswer: 'was cooking',
        explanation: 'Hành động đang xảy ra (đang nấu ăn) thì có hành động khác xen vào (điện thoại reo).',
        wordId: 'g-11'
      },
      {
        id: 'g11-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"By the time we got there, the movie _______."',
        options: ['starts', 'started', 'was starting', 'had started'],
        correctAnswer: 'had started',
        explanation: 'Hành động xảy ra trước một hành động khác trong quá khứ dùng quá khứ hoàn thành.',
        wordId: 'g-11'
      }
    ]
  },
  'g-12': {
    id: 'g-12',
    title: 'Câu gián tiếp (Reported Speech)',
    theory: '### Câu gián tiếp\nDùng để thuật lại lời nói của người khác.\n\n**Quy tắc lùi thì:**\n- Hiện tại đơn -> Quá khứ đơn\n- Hiện tại tiếp diễn -> Quá khứ tiếp diễn\n- Hiện tại hoàn thành -> Quá khứ hoàn thành\n- Will -> Would\n- Can -> Could\n\n**Thay đổi trạng từ:**\n- Now -> Then\n- Today -> That day\n- Tomorrow -> The next day',
    questions: [
      {
        id: 'g12-q1',
        type: 'definition',
        question: 'Chuyển sang gián tiếp: He said, "I am tired."',
        options: [
          'He said that he is tired.',
          'He said that he was tired.',
          'He said that I was tired.',
          'He said that he has been tired.'
        ],
        correctAnswer: 'He said that he was tired.',
        explanation: 'Lùi thì từ "am" thành "was" và đổi đại từ "I" thành "he".',
        wordId: 'g-12'
      },
      {
        id: 'g12-q2',
        type: 'fill_in_blank',
        question: 'Chuyển sang gián tiếp: She said, "I will call you tomorrow."\n-> She said that she _______ me the next day.',
        options: ['will call', 'would call', 'calls', 'called'],
        correctAnswer: 'would call',
        explanation: 'Trong câu gián tiếp, "will" lùi thành "would".',
        wordId: 'g-12'
      }
    ]
  },
  'g-13': {
    id: 'g-13',
    title: 'V-ing hay To-V?',
    theory: '### Gerunds & Infinitives\n\n**1. Theo sau bởi To-V:**\n- decide, hope, want, plan, agree, promise...\n- *Ví dụ:* I want to go home.\n\n**2. Theo sau bởi V-ing:**\n- enjoy, mind, avoid, finish, suggest, keep...\n- *Ví dụ:* I enjoy listening to music.\n\n**3. Một số từ đi với cả hai (nghĩa khác nhau):**\n- remember, forget, stop, try...',
    questions: [
      {
        id: 'g13-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"We decided _______ a new car."',
        options: ['buy', 'buying', 'to buy', 'bought'],
        correctAnswer: 'to buy',
        explanation: 'Sau "decide" dùng To-V.',
        wordId: 'g-13'
      },
      {
        id: 'g13-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"She suggested _______ to the park."',
        options: ['go', 'going', 'to go', 'goes'],
        correctAnswer: 'going',
        explanation: 'Sau "suggest" dùng V-ing.',
        wordId: 'g-13'
      }
    ]
  },
  'g-14': {
    id: 'g-14',
    title: 'Từ nối & Liên từ (Linking Words)',
    theory: '### Linking Words\nGiúp kết nối các ý tưởng trong câu và đoạn văn.\n\n**1. Chỉ sự tương phản:** However, Although, Despite, In spite of.\n**2. Chỉ nguyên nhân - kết quả:** Because, Since, Therefore, As a result.\n**3. Chỉ sự bổ sung:** Moreover, Furthermore, In addition.\n**4. Chỉ ví dụ:** For example, For instance, Such as.',
    questions: [
      {
        id: 'g14-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"_______ it was raining, they went out."',
        options: ['Because', 'Although', 'However', 'Despite'],
        correctAnswer: 'Although',
        explanation: 'Dùng "Although" để chỉ sự tương phản giữa hai mệnh đề.',
        wordId: 'g-14'
      },
      {
        id: 'g14-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"He was sick; _______, he couldn\'t go to work."',
        options: ['because', 'although', 'therefore', 'but'],
        correctAnswer: 'therefore',
        explanation: 'Dùng "therefore" để chỉ kết quả.',
        wordId: 'g-14'
      }
    ]
  },
  'g-15': {
    id: 'g-15',
    title: 'Mạo từ & Từ định lượng',
    theory: '### Articles & Quantifiers\n\n**1. Mạo từ:**\n- **A/An:** dùng cho danh từ đếm được số ít, chưa xác định.\n- **The:** dùng cho danh từ đã xác định hoặc duy nhất.\n\n**2. Từ định lượng:**\n- **Many/Few:** dùng cho danh từ đếm được.\n- **Much/Little:** dùng cho danh từ không đếm được.\n- **Some/Any:** dùng cho cả hai.',
    questions: [
      {
        id: 'g15-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"I saw _______ elephant at the zoo yesterday."',
        options: ['a', 'an', 'the', 'some'],
        correctAnswer: 'an',
        explanation: '"Elephant" bắt đầu bằng nguyên âm nên dùng "an".',
        wordId: 'g-15'
      },
      {
        id: 'g15-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"How _______ money do you have?"',
        options: ['many', 'much', 'few', 'little'],
        correctAnswer: 'much',
        explanation: '"Money" là danh từ không đếm được nên dùng "much".',
        wordId: 'g-15'
      }
    ]
  },
  'g-16': {
    id: 'g-16',
    title: 'Điều kiện loại 3 & Hỗn hợp',
    theory: '### Advanced Conditionals\n\n**1. Loại 3 (Không có thật trong quá khứ):**\nIf + S + had + V3/ed, S + would have + V3/ed\n*Ví dụ:* If I had studied harder, I would have passed.\n\n**2. Loại hỗn hợp (Quá khứ tác động đến hiện tại):**\nIf + S + had + V3/ed, S + would + V(nguyên thể)\n*Ví dụ:* If I had taken the map, I wouldn\'t be lost now.',
    questions: [
      {
        id: 'g16-q1',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"If she _______ earlier, she wouldn\'t have missed the bus."',
        options: ['leave', 'left', 'had left', 'would leave'],
        correctAnswer: 'had left',
        explanation: 'Câu điều kiện loại 3 diễn tả sự việc không có thật trong quá khứ.',
        wordId: 'g-16'
      },
      {
        id: 'g16-q2',
        type: 'fill_in_blank',
        question: 'Điền từ thích hợp:\n"If I had known the answer, I _______ you."',
        options: ['tell', 'will tell', 'would tell', 'would have told'],
        correctAnswer: 'would have told',
        explanation: 'Câu điều kiện loại 3: If + had + V3, would have + V3.',
        wordId: 'g-16'
      }
    ]
  },
  'g-17': {
    id: 'g-17',
    title: 'Mệnh đề phân từ (Participle Clauses)',
    theory: '### Participle Clauses\nDùng để rút gọn câu, làm cho văn phong học thuật hơn.\n\n**1. V-ing (Chủ động):**\n- *Gốc:* Because he felt tired, he went to bed.\n- *Rút gọn:* **Feeling tired**, he went to bed.\n\n**2. V3/ed (Bị động):**\n- *Gốc:* Because it was built in 1990, the house is old.\n- *Rút gọn:* **Built in 1990**, the house is old.',
    questions: [
      {
        id: 'g17-q1',
        type: 'definition',
        question: 'Chọn câu rút gọn đúng cho: "Since he was born in Vietnam, he speaks Vietnamese fluently."',
        options: [
          'Born in Vietnam, he speaks Vietnamese fluently.',
          'Bearing in Vietnam, he speaks Vietnamese fluently.',
          'To be born in Vietnam, he speaks Vietnamese fluently.',
          'Having born in Vietnam, he speaks Vietnamese fluently.'
        ],
        correctAnswer: 'Born in Vietnam, he speaks Vietnamese fluently.',
        explanation: 'Rút gọn mệnh đề bị động dùng V3/ed.',
        wordId: 'g-17'
      },
      {
        id: 'g17-q2',
        type: 'definition',
        question: 'Chọn câu rút gọn đúng cho: "Because she didn\'t know what to do, she called her mother."',
        options: [
          'Not knowing what to do, she called her mother.',
          'Not known what to do, she called her mother.',
          'Didn\'t know what to do, she called her mother.',
          'No knowing what to do, she called her mother.'
        ],
        correctAnswer: 'Not knowing what to do, she called her mother.',
        explanation: 'Rút gọn mệnh đề chủ động ở dạng phủ định: Not + V-ing.',
        wordId: 'g-17'
      }
    ]
  }
};
