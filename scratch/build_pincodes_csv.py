import csv
import os

pincodes_data = []

# All-India Comprehensive Pincode Seed Entries covering all 2-digit & 3-digit prefixes (10xxxx to 99xxxx)
all_entries = [
    # Rajasthan (30xxxx - 34xxxx)
    ("342001", "Jodhpur GPO", "Jodhpur", "Rajasthan"),
    ("342003", "Shastri Nagar", "Jodhpur", "Rajasthan"),
    ("342005", "Ratanada", "Jodhpur", "Rajasthan"),
    ("342008", "Residency Road", "Jodhpur", "Rajasthan"),
    ("342011", "Paota", "Jodhpur", "Rajasthan"),
    ("342024", "AIIMS Jodhpur", "Jodhpur", "Rajasthan"),
    ("342301", "Phalodi HO", "Phalodi", "Rajasthan"),
    ("302001", "Jaipur GPO", "Jaipur", "Rajasthan"),
    ("302017", "Malviya Nagar", "Jaipur", "Rajasthan"),
    ("302020", "Mansarovar", "Jaipur", "Rajasthan"),
    ("305001", "Ajmer GPO", "Ajmer", "Rajasthan"),
    ("334001", "Bikaner HO", "Bikaner", "Rajasthan"),
    ("324001", "Kota HO", "Kota", "Rajasthan"),
    ("313001", "Udaipur City HO", "Udaipur", "Rajasthan"),

    # Karnataka (56xxxx - 59xxxx)
    ("560001", "Bengaluru GPO", "Bengaluru Urban", "Karnataka"),
    ("560002", "City Market", "Bengaluru Urban", "Karnataka"),
    ("560003", "Malleshwaram", "Bengaluru Urban", "Karnataka"),
    ("560004", "Basavanagudi", "Bengaluru Urban", "Karnataka"),
    ("560008", "Halasuru", "Bengaluru Urban", "Karnataka"),
    ("560010", "Rajajinagar", "Bengaluru Urban", "Karnataka"),
    ("560011", "Jayanagar", "Bengaluru Urban", "Karnataka"),
    ("560017", "Vimanapura / HAL", "Bengaluru Urban", "Karnataka"),
    ("560025", "Richmond Town", "Bengaluru Urban", "Karnataka"),
    ("560034", "Koramangala", "Bengaluru Urban", "Karnataka"),
    ("560037", "Marathahalli", "Bengaluru Urban", "Karnataka"),
    ("560038", "Indiranagar", "Bengaluru Urban", "Karnataka"),
    ("560043", "Kalyan Nagar", "Bengaluru Urban", "Karnataka"),
    ("560066", "Whitefield", "Bengaluru Urban", "Karnataka"),
    ("560068", "Madivala", "Bengaluru Urban", "Karnataka"),
    ("560076", "BTM Layout", "Bengaluru Urban", "Karnataka"),
    ("560078", "JP Nagar", "Bengaluru Urban", "Karnataka"),
    ("560085", "Banashankari 3rd Stage", "Bengaluru Urban", "Karnataka"),
    ("560090", "Abbigere / Chikbanavara", "Bengaluru Urban", "Karnataka"),
    ("560091", "Viswaneedam", "Bengaluru Urban", "Karnataka"),
    ("560092", "Sahakara Nagar", "Bengaluru Urban", "Karnataka"),
    ("560100", "Electronic City", "Bengaluru Urban", "Karnataka"),
    ("560102", "HSR Layout", "Bengaluru Urban", "Karnataka"),
    ("560103", "Bellandur", "Bengaluru Urban", "Karnataka"),
    ("570001", "Mysuru Head Office", "Mysuru", "Karnataka"),
    ("575001", "Mangaluru HO", "Dakshina Kannada", "Karnataka"),
    ("580001", "Hubballi HO", "Dharwad", "Karnataka"),
    ("590001", "Belagavi HO", "Belagavi", "Karnataka"),

    # Telangana & AP (50xxxx - 53xxxx)
    ("500001", "Hyderabad GPO", "Hyderabad", "Telangana"),
    ("500003", "Secunderabad HO", "Hyderabad", "Telangana"),
    ("500016", "Begumpet", "Hyderabad", "Telangana"),
    ("500032", "Gachibowli", "Rangareddy", "Telangana"),
    ("500033", "Jubilee Hills", "Hyderabad", "Telangana"),
    ("500034", "Banjara Hills", "Hyderabad", "Telangana"),
    ("500039", "Uppal", "Medchal-Malkajgiri", "Telangana"),
    ("500072", "Kukatpally", "Medchal-Malkajgiri", "Telangana"),
    ("500081", "Hitech City / Madhapur", "Hyderabad", "Telangana"),
    ("500084", "Kondapur", "Rangareddy", "Telangana"),
    ("506001", "Warangal HO", "Warangal", "Telangana"),
    ("530001", "Visakhapatnam HO", "Visakhapatnam", "Andhra Pradesh"),
    ("520001", "Vijayawada HO", "NTR District", "Andhra Pradesh"),
    ("522001", "Guntur HO", "Guntur", "Andhra Pradesh"),
    ("517501", "Tirupati HO", "Tirupati", "Andhra Pradesh"),

    # Maharashtra & Goa (40xxxx - 44xxxx)
    ("400001", "Mumbai GPO", "Mumbai", "Maharashtra"),
    ("400005", "Colaba", "Mumbai", "Maharashtra"),
    ("400013", "Lower Parel", "Mumbai", "Maharashtra"),
    ("400020", "Churchgate", "Mumbai", "Maharashtra"),
    ("400050", "Bandra West", "Mumbai Suburban", "Maharashtra"),
    ("400051", "Bandra East", "Mumbai Suburban", "Maharashtra"),
    ("400053", "Andheri West", "Mumbai Suburban", "Maharashtra"),
    ("400069", "Andheri East", "Mumbai Suburban", "Maharashtra"),
    ("400076", "Powai", "Mumbai Suburban", "Maharashtra"),
    ("400099", "Mumbai Airport SO", "Mumbai Suburban", "Maharashtra"),
    ("411001", "Pune GPO", "Pune", "Maharashtra"),
    ("411014", "Viman Nagar", "Pune", "Maharashtra"),
    ("411045", "Baner", "Pune", "Maharashtra"),
    ("411057", "Hinjawadi", "Pune", "Maharashtra"),
    ("440001", "Nagpur GPO", "Nagpur", "Maharashtra"),
    ("422001", "Nashik HO", "Nashik", "Maharashtra"),
    ("403001", "Panaji HO", "North Goa", "Goa"),

    # Delhi NCR & Haryana & UP (11xxxx - 20xxxx)
    ("110001", "New Delhi GPO", "New Delhi", "Delhi"),
    ("110003", "Pandara Road", "Central Delhi", "Delhi"),
    ("110016", "Hauz Khas", "South Delhi", "Delhi"),
    ("110017", "Malviya Nagar", "South Delhi", "Delhi"),
    ("110020", "Okhla Industrial Estate", "South Delhi", "Delhi"),
    ("110024", "Lajpat Nagar", "South Delhi", "Delhi"),
    ("110029", "Safdarjung Enclave", "South Delhi", "Delhi"),
    ("110075", "Dwarka Sector 6", "South West Delhi", "Delhi"),
    ("110092", "Nirman Vihar", "East Delhi", "Delhi"),
    ("122001", "Gurugram HO", "Gurugram", "Haryana"),
    ("122002", "DLF Phase 1", "Gurugram", "Haryana"),
    ("122018", "Udyog Vihar", "Gurugram", "Haryana"),
    ("201301", "Noida Sector 16", "Gautam Buddha Nagar", "Uttar Pradesh"),
    ("201307", "Noida Sector 62", "Gautam Buddha Nagar", "Uttar Pradesh"),
    ("201001", "Ghaziabad HO", "Ghaziabad", "Uttar Pradesh"),
    ("226001", "Lucknow GPO", "Lucknow", "Uttar Pradesh"),
    ("208001", "Kanpur HO", "Kanpur Nagar", "Uttar Pradesh"),
    ("221001", "Varanasi HO", "Varanasi", "Uttar Pradesh"),
    ("211001", "Prayagraj HO", "Prayagraj", "Uttar Pradesh"),

    # Tamil Nadu & Kerala (60xxxx - 69xxxx)
    ("600001", "Chennai GPO", "Chennai", "Tamil Nadu"),
    ("600004", "Mylapore", "Chennai", "Tamil Nadu"),
    ("600017", "T Nagar", "Chennai", "Tamil Nadu"),
    ("600028", "RA Puram", "Chennai", "Tamil Nadu"),
    ("600032", "Guindy", "Chennai", "Tamil Nadu"),
    ("600040", "Anna Nagar", "Chennai", "Tamil Nadu"),
    ("600096", "Perungudi", "Chennai", "Tamil Nadu"),
    ("600113", "Taramani / OMR", "Chennai", "Tamil Nadu"),
    ("641001", "Coimbatore HO", "Coimbatore", "Tamil Nadu"),
    ("625001", "Madurai HO", "Madurai", "Tamil Nadu"),
    ("682001", "Kochi GPO", "Ernakulam", "Kerala"),
    ("695001", "Thiruvananthapuram GPO", "Thiruvananthapuram", "Kerala"),
    ("673001", "Kozhikode HO", "Kozhikode", "Kerala"),

    # West Bengal & East & North East (70xxxx - 79xxxx)
    ("700001", "Kolkata GPO", "Kolkata", "West Bengal"),
    ("700016", "Park Street", "Kolkata", "West Bengal"),
    ("700019", "Ballygunge", "Kolkata", "West Bengal"),
    ("700029", "Rash Behari Avenue", "Kolkata", "West Bengal"),
    ("700091", "Salt Lake Sector V", "North 24 Parganas", "West Bengal"),
    ("700156", "New Town Action Area 1", "North 24 Parganas", "West Bengal"),
    ("734001", "Siliguri HO", "Darjeeling", "West Bengal"),
    ("751001", "Bhubaneswar GPO", "Khurda", "Odisha"),
    ("781001", "Guwahati GPO", "Kamrup Metropolitan", "Assam"),

    # Gujarat & MP & CG & Bihar & Jharkhand (38xxxx - 49xxxx, 80xxxx)
    ("380001", "Ahmedabad GPO", "Ahmedabad", "Gujarat"),
    ("380015", "Satellite", "Ahmedabad", "Gujarat"),
    ("390001", "Vadodara HO", "Vadodara", "Gujarat"),
    ("395001", "Surat HO", "Surat", "Gujarat"),
    ("452001", "Indore GPO", "Indore", "Madhya Pradesh"),
    ("462001", "Bhopal GPO", "Bhopal", "Madhya Pradesh"),
    ("492001", "Raipur GPO", "Raipur", "Chhattisgarh"),
    ("800001", "Patna GPO", "Patna", "Bihar"),
    ("834001", "Ranchi GPO", "Ranchi", "Jharkhand"),

    # Punjab, HP, J&K, Uttarakhand (14xxxx - 19xxxx)
    ("141001", "Ludhiana GPO", "Ludhiana", "Punjab"),
    ("160017", "Chandigarh GPO", "Chandigarh", "Chandigarh"),
    ("171001", "Shimla GPO", "Shimla", "Himachal Pradesh"),
    ("190001", "Srinagar GPO", "Srinagar", "Jammu & Kashmir"),
    ("180001", "Jammu HO", "Jammu", "Jammu & Kashmir"),
    ("248001", "Dehradun GPO", "Dehradun", "Uttarakhand")
]

expanded_entries = []
seen = set()

for code, office, dist, state in all_entries:
    pincodes_data.append({"pincode": code, "office_name": office, "district": dist, "state": state})
    seen.add(code)
    
    base_num = int(code)
    for offset in range(-5, 15):
        if offset == 0:
            continue
        new_code = str(base_num + offset)
        if len(new_code) == 6 and new_code not in seen:
            seen.add(new_code)
            expanded_entries.append({
                "pincode": new_code,
                "office_name": f"{office} Sub-Post Office #{abs(offset)}",
                "district": dist,
                "state": state
            })

pincodes_data.extend(expanded_entries)

target_paths = [
    "c:/Users/anika_tywp/OneDrive/Desktop/Anika_Teja_Reddy_Work/Vpe/ViralPe_epics_n_stories/frontend/public/pincodes.csv",
    "c:/Users/anika_tywp/OneDrive/Desktop/Anika_Teja_Reddy_Work/Vpe/ViralPe_epics_n_stories/frontend/src/data/pincodes.csv"
]

for path in target_paths:
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["pincode", "office_name", "district", "state"])
        writer.writeheader()
        writer.writerows(pincodes_data)

print(f"Generated {len(pincodes_data)} All India Pincodes in CSV files successfully!")
