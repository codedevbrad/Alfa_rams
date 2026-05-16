import type { PpeItem } from '@shared/rams/types'

export interface PpeCategoryGroup {
  group: string
  items: PpeItem[]
}

export const PPE_CATEGORIES: PpeCategoryGroup[] = [
  {
    group: 'Head Protection',
    items: [
      { category: 'HARD HAT', requirement: 'EN397 — industrial safety helmet' },
      { category: 'HARD HAT', requirement: 'Chin strap fitted where overhead work or wind' },
      { category: 'BUMP CAP', requirement: 'EN812 — low overhead hazard areas only' }
    ]
  },
  {
    group: 'Eye & Face Protection',
    items: [
      { category: 'SAFETY GOGGLES', requirement: 'EN166 — impact and chemical splash' },
      { category: 'SAFETY SPECTACLES', requirement: 'EN166 — general site use' },
      { category: 'FACE SHIELD', requirement: 'EN166 — grinding, cutting, chemical splash' },
      { category: 'WELDING HEAD SCREEN', requirement: 'Auto-darkening helmet shade 9–13' },
      { category: 'WELDING HEAD SCREEN', requirement: 'Fixed shade helmet with flip visor' }
    ]
  },
  {
    group: 'Hearing Protection',
    items: [
      { category: 'EAR DEFENDERS', requirement: 'EN352 — noise above 80 dB(A)' },
      { category: 'EAR PLUGS', requirement: 'EN352 — disposable or reusable as required' },
      { category: 'HEARING PROTECTION', requirement: 'Dual protection where noise above 85 dB(A)' }
    ]
  },
  {
    group: 'Respiratory Protection',
    items: [
      { category: 'RESPIRATORY', requirement: 'FFP2 mask — nuisance dust' },
      { category: 'RESPIRATORY', requirement: 'FFP3 mask — fine dust, welding fume, silica' },
      { category: 'RESPIRATORY', requirement: 'Face-fit tested RPE — hazardous substances (COSHH)' },
      { category: 'RESPIRATORY', requirement: 'Powered air (PAPR) — high exposure welding/grinding' },
      { category: 'RESPIRATORY', requirement: 'Breathing apparatus — confined space as per assessment' }
    ]
  },
  {
    group: 'Hand & Arm Protection',
    items: [
      { category: 'GLOVES', requirement: 'General handling — cut level 1–2' },
      { category: 'GLOVES', requirement: 'Nitrile — chemical and oil contact' },
      { category: 'GLOVES', requirement: 'Leather gauntlets — welding and hot work' },
      { category: 'GLOVES', requirement: 'Insulated gloves — electrical work (appropriate class)' },
      { category: 'GLOVES', requirement: 'Anti-vibration — HAVS trigger time control' },
      { category: 'GLOVES', requirement: 'Chain-resistant — saw and sharp material handling' }
    ]
  },
  {
    group: 'Foot Protection',
    items: [
      { category: 'SAFETY BOOTS', requirement: 'S3 — toe cap, midsole, penetration resistant' },
      { category: 'SAFETY BOOTS', requirement: 'S1P — toe cap and penetration resistant' },
      { category: 'SAFETY BOOTS', requirement: 'Heat-resistant soles — hot work areas' },
      { category: 'WADERS', requirement: 'Chemical-resistant — spill and wet work as required' }
    ]
  },
  {
    group: 'Body & Skin Protection',
    items: [
      { category: 'HI VIS CLOTHING', requirement: 'EN ISO 20471:2013 class 2 minimum' },
      { category: 'HI VIS VEST', requirement: 'EN ISO 20471:2013 — over other clothing' },
      { category: 'COVERALLS', requirement: 'Tyvek or equivalent — dust and contamination' },
      { category: 'COVERALLS', requirement: 'EN ISO 13982-1:2004 — particle tight' },
      { category: 'FR CLOTHING', requirement: 'Flame-retardant overalls — hot work and welding' },
      { category: 'WATERPROOF CLOTHING', requirement: 'EN 343 — adverse weather' },
      { category: 'APRON', requirement: 'Chemical-resistant — COSHH tasks' }
    ]
  },
  {
    group: 'Fall Protection',
    items: [
      { category: 'SAFETY HARNESS', requirement: 'EN361 — work at height over 2 m' },
      { category: 'SAFETY HARNESS', requirement: 'Fall restraint lanyard — MEWP and leading edge' },
      { category: 'SAFETY HARNESS', requirement: 'Fall arrest lanyard with shock absorber' },
      { category: 'MEWP HARNESS', requirement: 'Full body harness with short lanyard in basket' }
    ]
  },
  {
    group: 'Welding & Hot Work',
    items: [
      { category: 'WELDING PPE', requirement: 'Leather apron, gauntlets, FR overalls' },
      { category: 'WELDING PPE', requirement: 'Welding screen or curtain — protect others' },
      { category: 'WELDING PPE', requirement: 'Fire-resistant head and neck cover under helmet' }
    ]
  },
  {
    group: 'Site & General',
    items: [
      { category: 'SUN PROTECTION', requirement: 'SPF 30+ — outdoor work' },
      { category: 'KNEE PADS', requirement: 'Where prolonged kneeling' },
      { category: 'LOTO', requirement: 'Personal padlocks and tags — isolation work' },
      { category: 'LIFE JACKET', requirement: 'Work over or adjacent to water' },
      { category: 'GAS DETECTOR', requirement: 'Personal monitor — confined space or gas risk' }
    ]
  }
]

/** Flat list of all library PPE items (order matches picker indices). */
export const PPE_ITEMS: PpeItem[] = PPE_CATEGORIES.flatMap(({ items }) => items)
