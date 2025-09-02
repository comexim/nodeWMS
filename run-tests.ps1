# Script PowerShell para Windows
Write-Host "🚀 Iniciando testes completos para setZ71..." -ForegroundColor Green

Write-Host "📦 Instalando dependências de teste..." -ForegroundColor Yellow
npm install

Write-Host "🧪 Executando testes unitários..." -ForegroundColor Blue
npm test -- --testPathPattern="set_Z71.test.ts" --verbose

Write-Host "🔗 Executando testes de integração..." -ForegroundColor Blue  
npm test -- --testPathPattern="integration" --verbose

Write-Host "⚡ Executando testes de performance..." -ForegroundColor Blue
npm test -- --testPathPattern="performance" --verbose

Write-Host "📊 Gerando relatório de cobertura..." -ForegroundColor Magenta
npm run test:coverage

Write-Host "✅ Todos os testes concluídos!" -ForegroundColor Green
Write-Host "📈 Verifique o relatório de cobertura em: coverage/lcov-report/index.html" -ForegroundColor Cyan
