import { describe, it, expect } from 'vitest'
import { calculateVerdictScore } from '@/lib/verdict-score-calc'

describe('VERDICT Score Calculator — Core Formula', () => {

  describe('Base Score', () => {
    it('returns exactly 5.0 when ALL parameters are null', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.0)
    })

    it('score is always between 0.0 and 10.0', () => {
      const extreme = calculateVerdictScore({
        attendance_percent: 100,
        criminal_case_count: 0,
        worst_case_severity: null,
        education_verification_status: 'Verified',
        asset_growth_percent: 50,
        party_switch_count: 0,
        mplads_utilisation_percent: 95,
      })
      expect(extreme.score).toBeGreaterThanOrEqual(0.0)
      expect(extreme.score).toBeLessThanOrEqual(10.0)
    })

    it('score is rounded to 1 decimal place', () => {
      const result = calculateVerdictScore({
        attendance_percent: 75,
        criminal_case_count: 0,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      const decimalPlaces = result.score.toString().split('.')[1]?.length ?? 0
      expect(decimalPlaces).toBeLessThanOrEqual(1)
    })
  })

  describe('NULL vs ZERO distinction — CRITICAL', () => {
    it('null criminal_case_count gives 0.0 impact (neutral)', () => {
      const withNull = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(withNull.score).toBe(5.0)
    })

    it('criminal_case_count === 0 gives +1.0 bonus (confirmed clean)', () => {
      const withZero = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: 0,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(withZero.score).toBe(6.0)
    })

    it('null attendance gives 0.0 impact, not a penalty or bonus', () => {
      const nullAttendance = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: 0,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      const highAttendance = calculateVerdictScore({
        attendance_percent: 95,
        criminal_case_count: 0,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(highAttendance.score).toBeGreaterThan(nullAttendance.score)
      expect(nullAttendance.score).toBe(6.0)
    })
  })

  describe('Attendance Parameter', () => {
    it('attendance >= 80% gives +2.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: 85,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(7.0) // 5.0 + 2.0
    })

    it('attendance 60-79% gives +1.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: 70,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(6.0) // 5.0 + 1.0
    })

    it('attendance 40-59% gives 0.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: 50,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.0) // 5.0 + 0.0
    })

    it('attendance < 40% gives -1.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: 30,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(4.0) // 5.0 - 1.0
    })

    it('attendance exactly 80% gives +2.0 (boundary)', () => {
      const result = calculateVerdictScore({
        attendance_percent: 80,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(7.0)
    })

    it('attendance exactly 60% gives +1.0 (boundary)', () => {
      const result = calculateVerdictScore({
        attendance_percent: 60,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(6.0)
    })
  })

  describe('Criminal Cases Parameter', () => {
    it('Minor severity deducts -0.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: 1,
        worst_case_severity: 'Minor',
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(4.5) // 5.0 - 0.5
    })

    it('Moderate severity deducts -1.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: 1,
        worst_case_severity: 'Moderate',
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(3.5) // 5.0 - 1.5
    })

    it('Serious severity deducts -2.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: 2,
        worst_case_severity: 'Serious',
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(2.5) // 5.0 - 2.5
    })

    it('Severe severity deducts -4.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: 1,
        worst_case_severity: 'Severe',
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(1.0) // 5.0 - 4.0
    })

    it('score never goes below 0.0 with extreme deductions', () => {
      const result = calculateVerdictScore({
        attendance_percent: 20,
        criminal_case_count: 5,
        worst_case_severity: 'Severe',
        education_verification_status: 'Suspicious',
        asset_growth_percent: 600,
        party_switch_count: 5,
        mplads_utilisation_percent: 10,
      })
      expect(result.score).toBeGreaterThanOrEqual(0.0)
    })
  })

  describe('Education Parameter', () => {
    it('Verified education gives +0.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: 'Verified',
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.5) // 5.0 + 0.5
    })

    it('Suspicious education gives -0.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: 'Suspicious',
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(4.5) // 5.0 - 0.5
    })

    it('Not Checked education gives 0.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: 'Not Checked',
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.0)
    })

    it('Unverified education gives 0.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: 'Unverified',
        asset_growth_percent: null,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.0)
    })
  })

  describe('Asset Growth Parameter', () => {
    it('growth < 200% gives +1.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: 150,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(6.0)
    })

    it('growth 200-400% gives 0.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: 300,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.0)
    })

    it('growth > 400% deducts -2.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: 500,
        party_switch_count: null,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(3.0)
    })
  })

  describe('Party Switch Parameter', () => {
    it('0 switches gives +0.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: 0,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.5)
    })

    it('1 switch gives 0.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: 1,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(5.0)
    })

    it('2+ switches gives -0.5', () => {
      const result = calculateVerdictScore({
        attendance_percent: null,
        criminal_case_count: null,
        worst_case_severity: null,
        education_verification_status: null,
        asset_growth_percent: null,
        party_switch_count: 3,
        mplads_utilisation_percent: null,
      })
      expect(result.score).toBe(4.5)
    })
  })

  describe('Full Profile Score Integration Tests', () => {
    it('model MP: 90% attendance, clean, verified edu, loyal = 8.0+', () => {
      const result = calculateVerdictScore({
        attendance_percent: 90,
        criminal_case_count: 0,
        worst_case_severity: null,
        education_verification_status: 'Verified',
        asset_growth_percent: 100,
        party_switch_count: 0,
        mplads_utilisation_percent: 85,
      })
      expect(result.score).toBeGreaterThanOrEqual(8.0)
    })

    it('criminal MP: severe case, poor attendance, fake degree = below 3.0', () => {
      const result = calculateVerdictScore({
        attendance_percent: 35,
        criminal_case_count: 3,
        worst_case_severity: 'Severe',
        education_verification_status: 'Suspicious',
        asset_growth_percent: 650,
        party_switch_count: 4,
        mplads_utilisation_percent: 15,
      })
      expect(result.score).toBeLessThan(3.0)
    })
  })
})
