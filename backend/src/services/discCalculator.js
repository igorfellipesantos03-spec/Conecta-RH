/**
 * Helper: Converte a pontuação bruta (0 a 24) de D, I, S, ou C para um percentual (0 a 100)
 * baseado na tabela tradicional DISC. Aqui usamos uma simplificação:
 * Pontuação Máxima Possível teórica por letra = 24.
 * Fator de conversão = (Pontuação Bruta / 24) * 100
 * @param {number} score Bruto
 * @returns {number} Percentual
 */
const calcularPercentual = (score) => {
  const maxScore = 24;
  return Math.round((score / maxScore) * 100);
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

  // Ordena do maior para o menor
  perfis.sort((a, b) => b.valor - a.valor);
  return perfis[0].nome;
};

/**
 * Calcula os resultados DISC com base nas respostas.
 * @param {Array} respostas Array de objetos { mais: 'D', menos: 'S' }
 * Exemplo de payload esperado:
 * [ { mais: 'D', menos: 'I' }, { mais: 'S', menos: 'C' }, ... ] até 24 itens.
 */
function calcularDISC(respostas) {
  // Ambiente Adaptado = Foco nas respostas "Mais" (+)
  const adaptadoBruto = { D: 0, I: 0, S: 0, C: 0 };
  
  // Ambiente Natural = Foco nas respostas "Menos" (-)
  // Na teoria clássica, o "Menos" representa as características que a pessoa evita ou tem de nascença "ao contrário".
  // Para fins deste mock-up, mapeamos a contagem reversa ou direta conforme solicitado.
  const naturalBruto = { D: 0, I: 0, S: 0, C: 0 };

  // Iterar pelas 24 respostas e acumular as pontuações brutas
  respostas.forEach(resposta => {
    if (resposta.mais && adaptadoBruto[resposta.mais] !== undefined) {
      adaptadoBruto[resposta.mais] += 1;
    }
    if (resposta.menos && naturalBruto[resposta.menos] !== undefined) {
      naturalBruto[resposta.menos] += 1;
    }
  });

  // Converter para Percentuais
  const adaptadoPercentual = {
    D: calcularPercentual(adaptadoBruto.D),
    I: calcularPercentual(adaptadoBruto.I),
    S: calcularPercentual(adaptadoBruto.S),
    C: calcularPercentual(adaptadoBruto.C),
  };

  const naturalPercentual = {
    D: calcularPercentual(naturalBruto.D),
    I: calcularPercentual(naturalBruto.I),
    S: calcularPercentual(naturalBruto.S),
    C: calcularPercentual(naturalBruto.C),
  };

  const perfilAdaptado = getPerfilPredominante(adaptadoPercentual);
  const perfilNatural = getPerfilPredominante(naturalPercentual);

  return {
    ambienteNatural: naturalPercentual,
    ambienteAdaptado: adaptadoPercentual,
    perfilPredominanteNatural: perfilNatural,
    perfilPredominanteAdaptado: perfilAdaptado,
    // Geralmente o Perfil Natural dita a essência da pessoa:
    perfilMestre: perfilNatural 
  };
}

module.exports = { calcularDISC };
