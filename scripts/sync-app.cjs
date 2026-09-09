const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const target = process.argv[2] === 'manager' ? 'manager' : 'resident';

const isManager = target === 'manager';
const appId = isManager ? 'com.haven.manager' : 'com.haven.resident';
const appName = isManager ? 'Haven Syndic' : 'Haven Résidents';
const configFile = isManager ? 'capacitor.manager.config.ts' : 'capacitor.resident.config.ts';

console.log(`\n========================================`);
console.log(`Preparing Android build for: ${appName}`);
console.log(`Application ID (Package):    ${appId}`);
console.log(`Config file:                 ${configFile}`);
console.log(`========================================\n`);

// 1. Build Vite web bundle with the target environment
console.log(`[1/5] Building web bundle with VITE_APP_TARGET=${target}...`);
execSync(`npx cross-env VITE_APP_TARGET=${target} tsc -b && npx cross-env VITE_APP_TARGET=${target} vite build`, {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, VITE_APP_TARGET: target }
});

// 2. Copy the correct capacitor config
console.log(`[2/5] Applying ${configFile} -> capacitor.config.ts...`);
fs.copyFileSync(path.join(rootDir, configFile), path.join(rootDir, 'capacitor.config.ts'));

// 3. Update android/app/build.gradle with the target's unique applicationId AND namespace
console.log(`[3/5] Updating android/app/build.gradle...`);
const buildGradlePath = path.join(rootDir, 'android', 'app', 'build.gradle');
if (fs.existsSync(buildGradlePath)) {
  let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');
  
  // Update applicationId (determines app identity on the device)
  gradleContent = gradleContent.replace(/applicationId\s+["'][^"']+["']/, `applicationId "${appId}"`);
  
  // Update namespace (determines R class and manifest package)
  gradleContent = gradleContent.replace(/namespace\s*=\s*["'][^"']+["']/, `namespace = "${appId}"`);
  
  fs.writeFileSync(buildGradlePath, gradleContent);
  
  // Verify the changes
  const verify = fs.readFileSync(buildGradlePath, 'utf8');
  const appIdMatch = verify.match(/applicationId\s+["']([^"']+)["']/);
  const nsMatch = verify.match(/namespace\s*=\s*["']([^"']+)["']/);
  console.log(`  -> applicationId: ${appIdMatch ? appIdMatch[1] : 'NOT FOUND'}`);
  console.log(`  -> namespace:     ${nsMatch ? nsMatch[1] : 'NOT FOUND'}`);
} else {
  console.error('ERROR: build.gradle not found at', buildGradlePath);
  process.exit(1);
}

// 4. Update android strings.xml with the target's unique app name & package
console.log(`[4/5] Updating android strings.xml app_name -> ${appName}...`);
const stringsPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml');
if (fs.existsSync(stringsPath)) {
  let stringsContent = fs.readFileSync(stringsPath, 'utf8');
  stringsContent = stringsContent.replace(/<string name="app_name">.*?<\/string>/, `<string name="app_name">${appName}</string>`);
  stringsContent = stringsContent.replace(/<string name="title_activity_main">.*?<\/string>/, `<string name="title_activity_main">${appName}</string>`);
  stringsContent = stringsContent.replace(/<string name="package_name">.*?<\/string>/, `<string name="package_name">${appId}</string>`);
  stringsContent = stringsContent.replace(/<string name="custom_url_scheme">.*?<\/string>/, `<string name="custom_url_scheme">${appId}</string>`);
  fs.writeFileSync(stringsPath, stringsContent);
}

// 5. Run capacitor sync to copy web assets to android
console.log(`[5/5] Running npx cap sync android...`);
execSync('npx cap sync android', {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log(`\n✅ SUCCESS: Android project configured and synced for ${appName} (${appId})!\n`);
