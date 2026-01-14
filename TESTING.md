# Sistema de Artigos API - Testes

Este documento descreve como executar e trabalhar com os testes do projeto.

## Configuração

O projeto já possui Jest configurado com as dependências necessárias:
- `jest` - Framework de testes
- `ts-jest` - Integração TypeScript com Jest
- `@nestjs/testing` - Utilitários de testes do NestJS
- `supertest` - Biblioteca para testes HTTP

## Estrutura de Testes

```
src/
├── auth/
│   ├── auth.controller.spec.ts      # Testes unitários do controller
│   └── auth.service.spec.ts          # Testes unitários do serviço
├── articles/
│   ├── articles.controller.spec.ts   # Testes unitários do controller
│   └── articles.service.spec.ts      # Testes unitários do serviço
├── users/
│   ├── users.controller.spec.ts      # Testes unitários do controller
│   └── users.service.spec.ts         # Testes unitários do serviço
├── prisma/
│   └── prisma.service.spec.ts        # Testes do serviço Prisma
└── health.controller.spec.ts         # Testes do health check

test/
├── app.e2e-spec.ts                   # Testes end-to-end
└── jest-e2e.json                     # Configuração Jest para E2E
```

## Executar Testes

### Rodar todos os testes unitários
```bash
npm test
```

### Rodar testes em modo watch (re-executa ao salvar)
```bash
npm run test:watch
```

### Rodar testes com cobertura de código
```bash
npm run test:cov
```

### Rodar testes end-to-end
```bash
npm run test:e2e
```

### Rodar testes específicos
```bash
npm test -- articles.service.spec.ts
npm test -- users/
```

### Debug de testes
```bash
npm run test:debug
```

## Cobertura de Testes

A cobertura de testes é gerada na pasta `coverage/`. Você pode visualizar:
```bash
open coverage/lcov-report/index.html
```

## Boas Práticas

1. **Unit Tests**: Testam serviços e controllers isoladamente com mocks
2. **E2E Tests**: Testam a aplicação como um todo através de endpoints HTTP
3. **Mocking**: Utiliza jest.fn() para simular dependências
4. **Describe/It**: Agrupa testes logicamente com describe() e testa comportamentos com it()

## Padrão de Testes

Todos os testes seguem este padrão:

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServiceName]
    }).compile();
    
    service = module.get<ServiceName>(ServiceName);
  });

  describe('methodName', () => {
    it('should do something', async () => {
      const result = await service.methodName(params);
      expect(result).toEqual(expectedValue);
    });
  });
});
```

## CI/CD

Para integração contínua, a pipeline deve executar:
```bash
npm test -- --coverage --watchAll=false
```

## Troubleshooting

Se encontrar problemas com testes:

1. Limpe o cache do Jest:
   ```bash
   npm test -- --clearCache
   ```

2. Instale as dependências novamente:
   ```bash
   npm install
   ```

3. Verifique se o TypeScript está compilando:
   ```bash
   npm run build
   ```
