/**
 * Mapeamento oficial DISC baseado na planilha de cálculo.
 * Cada questão tem mapeamentos DIFERENTES para MAIS e MENOS.
 * '-' significa que aquela alternativa NÃO pontua nada (é descartada do cálculo).
 */
const DISC_MAPPING = {
  1: { MAIS: { A: 'S', B: 'I', C: 'C', D: '-' }, MENOS: { A: 'S', B: '-', C: 'C', D: 'D' } },
  2: { MAIS: { A: 'I', B: 'C', C: 'D', D: '-' }, MENOS: { A: 'I', B: 'C', C: 'D', D: 'S' } },
  3: { MAIS: { A: '-', B: 'D', C: 'S', D: 'I' }, MENOS: { A: 'C', B: 'D', C: '-', D: 'I' } },
  4: { MAIS: { A: 'C', B: 'S', C: '-', D: 'I' }, MENOS: { A: '-', B: 'S', C: 'D', D: 'I' } },
  5: { MAIS: { A: '-', B: 'C', C: '-', D: 'S' }, MENOS: { A: 'I', B: 'C', C: 'D', D: 'S' } },
  6: { MAIS: { A: 'D', B: 'S', C: '-', D: '-' }, MENOS: { A: 'D', B: 'S', C: 'I', D: 'C' } },
  7: { MAIS: { A: '-', B: 'S', C: 'D', D: 'I' }, MENOS: { A: 'C', B: '-', C: 'D', D: 'I' } },
  8: { MAIS: { A: 'D', B: 'I', C: '-', D: '-' }, MENOS: { A: '-', B: '-', C: 'S', D: 'C' } },
  9: { MAIS: { A: 'I', B: 'S', C: 'D', D: 'C' }, MENOS: { A: 'I', B: 'S', C: 'D', D: 'C' } },
  10: { MAIS: { A: 'D', B: 'C', C: '-', D: 'S' }, MENOS: { A: 'D', B: '-', C: 'I', D: 'S' } },
  11: { MAIS: { A: 'I', B: 'S', C: '-', D: 'D' }, MENOS: { A: 'I', B: 'S', C: '-', D: 'D' } },
  12: { MAIS: { A: '-', B: 'D', C: 'C', D: 'S' }, MENOS: { A: 'I', B: 'D', C: '-', D: 'S' } },
  13: { MAIS: { A: 'D', B: 'I', C: 'S', D: '-' }, MENOS: { A: '-', B: 'I', C: 'S', D: 'C' } },
  14: { MAIS: { A: 'C', B: 'D', C: 'I', D: 'S' }, MENOS: { A: 'C', B: '-', C: 'I', D: '-' } },
  15: { MAIS: { A: 'S', B: '-', C: 'C', D: '-' }, MENOS: { A: '-', B: '-', C: 'C', D: 'D' } },
  16: { MAIS: { A: 'I', B: '-', C: '-', D: 'D' }, MENOS: { A: '-', B: 'S', C: 'C', D: 'D' } },
  17: { MAIS: { A: 'C', B: 'S', C: '-', D: 'D' }, MENOS: { A: '-', B: 'S', C: 'I', D: 'D' } },
  18: { MAIS: { A: 'I', B: 'S', C: '-', D: 'D' }, MENOS: { A: '-', B: '-', C: 'C', D: 'D' } },
  19: { MAIS: { A: 'C', B: 'D', C: 'I', D: 'S' }, MENOS: { A: '-', B: 'D', C: 'I', D: 'S' } },
  20: { MAIS: { A: 'D', B: 'C', C: '-', D: 'I' }, MENOS: { A: 'D', B: '-', C: 'S', D: 'I' } },
  21: { MAIS: { A: 'S', B: '-', C: 'D', D: 'C' }, MENOS: { A: 'I', B: 'S', C: 'D', D: 'C' } },
  22: { MAIS: { A: 'I', B: '-', C: 'D', D: 'S' }, MENOS: { A: 'I', B: 'C', C: 'D', D: 'S' } },
  23: { MAIS: { A: 'I', B: 'C', C: 'D', D: '-' }, MENOS: { A: 'I', B: '-', C: 'D', D: 'S' } },
  24: { MAIS: { A: 'D', B: 'S', C: 'I', D: 'C' }, MENOS: { A: 'D', B: 'S', C: 'I', D: 'C' } }
};

/**
 * Tabela de conversão oficial DISC (índice = contagem bruta da letra).
 * ADAPTADO: quanto MAIS a letra aparece, MAIOR a pontuação.
 */
