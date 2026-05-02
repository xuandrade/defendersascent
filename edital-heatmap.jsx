// EditalHeatmap — derived from checkbox state on the syllabus matrix.
// - Cores escalonam: 0=vermelho, 1=laranja, 2=amarelo, 3=verde, 4=azul, 5=violeta(dominado)
//   (Discursiva tem só 3 flags → 0=vermelho, 1=amarelo, 2=azul, 3=violeta)
// - Decaimento temporal: se 'lastStudiedAt' > REVIEW_DAYS dias, célula pulsa pedindo revisão
// - Não é mais clicável pra trocar estado: estado vem do checkbox da matriz acima

const REVIEW_DAYS = 30; // dias sem tocar antes do glow de revisão começar

// Mapas de cor por número de checks (Objetiva = 5 níveis, Discursiva = 3 níveis)
const PALETTE_OBJ = [
  { bg: 'rgba(255,61,80,0.13)',  border: 'rgba(255,61,80,0.50)',  text: '#9a1727',  label: 'Não estudei' },
  { bg: 'rgba(255,122,26,0.15)', border: 'rgba(255,122,26,0.55)', text: '#a14e0c',  label: 'Iniciado' },
  { bg: 'rgba(245,200,11,0.20)', border: 'rgba(245,180,11,0.65)', text: '#7a5d00',  label: 'Em construção' },
  { bg: 'rgba(0,196,106,0.18)',  border: 'rgba(0,196,106,0.60)',  text: '#005a30',  label: 'Bom domínio' },
  { bg: 'rgba(0,184,212,0.18)',  border: 'rgba(0,184,212,0.60)',  text: '#005566',  label: 'Quase lá' },
  { bg: 'rgba(139,61,255,0.20)', border: 'rgba(139,61,255,0.70)', text: '#3a0a7a',  label: 'Dominado', shimmer: true },
];

const PALETTE_DISC = [
  { bg: 'rgba(255,61,80,0.13)',  border: 'rgba(255,61,80,0.50)',  text: '#9a1727',  label: 'Não estudei' },
  { bg: 'rgba(245,200,11,0.20)', border: 'rgba(245,180,11,0.65)', text: '#7a5d00',  label: 'Em construção' },
  { bg: 'rgba(0,184,212,0.18)',  border: 'rgba(0,184,212,0.60)',  text: '#005566',  label: 'Quase lá' },
  { bg: 'rgba(139,61,255,0.20)', border: 'rgba(139,61,255,0.70)', text: '#3a0a7a',  label: 'Dominado', shimmer: true },
];

function _daysSince(iso) {
  if (!iso) return Infinity;
  const then = new Date(iso);
  const now = new Date();
  return Math.floor((now - then) / 86400000);
}

// Decide se a célula deve pulsar pedindo revisão
function _needsReview(topic, flags) {
  const checks = flags.filter(f => topic[f]).length;
  if (checks === 0) return false; // não começou ainda — não pede revisão
  const days = _daysSince(topic.lastStudiedAt);
  return days >= REVIEW_DAYS;
}

