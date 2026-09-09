const fs = require('fs');

const path = 'data/residents.json';
if (fs.existsSync(path)) {
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data.forEach(r => {
    if (r.buildingName && r.buildingName.toLowerCase().includes('majestic')) {
      r.buildingName = 'Majestic 14 (Oran)';
    }
  });
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
  console.log("Updated data/residents.json");
} else {
  console.log("data/residents.json not found");
}

const path2 = 'data/sessions.json';
if (fs.existsSync(path2)) {
  console.log("Found sessions");
}
