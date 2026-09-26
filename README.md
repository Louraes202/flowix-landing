# flowix-landing

Nova landing page da [Flowix](https://flowix.pt).

A marca está em [`brand/DESIGN.md`](brand/DESIGN.md): tinta `#01010d`, azul `#1a6eff`, branco `#ffffff`. O quadro visual abre em `brand/board.html`.

## Site

A landing está em [`site/`](site/): HTML, CSS e JS sem dependências nem build.

```bash
cd site && python -m http.server 5173   # abre http://127.0.0.1:5173
```

- `index.html` — conteúdo (todo o texto do flowix.pt atual, mais FAQ).
- `styles.css` — tokens copiados de `brand/tokens.css` no topo.
- `main.js` — fundo de fluxo em canvas, fluxo ao vivo do hero, reveals e demos. Respeita `prefers-reduced-motion`.
- O formulário ainda não tem backend: abre o email do visitante para `geral@flowix.pt`. Para ligar a um webhook, troca o `mailto` em `main.js`.

