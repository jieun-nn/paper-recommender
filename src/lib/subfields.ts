import type { FieldLabel } from '@/types/paper'

export interface DepartmentConfig {
  name: string
  fieldLabel: FieldLabel
  subFields: string[]
}

// arXiv 카테고리 prefix → 세부전공 매핑 (긴 것 먼저 매칭)
export const ARXIV_TO_SUBFIELD: Record<string, string> = {
  // AI / 머신러닝
  'cs.CV': '컴퓨터비전',
  'cs.CL': '자연어처리',
  'cs.AI': '인공지능·기계학습',
  'cs.LG': '인공지능·기계학습',
  'cs.NE': '신경망·진화계산',
  'stat.ML': '통계적 기계학습',
  'cs.RO': '제어·로보틱스',
  'cs.IR': '데이터베이스·빅데이터',

  // 하드웨어
  'cs.AR': '컴퓨터구조',
  'cs.ET': '컴퓨터구조',
  'cs.SY': '제어·로보틱스',
  'eess.SP': '신호처리·통신',
  'eess.SY': '제어·로보틱스',
  'eess.EE': '전력·에너지시스템',
  'eess.IV': '신호처리·통신',

  // 소프트웨어
  'cs.SE': '소프트웨어공학',
  'cs.PL': '소프트웨어공학',
  'cs.OS': '시스템·운영체제',
  'cs.DC': '네트워크·분산컴퓨팅',
  'cs.NI': '네트워크·분산컴퓨팅',
  'cs.DB': '데이터베이스·빅데이터',
  'cs.CR': '보안·암호학',

  // 디자인
  'cs.HC': 'UX·인터랙션디자인',
  'cs.GR': '시각·그래픽디자인',

  // 반도체 (물리 prefix보다 먼저)
  'cond-mat.mes-hall': '나노·메조스케일 물리',
  'cond-mat.mtrl-sci': '재료과학',
  'cond-mat.supr-con': '초전도·강상관계',
  'cond-mat.str-el': '강상관계',
  'cond-mat.quant-gas': '고체물리',
  'cond-mat.soft': '고체물리',
  'cond-mat.stat-mech': '고체물리',
  'cond-mat': '고체물리', // fallback

  // 물리
  'quant-ph': '양자정보·양자컴퓨팅',
  'hep-th': '고에너지이론',
  'hep-ph': '입자·핵물리',
  'hep-ex': '입자·핵물리',
  'nucl-th': '입자·핵물리',
  'nucl-ex': '입자·핵물리',
  'physics.atom-ph': '원자·분자·광학물리',
  'physics.optics': '원자·분자·광학물리',
  'physics.plasm-ph': '플라즈마물리',
  'physics.acc-ph': '입자·핵물리',
  'physics.comp-ph': '수리물리',
  'astro-ph': '천체물리·우주론',
  'gr-qc': '천체물리·우주론',
  'physics': '수리물리', // fallback

  // 수학
  'math-ph': '수리물리',
  'math.AG': '대수학',
  'math.RA': '대수학',
  'math.AC': '대수학',
  'math.GR': '대수학',
  'math.CA': '해석학',
  'math.CV': '해석학',
  'math.FA': '해석학',
  'math.AP': '해석학',
  'math.AT': '위상수학·기하학',
  'math.GN': '위상수학·기하학',
  'math.GT': '위상수학·기하학',
  'math.DG': '위상수학·기하학',
  'math.PR': '확률론·통계학',
  'math.ST': '확률론·통계학',
  'math.OC': '수치해석·최적화',
  'math.NA': '수치해석·최적화',
  'math.CO': '조합론·이산수학',
  'math.NT': '정수론',

  // 심리
  'q-bio.NC': '신경심리학',
  'q-bio.QM': '신경심리학',
}

