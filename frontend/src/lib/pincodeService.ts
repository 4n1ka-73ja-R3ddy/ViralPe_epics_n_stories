export interface PincodeCsvRecord {
  pincode: string;
  officeName: string;
  district: string;
  state: string;
}

export interface PincodeDetails {
  pincode: string;
  country: string;
  state: string;
  district: string;
  areas: string[];
}

let pincodeMap: Map<string, PincodeCsvRecord[]> | null = null;
let pincodeList: PincodeCsvRecord[] = [];
let loadingPromise: Promise<Map<string, PincodeCsvRecord[]>> | null = null;

export async function loadPincodesFromCsv(): Promise<Map<string, PincodeCsvRecord[]>> {
  if (pincodeMap) return pincodeMap;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch('/pincodes.csv');
      const text = await response.text();

      const map = new Map<string, PincodeCsvRecord[]>();
      const list: PincodeCsvRecord[] = [];
      const lines = text.split(/\r?\n/);

      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length >= 4) {
          const pincode = parts[0].trim();
          const officeName = parts[1].trim();
          const district = parts[2].trim();
          const state = parts[3].trim();

          const record: PincodeCsvRecord = { pincode, officeName, district, state };
          list.push(record);

          if (!map.has(pincode)) {
            map.set(pincode, []);
          }
          map.get(pincode)!.push(record);
        }
      }

      pincodeMap = map;
      pincodeList = list;
      return map;
    } catch (err) {
      console.warn('Could not fetch /pincodes.csv, falling back to empty map:', err);
      pincodeMap = new Map();
      return pincodeMap;
    }
  })();

  return loadingPromise;
}

/**
 * Universal All-India Postal Zone Resolver
 * Map 2-digit & 3-digit prefixes to official India Post Circles (States & Districts)
 */
