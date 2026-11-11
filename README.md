# Teste de Performance — Catálogo de Produtos (JMeter)

Trabalho de QA de Software: aplicação simples publicada na Vercel + teste de carga com Apache JMeter simulando 20 usuários virtuais simultâneos.

## 🔗 Links

- **Aplicação (produção):** https://catalogo-produtos-beta.vercel.app
- **Dashboard do teste de carga (gráficos gerados pelo JMeter):** https://cauanb26.github.io/catalogo-produtos-jmeter/

## 📁 Estrutura do repositório

- `catalogo-produtos/` — código-fonte do app (página estática + 2 endpoints serverless em Node.js)
- `teste-carga.jmx` — script do Apache JMeter (Test Plan completo)
- `resultado.jtl` — log bruto da execução do teste (formato JMeter, pode ser reaberto no JMeter)
- `docs/` — relatório HTML gerado pelo JMeter (também publicado como site via GitHub Pages, link acima)

## 🖥️ Sobre a aplicação

Catálogo de produtos simples, com 4 rotas:

| Rota | Método | Descrição |
|---|---|---|
| `/` | GET | Página com lista de produtos e formulário para adicionar |
| `/api/health` | GET | Verificação rápida, sem latência artificial (baseline) |
| `/api/items` | GET | Lista produtos (latência simulada de 50–200ms, imitando consulta a banco) |
| `/api/items` | POST | Cria um novo produto (mesma latência simulada) |

Hospedado na Vercel (plano Hobby/gratuito, conta pessoal). Os dados ficam em memória em cada função serverless — não há banco real, o foco é medir desempenho, não persistência.

## ⚙️ Sobre o teste de carga (JMeter)

Configuração do Thread Group em `teste-carga.jmx`:

- **20 threads** (usuários virtuais simultâneos)
- **Ramp-up:** 5 segundos
- **10 loops** por usuário
- **Total:** 800 requisições (200 por endpoint, nas 4 rotas acima)
- Relatórios: Aggregate Report, Summary Report e View Results Tree (desabilitado por padrão)

### Como reproduzir

Com o [Apache JMeter](https://jmeter.apache.org/) instalado (versão usada: 5.6.3):

```bash
jmeter -n -t teste-carga.jmx -l resultado.jtl -e -o docs
```

Rodar em modo não-GUI (`-n`) é o recomendado — o modo GUI consome recursos e distorce os tempos medidos.

## 📊 Resultados

| Endpoint | Requisições | Erro % | Tempo médio | p90 | Vazão |
|---|---|---|---|---|---|
| `GET /` | 200 | 0% | 73ms | 142ms | 16,3/s |
| `GET /api/health` | 200 | 0% | 179ms | 220ms | 17,1/s |
| `GET /api/items` | 200 | 0% | 305ms | 387ms | 16,5/s |
| `POST /api/items` | 200 | 0% | 303ms | 393ms | 16,3/s |
| **Total** | **800** | **0%** | **215ms** | **360ms** | **59,6/s** |

## 📝 Análise

- **Taxa de erros:** 0% nas 800 requisições — a aplicação se manteve estável sob carga de 20 usuários simultâneos, sem timeouts nem respostas de erro (4xx/5xx).
- **Tempo de resposta:** o endpoint `/api/health` (sem processamento artificial) respondeu em ~179ms em média, refletindo o overhead de rede somado ao cold start da função serverless na Vercel. Já os endpoints `/api/items` (GET e POST), que simulam 50–200ms de latência de "banco de dados", responderam em ~303–305ms — a diferença de ~125ms confirma que o atraso artificial está corretamente refletido no tempo total de resposta.
- **Vazão (throughput):** ~59,6 requisições/segundo no total. O p90 (360ms) é menos de 2x a média (215ms), indicando baixa variabilidade — os 20 usuários virtuais não geraram fila perceptível nem degradação progressiva.
- **Conclusão:** para uma carga de 20 usuários simultâneos, a aplicação demonstrou desempenho estável e sem erros. O maior contribuinte para o tempo de resposta foi a latência artificial inserida nos endpoints de dados, não a infraestrutura em si — ou seja, o gargalo observado é do "negócio" simulado, não da hospedagem.

---

Desenvolvido para a disciplina de QA de Software — Ibmec.