// 세부전공 → 분야(field_label) 매핑
export const SUBFIELD_TO_FIELD: Record<string, FieldLabel> = {
  // AI / 머신러닝
  '인공지능·기계학습': 'AI / 머신러닝',
  '컴퓨터비전': 'AI / 머신러닝',
  '자연어처리': 'AI / 머신러닝',
  '신경망·진화계산': 'AI / 머신러닝',
  '통계적 기계학습': 'AI / 머신러닝',
  '강화학습': 'AI / 머신러닝',
  '로보틱스': 'AI / 머신러닝',
  // 반도체
  '나노·메조스케일 물리': '반도체',
  '재료과학': '반도체',
  '초전도·강상관계': '반도체',
  '강상관계': '반도체',
  '반도체·집적회로': '반도체',
  '반도체재료': '반도체',
  '나노재료·나노기술': '반도체',
  '에너지재료': '반도체',
  // 물리
  '고체물리': '물리',
  '원자·분자·광학물리': '물리',
  '입자·핵물리': '물리',
  '양자정보·양자컴퓨팅': '물리',
  '천체물리·우주론': '물리',
  '플라즈마물리': '물리',
  '수리물리': '물리',
  '고에너지이론': '물리',
  // 하드웨어
  '컴퓨터구조': '하드웨어',
  '신호처리·통신': '하드웨어',
  '전력·에너지시스템': '하드웨어',
  '제어·로보틱스': '하드웨어',
  '광전자공학': '하드웨어',
  // 소프트웨어
  '소프트웨어공학': '소프트웨어',
  '시스템·운영체제': '소프트웨어',
  '네트워크·분산컴퓨팅': '소프트웨어',
  '데이터베이스·빅데이터': '소프트웨어',
  '보안·암호학': '소프트웨어',
  // 수학
  '대수학': '수학',
  '해석학': '수학',
  '위상수학·기하학': '수학',
  '확률론·통계학': '수학',
  '수치해석·최적화': '수학',
  '조합론·이산수학': '수학',
  '정수론': '수학',
  // 디자인
  'UX·인터랙션디자인': '디자인',
  'HCI·그래픽스': '디자인',
  '시각·그래픽디자인': '디자인',
  '산업·제품디자인': '디자인',
  '영상·미디어디자인': '디자인',
  // 심리
  '인지심리학': '심리',
  '사회심리학': '심리',
  '임상심리학': '심리',
  '신경심리학': '심리',
  '발달심리학': '심리',
  '산업·조직심리학': '심리',
}

