import type { FieldLabel } from '@/types/paper'

export interface FieldConfig {
  label: FieldLabel
  arxivCategories: string[]      // arXiv 카테고리 prefix 목록
  useSemanticScholar?: boolean   // Semantic Scholar 보완 사용 여부
  semanticScholarQuery?: string  // Semantic Scholar 검색 쿼리
}

export const FIELDS: FieldConfig[] = [
  {
    label: '전체',
    arxivCategories: [],
  },
  {
    label: 'AI / 머신러닝',
    arxivCategories: ['cs.AI', 'cs.LG', 'cs.NE', 'stat.ML'],
  },
  {
    label: '물리',
    arxivCategories: ['physics', 'cond-mat', 'quant-ph', 'hep-th', 'hep-ph', 'hep-ex', 'gr-qc', 'nucl-th'],
  },
  {
    label: '반도체',
    arxivCategories: ['cond-mat.mes-hall', 'cond-mat.mtrl-sci', 'cond-mat.supr-con'],
  },
  {
    label: '하드웨어',
    arxivCategories: ['cs.AR', 'cs.ET', 'cs.NI', 'eess'],
  },
  {
    label: '소프트웨어',
    arxivCategories: ['cs.SE', 'cs.PL', 'cs.OS', 'cs.DC'],
  },
  {
    label: '수학',
    arxivCategories: ['math'],
  },
  {
    label: '디자인',
    arxivCategories: ['cs.HC', 'cs.GR'],
  },
  {
    label: '심리',
    arxivCategories: ['q-bio.NC'],
    useSemanticScholar: true,
    semanticScholarQuery: 'psychology cognitive science behavior',
  },
  {
    label: '기타',
    arxivCategories: ['econ', 'q-fin', 'stat', 'cs.RO', 'cs.CV', 'cs.CL'],
  },
]

export const FIELD_LABELS = FIELDS.map((f) => f.label)

export function getFieldConfig(label: FieldLabel): FieldConfig | undefined {
  return FIELDS.find((f) => f.label === label)
}

/** arXiv 카테고리 코드로부터 UI 표시 분야명 반환 */
export function inferFieldLabel(categories: string[]): FieldLabel {
  for (const field of FIELDS) {
    if (field.label === '전체' || field.label === '기타') continue
    for (const cat of categories) {
      if (field.arxivCategories.some((prefix) => cat.startsWith(prefix))) {
        return field.label
      }
    }
  }
  return '기타'
}
