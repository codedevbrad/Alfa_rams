import type { RiskRow } from '@shared/rams/types'
import { withComputedRisks } from '@shared/rams/risk'

type ActivityHazardTemplate = Omit<RiskRow, 'risk' | 'residualRisk'>

export interface ActivityCategory {
  category: string
  hazards: ActivityHazardTemplate[]
}

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  {
    category: 'Site & General',
    hazards: [
      {
        activity: 'Site Access & Egress',
        hazard: 'Vehicle collision with pedestrians',
        likelihood: 4,
        severity: 5,
        who: 'A/B/C',
        controls:
          'Segregated pedestrian walkways, banksman where required, speed limits enforced, high visibility clothing mandatory, deliveries coordinated with site management',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Daily supervisor inspections'
      },
      {
        activity: 'Site Access & Egress',
        hazard: 'Slips, trips and falls',
        likelihood: 4,
        severity: 3,
        who: 'A/B/C',
        controls:
          'Good housekeeping maintained, walkways kept clear, adequate lighting provided, trailing leads managed',
        residualLikelihood: 1,
        residualSeverity: 3,
        residualWho: 'A/B/C',
        monitoring: 'Site inspections'
      },
      {
        activity: 'Site Induction',
        hazard: 'Operatives unaware of site hazards',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls:
          'All personnel to attend site induction and RAMS briefing prior to commencing work',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Supervisor records attendance'
      },
      {
        activity: 'Adverse Weather',
        hazard: 'Slips/falls/high wind incidents',
        likelihood: 4,
        severity: 4,
        who: 'A/B/C',
        controls: 'Weather assessed daily, suspend lifting/WAH during unsafe conditions',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B/C',
        monitoring: 'Daily assessment'
      },
      {
        activity: 'Fatigue',
        hazard: 'Reduced concentration causing accidents',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'Working hours monitored, breaks enforced',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Supervisor review'
      },
      {
        activity: 'Lone Working',
        hazard: 'Delayed emergency response',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls: 'Lone working prohibited unless authorised and controlled',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Management monitoring'
      },
      {
        activity: 'Fire Emergency',
        hazard: 'Smoke inhalation/burns',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Emergency routes briefed, extinguishers available, fire alarms understood',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Emergency drills'
      }
    ]
  },
  {
    category: 'Manual Handling',
    hazards: [
      {
        activity: 'Manual Handling',
        hazard: 'Musculoskeletal injuries',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls:
          'Mechanical lifting aids used where possible, team lifts implemented, manual handling training provided',
        residualLikelihood: 2,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'Supervisor monitoring'
      },
      {
        activity: 'Manual Handling',
        hazard: 'Dropped loads',
        likelihood: 4,
        severity: 4,
        who: 'A/B/C',
        controls: 'Assess load before lifting, clear lifting route, use gloves and safety boots',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B/C',
        monitoring: 'Site safety inspections'
      }
    ]
  },
  {
    category: 'Lifting & Material Handling',
    hazards: [
      {
        activity: 'Use of Crane',
        hazard: 'Failure of lifting equipment',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls:
          'All lifting equipment certified and inspected under LOLER, appointed person lift plans used',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Lift supervisor monitoring'
      },
      {
        activity: 'Use of Forklift Truck',
        hazard: 'Collision with pedestrians',
        likelihood: 4,
        severity: 5,
        who: 'A/B/C',
        controls: 'Trained operators only, segregated routes, reversing alarms operational',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'FLT inspections'
      },
      {
        activity: 'Vehicle Loading/Unloading',
        hazard: 'Falling loads',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Exclusion zones established, competent slinger/signaller used',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Supervisor monitoring'
      }
    ]
  },
  {
    category: 'Structural & Civil',
    hazards: [
      {
        activity: 'Structural Steel Erection',
        hazard: 'Collapse of steelwork',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls:
          'Erection sequence designed and controlled, temporary bracing installed, competent erectors only',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Appointed supervisor inspection'
      },
      {
        activity: 'Structural Steel Erection',
        hazard: 'Falling objects',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Exclusion zones established, tethered tools used, lifting areas barriered off',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Daily inspections'
      },
      {
        activity: 'Demolition/Removal Works',
        hazard: 'Structural instability',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Sequence planned by competent person, exclusion zones established',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Supervisor inspection'
      }
    ]
  },
  {
    category: 'Welding, Hot Works & Fabrication',
    hazards: [
      {
        activity: 'Welding Activities',
        hazard: 'Fire from hot works',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Hot work permit required, extinguishers available, fire watch maintained',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Permit monitoring'
      },
      {
        activity: 'Welding Activities',
        hazard: 'Welding fumes inhalation',
        likelihood: 5,
        severity: 4,
        who: 'A/B',
        controls: 'LEV extraction used, FFP3 RPE worn, adequate ventilation provided',
        residualLikelihood: 2,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'Supervisor checks'
      },
      {
        activity: 'TIG Welding Stainless Steel',
        hazard: 'Exposure to hexavalent chromium fumes',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls: 'LEV extraction mandatory, face fit tested RPE worn, COSHH assessments briefed',
        residualLikelihood: 2,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Occupational health monitoring'
      },
      {
        activity: 'Hot Works Near Process Equipment',
        hazard: 'Explosion/fire',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Gas testing completed, flammable materials removed, permit required',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Permit monitoring'
      },
      {
        activity: 'Grinding Activities',
        hazard: 'Eye injuries from sparks/particles',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'Full face shield and safety goggles worn, guards fitted to grinders',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Tool inspections'
      },
      {
        activity: 'Abrasive Wheels',
        hazard: 'Disc burst',
        likelihood: 5,
        severity: 4,
        who: 'A/B',
        controls: 'Abrasive wheels trained operatives only, discs inspected before use',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Supervisor monitoring'
      }
    ]
  },
  {
    category: 'Pipefitting & Pressure Systems',
    hazards: [
      {
        activity: 'Pipefitting',
        hazard: 'Release of pressure from pipework',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Pipework isolated, drained and verified dead before cutting',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Permit verification'
      },
      {
        activity: 'Pipefitting',
        hazard: 'Contact with hazardous process fluids',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls: 'Client isolation certificates obtained, COSHH controls implemented',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Site supervision'
      },
      {
        activity: 'Pressure Testing',
        hazard: 'Pipe rupture',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls:
          'Exclusion zones established, calibrated equipment used, competent personnel only',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Test supervisor monitoring'
      }
    ]
  },
  {
    category: 'Work at Height',
    hazards: [
      {
        activity: 'Work at Height',
        hazard: 'Falls from height',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls:
          'Collective protection preferred, MEWPs/scaffold inspected, harnesses worn where required',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Daily WAH inspections'
      },
      {
        activity: 'Working from MEWP',
        hazard: 'Entrapment/crushing',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls:
          'IPAF trained operatives only, spotter used where required, emergency rescue plan in place',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Supervisor monitoring'
      },
      {
        activity: 'Working from Scaffold',
        hazard: 'Scaffold collapse',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Scaffold erected and tagged by competent scaffolders',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Weekly scaffold inspections'
      },
      {
        activity: 'Ladder Use',
        hazard: 'Falls from ladders',
        likelihood: 4,
        severity: 5,
        who: 'A/B',
        controls: 'Ladders for short duration/light duty only, secured and inspected before use',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Supervisor checks'
      }
    ]
  },
  {
    category: 'Confined Spaces',
    hazards: [
      {
        activity: 'Confined Space Entry',
        hazard: 'Asphyxiation',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls:
          'Confined space permit, gas monitoring, rescue plan and trained personnel required',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Continuous monitoring'
      }
    ]
  },
  {
    category: 'Electrical & Power',
    hazards: [
      {
        activity: 'Electrical Works',
        hazard: 'Electric shock',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls: 'Isolate and lock off systems, test before touch, 110V tools preferred',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Electrical supervision'
      },
      {
        activity: 'Temporary Power',
        hazard: 'Damaged cables causing electrocution',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'RCD protection fitted, cables routed safely, daily inspections completed',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Daily inspections'
      },
      {
        activity: 'Generator Use',
        hazard: 'Fire during refuelling',
        likelihood: 4,
        severity: 5,
        who: 'A/B/C',
        controls: 'Refuel only when shut down and cool, spill kits available',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Supervisor monitoring'
      }
    ]
  },
  {
    category: 'Plant, Machinery & Installation',
    hazards: [
      {
        activity: 'Conveyor Installation',
        hazard: 'Entanglement/crushing',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls: 'Equipment isolated and locked off, no live work permitted',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Permit verification'
      },
      {
        activity: 'Machinery Installation',
        hazard: 'Crushing during positioning',
        likelihood: 5,
        severity: 5,
        who: 'A/B',
        controls: 'Use certified lifting equipment and exclusion zones',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B',
        monitoring: 'Lift supervision'
      },
      {
        activity: 'Use of Power Tools',
        hazard: 'Cuts and lacerations',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'Correct tools used, guards fitted, competent operators only',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Tool inspections'
      },
      {
        activity: 'Use of Gas Cylinders',
        hazard: 'Cylinder explosion',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Cylinders secured upright, flashback arrestors fitted',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Daily checks'
      }
    ]
  },
  {
    category: 'Occupational Health',
    hazards: [
      {
        activity: 'Noise Exposure',
        hazard: 'Hearing damage',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'Hearing protection mandatory above 80dB, monitoring undertaken',
        residualLikelihood: 1,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'Supervisor checks'
      },
      {
        activity: 'HAVS Exposure',
        hazard: 'Hand arm vibration syndrome',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'Low vibration tools used, trigger times monitored',
        residualLikelihood: 2,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'HAVS records maintained'
      },
      {
        activity: 'Dust Generation',
        hazard: 'Respiratory illness',
        likelihood: 4,
        severity: 5,
        who: 'A/B',
        controls: 'Dust suppression and FFP3 masks used',
        residualLikelihood: 1,
        residualSeverity: 4,
        residualWho: 'A/B',
        monitoring: 'Supervisor monitoring'
      },
      {
        activity: 'Lagging/Cladding Works',
        hazard: 'Exposure to fibres/dust',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'RPE worn, controlled cutting methods used',
        residualLikelihood: 1,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'Supervisor checks'
      },
      {
        activity: 'Use of Chemicals',
        hazard: 'Skin/eye irritation',
        likelihood: 4,
        severity: 4,
        who: 'A/B',
        controls: 'COSHH assessments briefed, gloves and eye protection worn',
        residualLikelihood: 1,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'COSHH monitoring'
      }
    ]
  },
  {
    category: 'Industrial & Process',
    hazards: [
      {
        activity: 'Industrial Shutdown Works',
        hazard: 'SIMOPS conflict with other contractors',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Daily coordination meetings, permit system enforced',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Client coordination'
      },
      {
        activity: 'Working Near Live Production',
        hazard: 'Unexpected plant movement/startup',
        likelihood: 5,
        severity: 5,
        who: 'A/B/C',
        controls: 'Full LOTO procedures and permits implemented',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: ''
      }
    ]
  },
  {
    category: 'Environmental & Waste',
    hazards: [
      {
        activity: 'Environmental Spill',
        hazard: 'Pollution to drains/environment',
        likelihood: 4,
        severity: 5,
        who: 'A/B/C',
        controls: 'Spill kits available, drip trays used, waste disposed correctly',
        residualLikelihood: 1,
        residualSeverity: 5,
        residualWho: 'A/B/C',
        monitoring: 'Environmental inspections'
      },
      {
        activity: 'Waste Handling',
        hazard: 'Cuts from sharp scrap',
        likelihood: 3,
        severity: 3,
        who: 'A/B',
        controls: 'Gloves worn, waste segregated and removed regularly',
        residualLikelihood: 1,
        residualSeverity: 3,
        residualWho: 'A/B',
        monitoring: 'Site inspections'
      }
    ]
  }
]

/** Flat list of all template hazards with computed risk scores. */
export const ACTIVITY_HAZARDS: RiskRow[] = ACTIVITY_CATEGORIES.flatMap(({ hazards }) =>
  hazards.map((hazard) => withComputedRisks(hazard))
)

/** Unique activity names across all categories (one per line for Activities form). */
export const ACTIVITY_NAMES: string[] = [
  ...new Set(ACTIVITY_CATEGORIES.flatMap(({ hazards }) => hazards.map((h) => h.activity)))
]