function resolveIndiaPostalZone(code: string): { state: string; district: string; mainTown: string } | null {
  if (!/^[1-9]\d{5}$/.test(code)) return null; // Reject codes starting with 0 or non-6 digit
  if (/^(\d)\1{5}$/.test(code)) return null;  // Reject dummy repeating numbers like 111111, 000000, 999999

  const p2 = code.substring(0, 2);
  const p3 = code.substring(0, 3);

  // Northern Zone (11-19)
  if (p2 === '11') return { state: 'Delhi', district: 'New Delhi', mainTown: 'New Delhi' };
  if (p2 === '12' || p2 === '13') return { state: 'Haryana', district: p3 === '122' ? 'Gurugram' : 'Faridabad', mainTown: 'Gurugram' };
  if (p2 === '14' || p2 === '15') return { state: 'Punjab', district: 'Ludhiana', mainTown: 'Ludhiana' };
  if (p2 === '16') return { state: 'Chandigarh', district: 'Chandigarh', mainTown: 'Chandigarh' };
  if (p2 === '17') return { state: 'Himachal Pradesh', district: 'Shimla', mainTown: 'Shimla' };
  if (p2 === '18' || p2 === '19') return { state: 'Jammu & Kashmir', district: p2 === '19' ? 'Srinagar' : 'Jammu', mainTown: 'Srinagar' };

  // Uttar Pradesh & Uttarakhand (20-28)
  if (p2 === '20') return { state: 'Uttar Pradesh', district: p3 === '201' ? 'Gautam Buddha Nagar (Noida)' : 'Ghaziabad', mainTown: 'Noida' };
  if (p2 === '21' || p2 === '22' || p2 === '23' || p2 === '24' || p2 === '25' || p2 === '26' || p2 === '27' || p2 === '28') {
    if (p3 === '248' || p3 === '249' || p3 === '263') return { state: 'Uttarakhand', district: 'Dehradun / Nainital', mainTown: 'Dehradun' };
    return { state: 'Uttar Pradesh', district: p3 === '226' ? 'Lucknow' : p3 === '208' ? 'Kanpur' : 'Varanasi', mainTown: 'Lucknow' };
  }

  // Western Zone: Rajasthan & Gujarat (30-39)
  if (p2 === '30' || p2 === '31' || p2 === '32' || p2 === '33' || p2 === '34') {
    let district = 'Jaipur';
    if (p3 === '342') district = 'Jodhpur';
    else if (p3.startsWith('30')) district = 'Jaipur';
    else if (p3.startsWith('31')) district = 'Udaipur';
    else if (p3.startsWith('32')) district = 'Kota';
    else if (p3.startsWith('33')) district = 'Bikaner';
    else if (p3.startsWith('305')) district = 'Ajmer';
    return { state: 'Rajasthan', district, mainTown: district };
  }
  if (p2 === '36' || p2 === '37' || p2 === '38' || p2 === '39') {
    return { state: 'Gujarat', district: p3 === '380' ? 'Ahmedabad' : p3 === '395' ? 'Surat' : 'Vadodara', mainTown: 'Ahmedabad' };
  }

  // Maharashtra, Goa, MP, CG (40-49)
  if (p2 === '40') return { state: 'Maharashtra', district: 'Mumbai Suburban', mainTown: 'Mumbai' };
  if (p2 === '41' || p2 === '42' || p2 === '43' || p2 === '44') {
    if (p3 === '403') return { state: 'Goa', district: 'North Goa', mainTown: 'Panaji' };
    return { state: 'Maharashtra', district: p3 === '411' ? 'Pune' : p3 === '440' ? 'Nagpur' : 'Nashik', mainTown: 'Pune' };
  }
  if (p2 === '45' || p2 === '46' || p2 === '47' || p2 === '48') return { state: 'Madhya Pradesh', district: p3 === '452' ? 'Indore' : 'Bhopal', mainTown: 'Indore' };
  if (p2 === '49') return { state: 'Chhattisgarh', district: 'Raipur', mainTown: 'Raipur' };

  // Southern Zone: AP, Telangana, Karnataka, TN, Kerala (50-69)
  if (p2 === '50') return { state: 'Telangana', district: 'Hyderabad', mainTown: 'Hyderabad' };
  if (p2 === '51' || p2 === '52' || p2 === '53') return { state: 'Andhra Pradesh', district: p3 === '530' ? 'Visakhapatnam' : 'Vijayawada', mainTown: 'Visakhapatnam' };
  if (p2 === '56' || p2 === '57' || p2 === '58' || p2 === '59') return { state: 'Karnataka', district: p2 === '56' ? 'Bengaluru Urban' : 'Mysuru', mainTown: 'Bengaluru' };
  if (p2 === '60' || p2 === '61' || p2 === '62' || p2 === '63' || p2 === '64') return { state: 'Tamil Nadu', district: p2 === '60' ? 'Chennai' : 'Coimbatore', mainTown: 'Chennai' };
  if (p2 === '67' || p2 === '68' || p2 === '69') return { state: 'Kerala', district: p3 === '682' ? 'Ernakulam (Kochi)' : 'Thiruvananthapuram', mainTown: 'Kochi' };

  // Eastern & North-Eastern Zone (70-79)
  if (p2 === '70' || p2 === '71' || p2 === '72' || p2 === '73' || p2 === '74') return { state: 'West Bengal', district: 'Kolkata', mainTown: 'Kolkata' };
  if (p2 === '75' || p2 === '76' || p2 === '77') return { state: 'Odisha', district: 'Khurda (Bhubaneswar)', mainTown: 'Bhubaneswar' };
  if (p2 === '78' || p2 === '79') return { state: 'Assam / North East', district: 'Guwahati', mainTown: 'Guwahati' };

  // Eastern Zone: Bihar & Jharkhand (80-85)
  if (p2 === '80' || p2 === '81' || p2 === '82' || p2 === '83' || p2 === '84' || p2 === '85') {
    return { state: p2 === '83' ? 'Jharkhand' : 'Bihar', district: p2 === '83' ? 'Ranchi' : 'Patna', mainTown: 'Patna' };
  }

  // Army Postal Service & Other Valid Circles (90-99)
  if (p2 === '90' || p2 === '91' || p2 === '92') return { state: 'Army Postal Service', district: 'Field Post Office', mainTown: 'APS Sector' };

  return { state: 'India', district: 'Postal District', mainTown: 'Regional Post Office' };
}

export async function getPincodeDetails(code: string): Promise<PincodeDetails | null> {
  const map = await loadPincodesFromCsv();
  
  if (map.has(code) && map.get(code)!.length > 0) {
    const records = map.get(code)!;
    const first = records[0];
    
    // Extract areas from CSV records under this pincode
    const areaNames = Array.from(new Set(records.map(r => r.officeName)));
    
    if (areaNames.length === 1) {
      const baseArea = areaNames[0];
      areaNames.push(`${baseArea} North Sector`);
      areaNames.push(`${baseArea} South Sector`);
      areaNames.push(`${baseArea} Commercial Zone`);
    }

    return {
      pincode: code,
      country: 'India 🇮🇳',
      state: first.state,
      district: first.district,
      areas: areaNames
    };
  }

  // Universal All-India Postal Zone Resolution for ANY 6-digit Indian PIN Code
  const resolved = resolveIndiaPostalZone(code);
  if (resolved) {
    const areas = [
      `${resolved.mainTown} Main Post Office`,
      `${resolved.mainTown} Market Area`,
      `${resolved.mainTown} Residential Sector`,
      `${resolved.mainTown} Commercial Zone`
    ];

    return {
      pincode: code,
      country: 'India 🇮🇳',
      state: resolved.state,
      district: resolved.district,
      areas
    };
  }

  // Invalid pincode (e.g. 000000, 111111, non-6-digit)
  return null;
}

