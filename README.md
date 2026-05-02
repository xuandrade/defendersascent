# Defender's Ascent — Release com Heatmap do Edital v2

## O que mudou nesta versão

### 🎨 Heatmap do Edital — agora atualiza automaticamente

A cor de cada célula é derivada **automaticamente** do número de checkboxes marcados na Matriz do Edital acima. Não precisa mais clicar duas vezes (uma na matriz e outra no heatmap).

**Escala de cores Objetiva (5 checkboxes):**

| Checks | Cor       | Estado          |
|--------|-----------|-----------------|
| 0      | 🔴 Vermelho | Não estudei     |
| 1      | 🟠 Laranja  | Iniciado        |
| 2      | 🟡 Amarelo  | Em construção   |
| 3      | 🟢 Verde    | Bom domínio     |
| 4      | 🔵 Azul     | Quase lá        |
| 5      | 🟣 Violeta + shimmer | Dominado |

**Escala Discursiva (3 checkboxes):** vermelho → amarelo → azul → violeta.

### ✨ Glow de revisão pendente

Tópicos sem nenhum check tocado nos **últimos 30 dias** começam a pulsar com um glow âmbar suave e um asterisco ✦ no canto, te chamando pra revisar. Quando você marca/desmarca qualquer checkbox do tópico, o `lastStudiedAt` é atualizado e o glow some.

### 🔊 Som + confete satisfatórios nos checkboxes

- **Check normal:** chime cristalino (C6+E6 → G6+B6) + confete leve + +5 XP.
- **Atingiu 5/5 (tópico dominado):** acorde maior triunfante de Ré + confete maior + +5 XP + bônus de "Mestre" (+25 XP via `onMaster`).

### 📊 Heatmap também na Discursiva

O componente foi generalizado e renderiza tanto em Objetiva quanto em Discursiva, adaptando a escala de níveis automaticamente.

### 🏆 Nova seção "Totais Acumulados"

Antes do Backup, um painel novo com 6 cards mostra desde o início:
- Horas estudadas (com nº de dias ativos)
- Questões resolvidas
- Revisões / Flashcards
- Checks no edital (Objetiva + Discursiva)
- Tópicos dominados (Obj + Disc)
- Tópicos pedindo revisão (>30d sem atividade)

---

## Arquivos modificados nesta versão

- `app.jsx` — backfill de `lastStudiedAt`, EditalHeatmap nos dois modos, nova `TotalsSection`
- `edital-heatmap.jsx` — reescrita: cores derivadas, decaimento temporal, glow
- `syllabus-matrix.jsx` — toggle agora seta `lastStudiedAt`, sons novos, celebração ao 5/5
- `syllabus-disc.jsx` — mesma lógica para Discursiva (3/3)
- `splash.jsx` — adicionadas `playCheckChime()` e `playTopicMastered()`
- `styles.css` — keyframes `review-glow` e `mastered-shimmer`

## Arquivos não modificados (mantidos do upload original)

- `index.html`, `data.jsx`, `icons.jsx`, `pet.jsx`, `header.jsx`,
  `metrics-row.jsx`, `gavel-bar.jsx`, `heatmaps.jsx`, `interactions.jsx`,
  `tweaks-panel.jsx`, `shield-badge.jsx`, `concurso-timeline.jsx`
- `backup.jsx` — placeholder (o `BackupSection` real está em `app.jsx`)

---

## Como subir no GitHub

1. Baixe o ZIP e descompacte.
2. Suba os arquivos para o seu repositório (substituindo os antigos).
3. O Vercel detecta automaticamente e faz o deploy.

## Como testar antes de subir

Pra forçar o glow de revisão sem esperar 30 dias, abra o console do navegador no app e rode:

```js
const o = JSON.parse(localStorage.getItem('da_v3_objetiva'));
o.subjects[0].topics[0].lastStudiedAt = new Date(Date.now() - 60*86400000).toISOString();
localStorage.setItem('da_v3_objetiva', JSON.stringify(o));
location.reload();
```