// 학과 목록 (한국 주요 대학 기준)
export const DEPARTMENTS: DepartmentConfig[] = [
  // 이공계
  {
    name: '물리학과',
    fieldLabel: '물리',
    subFields: ['고체물리', '원자·분자·광학물리', '입자·핵물리', '양자정보·양자컴퓨팅', '천체물리·우주론', '플라즈마물리', '수리물리'],
  },
  {
    name: '수학과',
    fieldLabel: '수학',
    subFields: ['대수학', '해석학', '위상수학·기하학', '확률론·통계학', '수치해석·최적화', '수리물리', '조합론·이산수학', '정수론'],
  },
  {
    name: '응용수학과',
    fieldLabel: '수학',
    subFields: ['확률론·통계학', '수치해석·최적화', '수리물리', '대수학', '해석학'],
  },
  {
    name: '통계학과',
    fieldLabel: '수학',
    subFields: ['확률론·통계학', '수치해석·최적화', '통계적 기계학습', '데이터베이스·빅데이터'],
  },
  {
    name: '컴퓨터공학과',
    fieldLabel: 'AI / 머신러닝',
    subFields: ['인공지능·기계학습', '컴퓨터비전', '자연어처리', '시스템·운영체제', '네트워크·분산컴퓨팅', '데이터베이스·빅데이터', '소프트웨어공학', '보안·암호학', '컴퓨터구조', 'UX·인터랙션디자인'],
  },
  {
    name: '소프트웨어학과',
    fieldLabel: '소프트웨어',
    subFields: ['소프트웨어공학', '인공지능·기계학습', '시스템·운영체제', '네트워크·분산컴퓨팅', '데이터베이스·빅데이터', '보안·암호학'],
  },
  {
    name: '인공지능학과',
    fieldLabel: 'AI / 머신러닝',
    subFields: ['인공지능·기계학습', '컴퓨터비전', '자연어처리', '신경망·진화계산', '통계적 기계학습', '강화학습', '로보틱스'],
  },
  {
    name: '데이터과학과',
    fieldLabel: 'AI / 머신러닝',
    subFields: ['통계적 기계학습', '데이터베이스·빅데이터', '인공지능·기계학습', '확률론·통계학'],
  },
  {
    name: '전기전자공학과',
    fieldLabel: '반도체',
    subFields: ['반도체·집적회로', '신호처리·통신', '전력·에너지시스템', '제어·로보틱스', '광전자공학', '나노·메조스케일 물리'],
  },
  {
    name: '전자공학과',
    fieldLabel: '반도체',
    subFields: ['반도체·집적회로', '신호처리·통신', '제어·로보틱스', '광전자공학'],
  },
  {
    name: '반도체공학과',
    fieldLabel: '반도체',
    subFields: ['나노·메조스케일 물리', '재료과학', '반도체·집적회로', '초전도·강상관계'],
  },
  {
    name: '재료공학과',
    fieldLabel: '반도체',
    subFields: ['재료과학', '반도체재료', '나노재료·나노기술', '에너지재료', '초전도·강상관계'],
  },
  {
    name: '신소재공학과',
    fieldLabel: '반도체',
    subFields: ['재료과학', '나노재료·나노기술', '에너지재료', '반도체재료'],
  },
  {
    name: '화학공학과',
    fieldLabel: '반도체',
    subFields: ['재료과학', '나노재료·나노기술', '에너지재료'],
  },
  {
    name: '화학과',
    fieldLabel: '물리',
    subFields: ['재료과학', '원자·분자·광학물리', '수리물리'],
  },
  {
    name: '천문학과',
    fieldLabel: '물리',
    subFields: ['천체물리·우주론', '입자·핵물리'],
  },
  {
    name: '정보통신공학과',
    fieldLabel: '하드웨어',
    subFields: ['신호처리·통신', '네트워크·분산컴퓨팅', '보안·암호학', '컴퓨터구조'],
  },
  {
    name: '기계공학과',
    fieldLabel: '하드웨어',
    subFields: ['제어·로보틱스', '신호처리·통신', '에너지재료'],
  },
  {
    name: '항공우주공학과',
    fieldLabel: '하드웨어',
    subFields: ['제어·로보틱스', '신호처리·통신', '천체물리·우주론'],
  },
  {
    name: '산업공학과',
    fieldLabel: '소프트웨어',
    subFields: ['데이터베이스·빅데이터', '소프트웨어공학', '수치해석·최적화', '통계적 기계학습'],
  },
  // 인문사회
  {
    name: '심리학과',
    fieldLabel: '심리',
    subFields: ['인지심리학', '사회심리학', '임상심리학', '신경심리학', '발달심리학', '산업·조직심리학'],
  },
  {
    name: '인지과학과',
    fieldLabel: '심리',
    subFields: ['인지심리학', '신경심리학', '인공지능·기계학습', '자연어처리'],
  },
  {
    name: '뇌인지과학과',
    fieldLabel: '심리',
    subFields: ['신경심리학', '인지심리학'],
  },
  // 디자인
  {
    name: '시각디자인학과',
    fieldLabel: '디자인',
    subFields: ['시각·그래픽디자인', 'UX·인터랙션디자인', '영상·미디어디자인'],
  },
  {
    name: '산업디자인학과',
    fieldLabel: '디자인',
    subFields: ['산업·제품디자인', 'UX·인터랙션디자인', '시각·그래픽디자인'],
  },
  {
    name: 'UX디자인학과',
    fieldLabel: '디자인',
    subFields: ['UX·인터랙션디자인', 'HCI·그래픽스', '시각·그래픽디자인'],
  },
  {
    name: '디지털미디어학과',
    fieldLabel: '디자인',
    subFields: ['영상·미디어디자인', 'UX·인터랙션디자인', '시각·그래픽디자인'],
  },
  {
    name: '커뮤니케이션디자인학과',
    fieldLabel: '디자인',
    subFields: ['시각·그래픽디자인', 'UX·인터랙션디자인'],
  },
  {
    name: '기타',
    fieldLabel: '기타',
    subFields: [],
  },
]

// arXiv 카테고리 목록으로부터 세부전공 추론
export function inferSubField(categories: string[]): string | null {
  const sortedKeys = Object.keys(ARXIV_TO_SUBFIELD).sort((a, b) => b.length - a.length)
  for (const cat of categories) {
    for (const key of sortedKeys) {
      if (cat.startsWith(key)) return ARXIV_TO_SUBFIELD[key]
    }
  }
  return null
}
