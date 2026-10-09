# Registro de Horário

Aplicativo web para registrar horário de entrada e saída com um toque, sem digitar nada. Os registros ficam salvos em uma planilha Google, então funcionam entre aparelhos diferentes e podem ser conferidos a qualquer momento.

**Acesse:** https://carolinacastrodacosta.github.io/Registro_de_horario/

## O que ele faz

- Botões **Bater entrada** e **Bater saída** que gravam a hora atual.
- Relógio em tempo real e resumo do dia (entrada e saída de hoje).
- Tabela da semana (segunda a sexta) com os horários já registrados.
- Sinalização de saídas depois das 16h30.
- Correção manual de um horário batido errado.

## Como funciona (em linguagem simples)

Pense num restaurante:

- O **aplicativo** é o cardápio: onde a pessoa escolhe "bater entrada" ou "bater saída".
- A **planilha Google** é o caderno da cozinha: onde tudo fica anotado.
- A **API** é o garçom: leva o pedido do aplicativo até a planilha, anota o horário no dia certo e traz a confirmação de volta.

## Arquitetura

```
Navegador (index.html + style.css, GitHub Pages)
        │  fetch (GET, JSON)
        ▼
Google Apps Script (Code.gs, publicado como App da Web)
        │  SpreadsheetApp
        ▼
Google Sheets (aba "Pontos": data | entrada | saida)
```

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5, CSS3 e JavaScript puro, hospedado no GitHub Pages |
| API | Google Apps Script (`Code.gs`) publicado como App da Web |
| Banco de dados | Google Sheets |

## API

Um único endereço (a URL do App da Web) atende duas operações via `GET`. Toda chamada precisa do parâmetro `token`.

**Listar registros**

```
GET <URL>?token=<TOKEN>
→ {"rows":[{"date":"2026-10-08","entrada":"07:30","saida":"16:00"}]}
```

**Gravar um horário**

```
GET <URL>?token=<TOKEN>&action=set&date=2026-10-08&field=entrada&time=07:30
→ {"ok":true}
```

- `field` aceita `entrada` ou `saida`.
- Se a data ainda não existe na planilha, uma linha nova é criada.
- Respostas de erro: `{"error":"unauthorized"}`, `{"error":"missing_fields"}`, `{"error":"invalid_field"}`.

## Decisões técnicas

- **Gravação via GET, não POST.** Um POST feito de outro site para o Apps Script esbarra em bloqueio de CORS no redirecionamento interno do Google. O GET não sofre desse problema, então leitura e escrita passam pela mesma rota.
- **Horários como texto.** O Google Sheets converte `"07:30"` em data/hora interna (base 1899-12-30). A gravação força o formato de texto na célula e a leitura extrai só `HH:mm`, para o horário voltar igual ao que foi salvo.
- **Sem servidor próprio.** Não há backend para manter: o Apps Script roda no Google e o front-end é um site estático.

## Como colocar no ar

1. Crie uma planilha no Google Sheets.
2. Abra **Extensões > Apps Script**, cole o conteúdo de `Code.gs` e salve.
3. Troque o valor de `TOKEN` em `Code.gs` por uma chave sua.
4. Vá em **Implantar > Nova implantação**, tipo **App da Web**, executar como **Eu** e acesso para **Qualquer pessoa**. Copie a URL gerada.
5. Em `index.html`, cole a URL em `API_URL` e use a mesma chave em `API_TOKEN`.
6. No repositório, ative **Settings > Pages** apontando para a branch `main`.

Ao alterar o `Code.gs` depois, use **Implantar > Gerenciar implantações > editar > Nova versão** para manter a mesma URL.

## Limitações conhecidas

- O `token` fica visível no código do site, então só impede acessos casuais. Serve para um controle de ponto doméstico, mas não é autenticação de verdade. Para dados sensíveis, seria preciso login por usuário.
- Quem tiver o link do aplicativo e o token consegue gravar horários. Não compartilhe o link publicamente.
- O app registra o horário do aparelho de quem toca no botão.

## Desenvolvimento

Projeto desenvolvido com apoio de IA generativa (Claude), da interface à integração com a API do Google e à depuração de CORS e de formatação de datas.
