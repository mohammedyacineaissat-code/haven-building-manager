const fs = require('fs');

const path = 'data/residents.json';
if (fs.existsSync(path)) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.forEach(r => {
    if (r.buildingName.includes('Majestic')) {
      r.buildingName = 'Majestic 14 (Oran)';
    }
  });
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log("Updated data/residents.json");
} else {
  console.log("data/residents.json not found");
}
