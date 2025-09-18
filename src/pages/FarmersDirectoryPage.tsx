import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

type Farmer = {
  id: string
  name: string
  barangay: string
  municipality: string
  province: string
  region: string
  products: string[]
  verified: boolean
}

const BARANGAYS_DOLORES_EASTERN_SAMAR = [
  'Aroganga',
  'Bonghon',
  'Buenavista',
  'Cabago-an',
  'Caglao-an',
  'Cagtabon',
  'Dampigan',
  'Dapdap',
  'Del Pilar',
  'Denigpian',
  'Gap-ang',
  'Japitan',
  'Jicontol',
  'Hilabaan',
  'Hinolaso',
  'Libertad',
  'Magongbong',
  'Magsaysay',
  'Malaintos',
  'Malobago',
  'Osmeña',
  'Barangay 1 (Poblacion)',
  'Barangay 2 (Poblacion)',
  'Barangay 3 (Poblacion)',
  'Barangay 4 (Poblacion)',
  'Barangay 5 (Poblacion)',
  'Barangay 6 (Poblacion)',
  'Barangay 7 (Poblacion)',
  'Barangay 8 (Poblacion)',
  'Barangay 9 (Poblacion)',
  'Barangay 10 (Poblacion)',
  'Barangay 11 (Poblacion)',
  'Barangay 12 (Poblacion)',
  'Barangay 13 (Poblacion)',
  'Barangay 14 (Poblacion)',
  'Barangay 15 (Poblacion)',
  'Rizal',
  'San Isidro (Malabag)',
  'San Pascual',
  'San Roque',
  'San Vicente',
  'Santa Cruz',
  'Santo Niño',
  'Tanauan',
  'Villahermosa',
  'Tikling',
] as const

const FIRST_NAMES = [
  'Juan', 'Jose', 'Pedro', 'Ramon', 'Roberto', 'Antonio', 'Mario', 'Nestor', 'Arnel', 'Rogelio',
  'Maria', 'Ana', 'Rosa', 'Luz', 'Carmen', 'Elena', 'Gloria', 'Nora', 'Teresita', 'Lourdes'
]

const LAST_NAMES = [
  'Dela Cruz', 'Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Romero', 'Ramos', 'Rivera', 'Flores',
  'Gonzales', 'Aquino', 'Domingo', 'Ferrer', 'Suarez', 'Rosales', 'Marquez', 'Navarro', 'Torres', 'Valdez'
]

const PRODUCTS = ['Rice', 'Corn', 'Coconut', 'Vegetables', 'Root crops', 'Banana', 'Abaca', 'Copra', 'Fish', 'Poultry']

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[], count: number): T[] {
  const copy = [...arr]
  const picked: T[] = []
  for (let i = 0; i < count && copy.length; i++) {
    const idx = randomInt(0, copy.length - 1)
    picked.push(copy[idx])
    copy.splice(idx, 1)
  }
  return picked
}

// Generate up to 10 producers per barangay for Dolores, Eastern Samar
const GENERATED_DOLORES_FARMERS: Farmer[] = BARANGAYS_DOLORES_EASTERN_SAMAR.flatMap((barangay, bIndex) => {
  const num = randomInt(6, 10)
  return Array.from({ length: num }).map((_, i) => {
    const first = FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)]
    const last = LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)]
    const name = `${first} ${last}`
    const products = pick(PRODUCTS, randomInt(1, 3))
    const verified = Math.random() < 0.6
    return {
      id: `dol-${bIndex}-${i}`,
      name,
      barangay,
      municipality: 'Dolores',
      province: 'Eastern Samar',
      region: 'Region VIII',
      products,
      verified,
    } as Farmer
  })
})

const MOCK_FARMERS: Farmer[] = [
  ...GENERATED_DOLORES_FARMERS,
]

export default function FarmersDirectoryPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('')
  const [province, setProvince] = useState('')
  const [municipality, setMunicipality] = useState('')
  const [barangay, setBarangay] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState('all') // 'all' | 'verified' | 'unverified'

  const results = useMemo(() => {
    return MOCK_FARMERS.filter(f => {
      if (verifiedOnly === 'verified' && !f.verified) return false
      if (verifiedOnly === 'unverified' && f.verified) return false
      if (region && f.region !== region) return false
      if (province && f.province !== province) return false
      if (municipality && f.municipality !== municipality) return false
      if (barangay && f.barangay !== barangay) return false
      if (query) {
        const q = query.toLowerCase()
        const hay = [
          f.name,
          f.barangay,
          f.municipality,
          f.province,
          f.region,
          ...f.products,
        ]
          .join(' ')
          .toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [query, region, province, municipality, barangay, verifiedOnly])

  const unique = (list: string[]) => Array.from(new Set(list)).sort()
  const regions = unique(MOCK_FARMERS.map(f => f.region))
  const provinces = unique(MOCK_FARMERS.filter(f => (region ? f.region === region : true)).map(f => f.province))
  const municipalities = unique(
    MOCK_FARMERS.filter(f => (region ? f.region === region : true) && (province ? f.province === province : true)).map(f => f.municipality)
  )
  const barangays = unique(
    MOCK_FARMERS.filter(
      f => (region ? f.region === region : true) && (province ? f.province === province : true) && (municipality ? f.municipality === municipality : true)
    ).map(f => f.barangay)
  )

  return (
    <div className="max-w-5xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Farmers Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Search name, location, product" value={query} onChange={e => setQuery(e.target.value)} />
            <Select value={verifiedOnly} onValueChange={setVerifiedOnly}>
              <SelectTrigger>
                <SelectValue placeholder="Verified status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="verified">Verified only</SelectItem>
                <SelectItem value="unverified">Unverified only</SelectItem>
              </SelectContent>
            </Select>
            <div />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Select value={region} onValueChange={v => { setRegion(v); setProvince(''); setMunicipality(''); setBarangay('') }}>
              <SelectTrigger>
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={province} onValueChange={v => { setProvince(v); setMunicipality(''); setBarangay('') }} disabled={!region}>
              <SelectTrigger>
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={municipality} onValueChange={v => { setMunicipality(v); setBarangay('') }} disabled={!province}>
              <SelectTrigger>
                <SelectValue placeholder="Municipality" />
              </SelectTrigger>
              <SelectContent>
                {municipalities.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={barangay} onValueChange={setBarangay} disabled={!municipality}>
              <SelectTrigger>
                <SelectValue placeholder="Barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {results.map(f => (
              <div key={f.id} className="border rounded-md p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">{f.name}</div>
                  <div className="text-sm text-muted-foreground">{f.barangay}, {f.municipality}, {f.province} • {f.region}</div>
                  <div className="mt-1 flex gap-2 flex-wrap">
                    {f.products.map(p => (
                      <Badge key={p} variant="secondary">{p}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  {f.verified ? (
                    <Badge className="bg-green-600 text-white">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </div>
              </div>
            ))}
            {results.length === 0 && (
              <div className="text-sm text-muted-foreground">No farmers match your filters.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



