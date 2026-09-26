# Flowix — sistema visual da landing

Fonte medida nos ficheiros de marca (26 set 2026). O logótipo SVG manda nas cores. Posts e banners confirmam o uso. O template Word não entra nesta paleta.

## O que não muda

- Tinta `#01010d`, azul `#1a6eff`, branco `#ffffff`.
- O mark: quadrados ligados por traços a ~45°, sempre em `#1a6eff`.
- Wordmark a tinta no claro, a branco no escuro. Nunca o wordmark a azul.
- Voz: fluxos, modernidade, velocidade, eficiência.
- Frase de marca já usada: **Automatizamos o presente. Libertamos o futuro.**

## O que pode variar no site

Layout, secções, ritmo e templates. Desde que a paleta, o logótipo e a voz se mantenham.

## Paleta

| Token | Hex | Origem | Uso |
|---|---|---|---|
| `--fx-ink` | `#01010d` | SVG `.cls-1` do logo a tinta | Fundo principal, texto no claro |
| `--fx-blue` | `#1a6eff` | SVG do mark | Mark, ênfase curta, linhas de fluxo |
| `--fx-white` | `#ffffff` | SVG do wordmark claro | Texto no escuro, fundo claro |
| `--fx-surface` | `#07091a` | Derivado | Cartões sobre o ink, para separar planos |
| `--fx-text-muted` | branco a 72% | Derivado | Texto secundário no escuro |

O fundo dos posts, do wallpaper e do banner é este ink, não um azul-marinho genérico. A amostragem dos pixels cai em `#000010` / `#001020` por causa do antialiasing e do brilho azul. O valor oficial continua a ser `#01010d`.

### Contraste (calculado)

| Par | Rácio | Regra |
|---|---|---|
| `#1a6eff` sobre `#01010d` | 4.66:1 | Passa AA para texto normal. Serve para ênfase. |
| `#1a6eff` sobre `#ffffff` | 4.45:1 | Falha AA para texto pequeno (limite 4.5). Serve para títulos grandes e para o mark. |
| `#ffffff` sobre `#01010d` | 20.76:1 | Texto de corpo no escuro. |

Não escurecer o azul da marca para “passar o contraste”. No claro, o corpo do texto é tinta. O azul fica para o mark, para uma palavra de ênfase em título, e para controlos grandes.

## Logótipo

Ficheiros em `brand/logos/`:

| Ficheiro | Quando |
|---|---|
| `logo-full-light.svg` | Fundo escuro. Wordmark branco + mark azul. |
| `logo-full-ink.svg` | Fundo claro. Wordmark tinta + mark azul. |
| `logo-fx-light.svg` | Espaço pequeno no escuro. “Fx” + mark. |
| `logo-fx-ink.svg` | Espaço pequeno no claro. |

O wordmark é geometria (paths), não uma webfont. Não reconstruir “Flowix” com uma fonte por cima do mark.

## Tipografia de interface

Os ZIPs não trazem o ficheiro de fonte dos posts. O template Word usa Calibri e o tema azul do Office (`#4472C4`, `#44546A`). Isso é omissão do template, não a marca.

A interface usa **Outfit**. Confirmado no flowix.pt atual (Framer carrega Outfit 300/400/500). Uma família só.

## Forma e movimento

Leitura: landing B2B de automação, linguagem escura e técnica, energia de fluxo.

- Variância 6, movimento 6, densidade 4.
- Motivo principal: as linhas de fluxo do banner (curvas finas em azul sobre tinta), não a malha de pontos do wallpaper.
- Cantos curtos. O mark é quadrado. Controlos no máximo a 8px. Sem pills.
- Movimento: um traço que percorre uma ligação entre nós, e um drift lento das linhas de fluxo. Com `prefers-reduced-motion`, fica parado.
- O site é escuro primeiro, como os posts e o banner. O claro existe para documentos e para uma secção de respiro, não como tema por defeito.

### Fundo do hero

Calmo em repouso, uma ideia de cada vez.

- Estrelas como no flowix.pt atual, ténues, com parallax leve.
- Constelação de fluxo: alguns pontos são nós quadrados (o mark). Em repouso parecem estrelas. De vez em quando acende-se um caminho a 45° entre dois nós e apaga-se. No máximo 2 fluxos ao mesmo tempo.
- A fita de linhas dos posts só em ecrãs ≥ 1000px, a meia intensidade. Em mobile torce-se e cai sobre o conteúdo.
- Nada passa por trás do texto, do cartão nem dos logos dos parceiros.

### Sistema editorial (anti-template)

Revisto em 26 set 2026 depois de uma auditoria de design. O que faz uma página parecer gerada por IA, e a regra que o substitui:

| Evitar | Usar |
|---|---|
| Chip com borda e ponto a brilhar por cima de cada título | Índice em texto simples na linha fina da secção: `01 / Soluções` (12px, 500, maiúsculas, `tabular-nums`) |
| Tudo centrado | Grelha de 12 colunas: índice nas colunas 1–3, título nas 4–12, alinhado à esquerda |
| Muitos brilhos azuis e `backdrop-filter` | Um só brilho na página: a linha do Método |
| Cartões com ícone dentro de um quadrado arredondado | Linhas editoriais separadas por filetes |
| Cantos de 12–18px | Cartões 4px, controlos 6px, nós 1px |
| Títulos e botões todos com peso 500 | H1/H2 a 400 grandes (`-0.045em`), H3 e rótulos a 500 |
| Mesmos números repetidos em várias secções | Cada número aparece uma vez (Impacto) |

## Voz

Combinar fluxo com velocidade e eficiência. Frases curtas. Uma ideia por bloco.

Exemplos já publicados, para não inventar outro slogan:

- Automatizamos o presente. Libertamos o futuro.
- A inteligência artificial é o novo fluxo da automação de serviços.

## Acento de fluxo (a confirmar)

Os posts de 2026 (série "Post de Abertura", 7 de 9 posts) sublinham a legenda com um degradê `#03d8ba` → `#7e32cb`. A landing usa-o como `--fx-flow`, só em decoração (sublinhados, barras de progresso), nunca em texto. Se a marca não o quiser, basta trocar o token.

O flowix.pt atual e os destaques dos posts usam `#006eff` nos botões; o logótipo usa `#1a6eff`. A landing segue o logótipo.

## Fora da paleta

- Tema do Word (Calibri e azuis Office).
- Wallpapers gerados e pitches em PDF. Servem de referência de clima, não de cor oficial.

## Ficheiros

- `brand/tokens.css` — variáveis para a landing.
- `brand/board.html` — quadro para ver a paleta e os logos.
- `brand/logos/` — SVG oficiais.