function EditalHeatmap({ subjects, mode = 'objetiva' }) {
  const isObj = mode === 'objetiva';
  const flags = isObj ? ['lei', 'doutrina', 'juris', 'questoes', 'revisao'] : ['estudado', 'grifado', 'questoes'];
  const palette = isObj ? PALETTE_OBJ : PALETTE_DISC;
  const maxChecks = flags.length;

  const allTopics = subjects.flatMap(s => s.topics.map(t => ({ ...t, subjectId: s.id })));
  const masteredCount = allTopics.filter(t => flags.filter(f => t[f]).length === maxChecks).length;
  const studiedCount = allTopics.filter(t => {
    const c = flags.filter(f => t[f]).length;
    return c > 0 && c < maxChecks;
  }).length;
  const unseenCount = allTopics.length - masteredCount - studiedCount;
  const needsReviewCount = allTopics.filter(t => _needsReview(t, flags)).length;
  const overallPct = allTopics.length ? (masteredCount / allTopics.length) * 100 : 0;

  return (
    <div className="glass" style={{ padding: 18 }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
            DOMINÂNCIA POR TÓPICO · {isObj ? 'OBJETIVA' : 'DISCURSIVA'}
          </div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>
            Heatmap do Edital
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {palette.map((p, i) => (
            <Legend key={i} bg={p.bg} border={p.border}
              label={`${i}${i === maxChecks ? ' (top)' : ''}`}
              shimmer={p.shimmer} />
          ))}
          <Legend bg="rgba(245,158,11,0.15)" border="rgba(245,158,11,0.7)" label="✦ revisar" reviewGlow />
        </div>
      </div>

      {/* Linha de métricas */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 10.5, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', flexWrap: 'wrap', gap: 6 }}>
          <span>
            <span style={{ color: '#3a0a7a', fontWeight: 700 }}>{masteredCount}</span> dominados ·{' '}
            <span style={{ color: '#005566', fontWeight: 700 }}>{studiedCount}</span> em progresso ·{' '}
            <span style={{ color: '#9a1727', fontWeight: 700 }}>{unseenCount}</span> intocados
            {needsReviewCount > 0 && (
              <> · <span style={{ color: '#a14e0c', fontWeight: 700, textShadow: '0 0 6px rgba(255,193,7,0.4)' }}>
                ✦ {needsReviewCount} pedem revisão
              </span></>
            )}
          </span>
          <span className="num" style={{ color: 'var(--neon-violet)', fontWeight: 700 }}>{overallPct.toFixed(1)}%</span>
        </div>
        <div style={{ height: 5, background: 'rgba(12,13,18,0.06)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${overallPct}%`, background: 'linear-gradient(90deg, #ff3d50, #ff7a1a, #f5c80b, #00c46a, #00b8d4, #8b3dff)', boxShadow: '0 0 8px rgba(139,61,255,0.4)', transition: 'width 600ms ease' }} />
        </div>
      </div>

      {/* Grid por disciplina */}
      <div style={{ display: 'grid', gap: 14 }}>
        {subjects.map(s => {
          const subjMastered = s.topics.filter(t => flags.filter(f => t[f]).length === maxChecks).length;
          return (
            <div key={s.id}>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', marginBottom: 6, fontWeight: 600 }}>
                {s.name}
                <span className="num" style={{ marginLeft: 8, color: 'var(--text-dim)', fontWeight: 400, fontSize: 10 }}>
                  {subjMastered}/{s.topics.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 5 }}>
                {s.topics.map(t => {
                  const checks = flags.filter(f => t[f]).length;
                  const p = palette[checks];
                  const review = _needsReview(t, flags);
                  const days = _daysSince(t.lastStudiedAt);
                  const daysLabel = isFinite(days) ? `${days}d` : '—';
                  const title = `${t.name}\n${p.label} · ${checks}/${maxChecks}\nÚltima atividade: ${daysLabel}${review ? ' · pede revisão!' : ''}`;
                  const cls = [
                    'edital-cell',
                    review ? 'review-glow' : '',
                    p.shimmer && !review ? 'mastered-shimmer' : '',
                  ].filter(Boolean).join(' ');
                  return (
                    <div key={t.id}
                      className={cls}
                      title={title}
                      style={{
                        background: p.bg,
                        border: `1px solid ${p.border}`,
                        color: p.text,
                        borderRadius: 7,
                        minHeight: 46,
                        padding: '6px 8px',
                        fontSize: 10,
                        lineHeight: 1.2,
                        fontWeight: 600,
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'background 300ms ease, border-color 300ms ease, color 300ms ease',
                        cursor: 'help',
                      }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {t.name}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 3, left: 6,
                        fontSize: 8.5, opacity: 0.65,
                        fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                        letterSpacing: '0.04em',
                      }}>
                        {checks}/{maxChecks}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rodapé explicativo */}
      <div style={{ marginTop: 12, fontSize: 10, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.05em', lineHeight: 1.5 }}>
        AS CORES ATUALIZAM SOZINHAS À MEDIDA QUE VOCÊ MARCA OS CHECKBOXES DA MATRIZ DO EDITAL ACIMA.
        <br />
        TÓPICOS SEM ATIVIDADE HÁ MAIS DE {REVIEW_DAYS} DIAS COMEÇAM A BRILHAR ✦ PEDINDO REVISÃO.
      </div>
    </div>
  );
}

function Legend({ bg, border, label, shimmer, reviewGlow }) {
  const cls = [
    reviewGlow ? 'review-glow' : '',
    shimmer ? 'mastered-shimmer' : '',
  ].filter(Boolean).join(' ');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
      <div className={cls} style={{
        width: 12, height: 12, borderRadius: 3,
        background: bg, border: `1px solid ${border}`,
      }} />
      {label}
    </div>
  );
}

window.EditalHeatmap = EditalHeatmap;
