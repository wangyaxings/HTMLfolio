#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 验证Angular 19升级...\n');

// 检查package.json中的版本
function checkPackageVersions() {
  console.log('📦 检查依赖版本...');

  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const expectedVersions = {
    '@angular/core': '^19.0.0',
    '@angular/common': '^19.0.0',
    '@angular/router': '^19.0.0',
    'primeng': '^19.0.0',
    'typescript': '~5.6.0'
  };

  let allCorrect = true;

  Object.entries(expectedVersions).forEach(([pkg, expectedVersion]) => {
    const actualVersion = packageJson.dependencies[pkg] || packageJson.devDependencies[pkg];
    if (actualVersion === expectedVersion) {
      console.log(`  ✅ ${pkg}: ${actualVersion}`);
    } else {
      console.log(`  ❌ ${pkg}: 期望 ${expectedVersion}, 实际 ${actualVersion || '未找到'}`);
      allCorrect = false;
    }
  });

  return allCorrect;
}

// 检查文件结构
function checkFileStructure() {
  console.log('\n📁 检查文件结构...');

  const requiredFiles = [
    'src/main.ts',
    'src/app/app.component.ts',
    'src/app/app.routes.ts',
    'src/app/components/home/home.component.ts',
    'src/app/components/html-viewer/html-viewer.component.ts'
  ];

  const shouldNotExist = [
    'src/app/app.module.ts',
    'src/app/app-routing.module.ts'
  ];

  let allCorrect = true;

  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
      console.log(`  ✅ ${file} 存在`);
    } else {
      console.log(`  ❌ ${file} 不存在`);
      allCorrect = false;
    }
  });

  shouldNotExist.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
      console.log(`  ✅ ${file} 已删除`);
    } else {
      console.log(`  ❌ ${file} 仍然存在（应该删除）`);
      allCorrect = false;
    }
  });

  return allCorrect;
}

// 检查main.ts配置
function checkMainTsConfig() {
  console.log('\n⚙️ 检查main.ts配置...');

  const mainTsPath = path.join(__dirname, 'src/main.ts');
  const mainTsContent = fs.readFileSync(mainTsPath, 'utf8');

  const requiredImports = [
    'bootstrapApplication',
    'provideAnimationsAsync',
    'provideRouter',
    'provideHttpClient',
    'providePrimeNG'
  ];

  let allCorrect = true;

  requiredImports.forEach(importName => {
    if (mainTsContent.includes(importName)) {
      console.log(`  ✅ ${importName} 已导入`);
    } else {
      console.log(`  ❌ ${importName} 未导入`);
      allCorrect = false;
    }
  });

  return allCorrect;
}

// 检查组件是否为standalone
function checkStandaloneComponents() {
  console.log('\n🔧 检查Standalone组件...');

  const components = [
    'src/app/app.component.ts',
    'src/app/components/home/home.component.ts',
    'src/app/components/html-viewer/html-viewer.component.ts'
  ];

  let allCorrect = true;

  components.forEach(componentPath => {
    const fullPath = path.join(__dirname, componentPath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('standalone: true')) {
        console.log(`  ✅ ${componentPath} 是standalone组件`);
      } else {
        console.log(`  ❌ ${componentPath} 不是standalone组件`);
        allCorrect = false;
      }
    }
  });

  return allCorrect;
}

// 运行所有检查
function runAllChecks() {
  const checks = [
    checkPackageVersions,
    checkFileStructure,
    checkMainTsConfig,
    checkStandaloneComponents
  ];

  const results = checks.map(check => check());
  const allPassed = results.every(result => result);

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('🎉 升级验证通过！所有检查都成功。');
    console.log('\n下一步：');
    console.log('  1. 运行 yarn build 构建项目');
    console.log('  2. 运行 yarn start 启动开发服务器');
    console.log('  3. 在浏览器中访问 http://localhost:4200');
  } else {
    console.log('❌ 升级验证失败！请检查上述错误。');
    process.exit(1);
  }
}

runAllChecks();