# Docker Build Fix Guide

## Problema Resolvido

O erro `npm error notarget` ocorria porque:
1. Dependências desnecessárias estavam listadas no package.json
2. O Dockerfile usava `npm ci --only=production` que é deprecated
3. Faltava configuração .npmrc para compatibilidade

## Soluções Aplicadas

### 1. Removidas Dependências Desnecessárias

**Antes:**
```json
{
  "dependencies": {
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "redis": "^4.6.0",
    "joi": "^17.11.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.1.2"
  }
}
```

**Depois:**
- Removidas dependências de futuro (database, cache, validation)
- Mantidas apenas as necessárias para MVP

### 2. Dockerfile Multi-Stage

```dockerfile
# Estágio 1: Build
FROM node:18-alpine as builder
- Instala todas as dependências
- Compila TypeScript

# Estágio 2: Production
FROM node:18-alpine
- Copia apenas dependências de produção
- Copia o build compilado
- Imagem final menor e mais rápida
```

### 3. Configuração .npmrc

```ini
legacy-peer-deps=true
omit=dev
```

## Como Testar

### Local
```bash
# Build local
npm install
npm run build
npm start
```

### Docker
```bash
# Build imagem
docker build -t tiktok-v2:latest .

# Rodar container
docker run -p 3000:3000 \
  -e TIKTOK_CLIENT_KEY=your_key \
  -e TIKTOK_CLIENT_SECRET=your_secret \
  -e TIKTOK_REDIRECT_URI=http://localhost:3000/api/v1/auth/callback \
  tiktok-v2:latest

# Testar health check
curl http://localhost:3000/health
```

### Docker Compose
```bash
docker-compose up --build
```

## Dependencies Atualizadas

### Production Only
- express@^4.18.2 - Web framework
- axios@^1.6.0 - HTTP client
- dotenv@^16.3.1 - Environment variables
- cors@^2.8.5 - CORS handling
- cookie-parser@^1.4.6 - Cookie parsing
- express-session@^1.17.3 - Session management
- multer@^1.4.5-lts.1 - File upload
- body-parser@^1.20.2 - Body parsing
- winston@^3.11.0 - Logging
- helmet@^7.1.0 - Security headers

### Para Futuro
Quando implementar banco de dados, cache, validação, segurança:
```bash
npm install prisma @prisma/client redis joi bcrypt jsonwebtoken
```

## Tamanho da Imagem

- **Antes**: ~800MB (com todas as dependências)
- **Depois**: ~150-200MB (multi-stage build)

## Próximas Melhorias

1. **Otimização de Cache**
   - Copiar package.json antes de src
   - Docker reutiliza layers

2. **Security**
   - Adicionar user não-root
   - Remover dependências desnecessárias

3. **Performance**
   - Usar node:18-slim ao invés de alpine
   - Adicionar gzip compression
   - Implementar caching

## Troubleshooting

### Erro: "Cannot find module"
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: "Port 3000 already in use"
```bash
# Mudar porta
docker run -p 3001:3000 tiktok-v2:latest
```

### Erro: "Health check failing"
```bash
# Aumentar start period
# Já ajustado para 10s no Dockerfile
# Se ainda falhar, verificar logs:
docker logs <container-id>
```

## Status

✅ Docker build fix aplicado
✅ Multi-stage build configurado
✅ Dependencies limpas
✅ Health check corrigido

Pronto para deploy!