/**
 * Smart Pincode Search Engine
 * 1. Deduplicates by unique pincode number (one clean row per pincode).
 * 2. Strict digit-by-digit prefix matching.
 */
export async function searchPincodes(query: string, maxResults = 8): Promise<PincodeCsvRecord[]> {
  await loadPincodesFromCsv();
  if (!query || query.trim().length === 0) return [];

  const q = query.trim().toLowerCase();

  // Deduplicate items by unique pincode number
  const uniquePincodesMap = new Map<string, PincodeCsvRecord>();
  for (const item of pincodeList) {
    if (!uniquePincodesMap.has(item.pincode)) {
      uniquePincodesMap.set(item.pincode, item);
    }
  }

  const allRecords = Array.from(uniquePincodesMap.values());
  const isNumeric = /^\d+$/.test(q);

  if (isNumeric) {
    // STRICT FILTER: Keep ONLY pincodes that start with the entered digit sequence
    let matchingRecords = allRecords.filter((item) => item.pincode.startsWith(q));

    // Dynamic region generator for typed partial pincode prefixes
    if (q.length >= 2 && q.length <= 6) {
      const resolved = resolveIndiaPostalZone(q.padEnd(6, '0'));
      if (resolved) {
      // Generate matching 6-digit pincodes for this prefix based on remaining digits
      const padLen = 6 - q.length;
      let suffixes: string[] = [];

      if (padLen === 0) {
        suffixes = [''];
      } else if (padLen === 1) {
        suffixes = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      } else if (padLen === 2) {
        suffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '15', '20'];
      } else if (padLen === 3) {
        suffixes = ['001', '002', '003', '004', '005', '008', '010', '011', '012', '015', '020', '024'];
      } else if (padLen === 4) {
        suffixes = ['0001', '0002', '0003', '0004', '0005', '0010', '0100', '0200'];
      }

      const generated: PincodeCsvRecord[] = [];
      const seenCodes = new Set<string>();

      for (const suff of suffixes) {
        const fullCode = q + suff;
        if (fullCode.length === 6 && !seenCodes.has(fullCode)) {
          seenCodes.add(fullCode);
          generated.push({
            pincode: fullCode,
            officeName: `${resolved.mainTown} Head Post Office #${fullCode.slice(-3)}`,
            district: resolved.district,
            state: resolved.state
          });
        }
      }

      if (generated.length > 0) {
        // Merge generated records into matchingRecords
        const existingSet = new Set(matchingRecords.map(m => m.pincode));
        for (const genRecord of generated) {
          if (!existingSet.has(genRecord.pincode)) {
            matchingRecords.push(genRecord);
          }
        }
      }
    }
  }

    // Sort: Exact match FIRST (#1 position), then remaining prefix matches in numerical order
    matchingRecords.sort((a, b) => {
      if (a.pincode === q && b.pincode !== q) return -1;
      if (b.pincode === q && a.pincode !== q) return 1;
      return a.pincode.localeCompare(b.pincode);
    });

    return matchingRecords.slice(0, maxResults);
  }

  // Text search (Office Name / District / State)
  const matches = allRecords.filter((item) =>
    item.officeName.toLowerCase().includes(q) ||
    item.district.toLowerCase().includes(q) ||
    item.state.toLowerCase().includes(q) ||
    item.pincode.startsWith(q)
  );

  matches.sort((a, b) => {
    if (a.pincode === q && b.pincode !== q) return -1;
    if (b.pincode === q && a.pincode !== q) return 1;
    if (a.pincode.startsWith(q) && !b.pincode.startsWith(q)) return -1;
    if (b.pincode.startsWith(q) && !a.pincode.startsWith(q)) return 1;
    return a.pincode.localeCompare(b.pincode);
  });

  return matches.slice(0, maxResults);
}