const ADAPTED_TABLE = {
  D: [5, 15, 24, 34, 38, 43, 48, 54, 59, 65, 74, 76, 79, 83, 85, 94, 97, 97, 97, 97, 100, 100],
  I: [8, 20, 35, 43, 57, 68, 73, 82, 87, 91, 96, 96, 96, 96, 96, 96, 96, 100, 100, 100, 100, 100],
  S: [11, 21, 30, 38, 45, 55, 60, 77, 75, 79, 85, 89, 96, 96, 96, 96, 96, 96, 96, 100, 100, 100],
  C: [0, 16, 30, 40, 55, 66, 73, 85, 87, 97, 97, 97, 97, 97, 96, 100, 100, 100, 100, 100, 100, 100],
};

/**
 * NATURAL: quanto MENOS a letra aparece, MAIOR a pontuação (lógica inversa).
 */
const NATURAL_TABLE = {
  D: [100, 87, 75, 67, 60, 54, 47, 42, 40, 32, 28, 25, 22, 15, 11, 8, 5, 5, 5, 5, 5, 2],
  I: [100, 86, 75, 67, 55, 47, 37, 28, 22, 15, 10, 8, 8, 8, 8, 8, 8, 8, 5, 0, 0, 0],
  S: [100, 97, 85, 75, 68, 60, 53, 42, 37, 28, 23, 16, 8, 5, 5, 5, 5, 5, 5, 2, 2, 2],
  C: [100, 97, 83, 75, 66, 58, 52, 45, 38, 33, 23, 15, 7, 5, 5, 5, 0, 0, 0, 0, 0, 0],
};

/**
 * Busca a pontuação na tabela de conversão.
 * @param {Object} table - ADAPTED_TABLE ou NATURAL_TABLE
 * @param {string} letra - 'D', 'I', 'S' ou 'C'
 * @param {number} count - Contagem bruta (0 a 21+)
 * @returns {number} Pontuação convertida
 */
const lookupScore = (table, letra, count) => {
  const arr = table[letra];
  if (!arr) return 0;
  const idx = Math.min(count, arr.length - 1);
  return arr[idx];
};

/**
 * Determina o Perfil Predominante buscando a letra com maior percentual
 */
const getPerfilPredominante = (percentuais) => {
  const perfis = [
    { letra: 'D', nome: 'Dominância (Executor)', valor: percentuais.D },
    { letra: 'I', nome: 'Influência (Comunicador)', valor: percentuais.I },
    { letra: 'S', nome: 'Estabilidade (Planejador)', valor: percentuais.S },
    { letra: 'C', nome: 'Conformidade (Analista)', valor: percentuais.C },
  ];

  perfis.sort((a, b) => b.valor - a.valor);
  return perfis[0].nome;
};

/**
 * Calcula os resultados DISC com base nas respostas.
 * @param {Array} respostas Array de objetos { pergunta: 1, mais: 'A', menos: 'C' }
 */
function calcularDISC(respostas) {
  const adaptadoBruto = { D: 0, I: 0, S: 0, C: 0 };
  const naturalBruto = { D: 0, I: 0, S: 0, C: 0 };

  respostas.forEach((resposta, index) => {
    const numeroPergunta = resposta.pergunta || (index + 1);
    const mapping = DISC_MAPPING[numeroPergunta];

    if (!mapping) return;

    // MAIS -> Ambiente Adaptado
    if (resposta.mais) {
      const letraMais = mapping.MAIS[resposta.mais];
      if (letraMais && letraMais !== '-') {
        adaptadoBruto[letraMais] += 1;
      }
    }

    // MENOS -> Ambiente Natural
    if (resposta.menos) {
      const letraMenos = mapping.MENOS[resposta.menos];
      if (letraMenos && letraMenos !== '-') {
        naturalBruto[letraMenos] += 1;
      }
    }
  });

  // Utiliza a contagem bruta diretamente como pontuação, sem conversão para percentual
  const perfilAdaptado = getPerfilPredominante(adaptadoBruto);
  const perfilNatural = getPerfilPredominante(naturalBruto);

  return {
    ambienteNatural: naturalBruto,
    ambienteAdaptado: adaptadoBruto,
    bruto: { adaptado: adaptadoBruto, natural: naturalBruto },
    perfilPredominanteNatural: perfilNatural,
    perfilPredominanteAdaptado: perfilAdaptado,
    perfilMestre: perfilNatural
  };
}

module.exports = { calcularDISC, DISC_MAPPING, ADAPTED_TABLE, NATURAL_TABLE };
