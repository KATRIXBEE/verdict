import urllib.request
import json

res = urllib.request.urlopen("http://localhost:3000/api/politicians?limit=10")
data = json.loads(res.read().decode('utf-8'))
print("API Total politicians:", data.get("total"))
for p in data.get("data", []):
    name = p.get("fullName", "")
    score = p.get("calculatedVerdictScore")
    band = p.get("scoreBand")
    att = p.get("attendancePercentage")
    cases = p.get("criminalCaseCount")
    switches = p.get("partySwitchCount")
    mplads = p.get("mpladsUtilisationPercent")
    print(f" - {name:<30} | Score: {score} | Band: {band:<9} | Att: {str(att):>5}% | Cases: {str(cases):>2} | Switches: {str(switches):>2} | MPLADS: {str(mplads):>5}%")
