#!/bin/bash

echo "🚀 Iniciando testes completos para setZ71..."

echo "📦 Instalando dependências de teste..."
npm install

echo "🧪 Executando testes unitários..."
npm test -- --testPathPattern="set_Z71.test.ts" --verbose

echo "🔗 Executando testes de integração..."
npm test -- --testPathPattern="integration" --verbose

echo "⚡ Executando testes de performance..."
npm test -- --testPathPattern="performance" --verbose

echo "📊 Gerando relatório de cobertura..."
npm run test:coverage

echo "✅ Todos os testes concluídos!"
echo "📈 Verifique o relatório de cobertura em: coverage/lcov-report/index.html"
