# Sua Aplicação - Especificação

## 📋 Visão Geral

Descreva brevemente sua aplicação aqui.

**Stack:** .NET 10 (somente backend)

---

## 🎯 Requisitos Funcionais

### REQ-001: [Descrição do Requisito]
- Sub-requisito 1
- Sub-requisito 2
- Sub-requisito 3

### REQ-002: [Descrição do Requisito]
- Sub-requisito 1
- Sub-requisito 2

---

## 🏗️ Regras de Negócio

### BR-001: [Regra de Negócio]
Descrição detalhada da regra.

### BR-002: [Regra de Negócio]
Descrição detalhada da regra.

---

## 🗄️ Modelo de Dados

### Entidade 1
- Id (UUID)
- Nome (string, required)
- Descricao (string, nullable)
- DataCriacao (DateTime)
- Ativo (bool)

### Entidade 2
- Id (UUID)
- EntidadeId (FK)
- Status (enum: Ativo, Inativo)
- DataAtualizacao (DateTime)

---

## 📡 Endpoints Principais

### Listar
- `GET /api/recursos` - Listar com paginação

### Criar
- `POST /api/recursos` - Criar novo

### Detalhes
- `GET /api/recursos/{id}` - Obter um

### Atualizar
- `PUT /api/recursos/{id}` - Atualizar

### Deletar
- `DELETE /api/recursos/{id}` - Deletar

---

## 🧪 Testes

Cobertura mínima: 80% da Application Layer

- [ ] Testes unitários
- [ ] Testes de integração
- [ ] Testes E2E

---

## 🔒 Segurança

- [ ] Autenticação JWT
- [ ] Validação de entrada
- [ ] Rate limiting
- [ ] HTTPS em produção

---

## ✅ Critérios de Aceitar

- [ ] Todos os endpoints funcionando
- [ ] Validações funcionando
- [ ] Testes com 80%+ cobertura
- [ ] Código segue SOLID
- [ ] Sem vulnerabilidades críticas

---

**Pronto para orquestração!** 🚀

Edite este arquivo e chame:
```
/inicia-orquestracao
```
